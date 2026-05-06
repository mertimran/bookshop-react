/**
 * Generates db/data/bookshop-Shipments.csv from existing orders. For each
 * shipped/delivered order, assigns a route from a pool of warehouse→city pairs,
 * computing the actual road geometry via OSRM's public demo. Routes are cached
 * to scripts/.cache/routes.json so re-runs don't hammer the demo server.
 *
 * Run: npx tsx scripts/seed-shipments.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { randomUUID, createHash } from 'node:crypto'

interface City {
  name: string
  lat: number
  lng: number
}

const WAREHOUSES: City[] = [
  { name: 'Berlin Distribution Hub', lat: 52.520008, lng: 13.404954 },
  { name: 'Munich Distribution Hub', lat: 48.137154, lng: 11.576124 },
  { name: 'Hamburg Distribution Hub', lat: 53.551086, lng: 9.993682 },
  { name: 'Frankfurt Distribution Hub', lat: 50.110924, lng: 8.682127 },
  { name: 'Cologne Distribution Hub', lat: 50.937531, lng: 6.960279 },
]

const DESTINATIONS: City[] = [
  { name: 'Leipzig', lat: 51.339695, lng: 12.373075 },
  { name: 'Stuttgart', lat: 48.775846, lng: 9.182932 },
  { name: 'Düsseldorf', lat: 51.227741, lng: 6.773456 },
  { name: 'Dresden', lat: 51.050407, lng: 13.737262 },
  { name: 'Nuremberg', lat: 49.452103, lng: 11.076665 },
  { name: 'Bremen', lat: 53.079296, lng: 8.801694 },
  { name: 'Hannover', lat: 52.375892, lng: 9.732010 },
  { name: 'Mannheim', lat: 49.487459, lng: 8.466040 },
]

interface RouteData {
  coords: [number, number][] // [lng, lat]
  durationSec: number
  distanceM: number
}

interface RouteKey {
  key: string
  origin: City
  dest: City
}

function routeKey(origin: City, dest: City) {
  return `${origin.name}__${dest.name}`
}

function allRouteKeys(): RouteKey[] {
  const keys: RouteKey[] = []
  for (const o of WAREHOUSES) {
    for (const d of DESTINATIONS) {
      keys.push({ key: routeKey(o, d), origin: o, dest: d })
    }
  }
  return keys
}

const CACHE_PATH = resolve(__dirname, '.cache', 'routes.json')

function loadCache(): Record<string, RouteData> {
  if (!existsSync(CACHE_PATH)) return {}
  return JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
}

function saveCache(cache: Record<string, RouteData>) {
  mkdirSync(dirname(CACHE_PATH), { recursive: true })
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
}

async function fetchRoute(origin: City, dest: City): Promise<RouteData> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${origin.lng},${origin.lat};${dest.lng},${dest.lat}` +
    `?overview=full&geometries=geojson`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`OSRM ${res.status}`)
  const data = (await res.json()) as any
  if (data.code !== 'Ok' || !data.routes?.[0]) {
    throw new Error(`OSRM no route for ${origin.name} → ${dest.name}`)
  }
  const r = data.routes[0]
  return {
    coords: r.geometry.coordinates as [number, number][],
    durationSec: r.duration,
    distanceM: r.distance,
  }
}

async function buildRoutePool(): Promise<Record<string, RouteData>> {
  const cache = loadCache()
  const keys = allRouteKeys()
  let fetched = 0
  for (const { key, origin, dest } of keys) {
    if (cache[key]) continue
    try {
      const route = await fetchRoute(origin, dest)
      cache[key] = route
      fetched++
      console.log(`  ✓ ${key} — ${(route.distanceM / 1000).toFixed(0)} km, ${(route.durationSec / 60).toFixed(0)} min`)
      // Be a polite citizen of the public demo server.
      await new Promise((r) => setTimeout(r, 1100))
    } catch (e) {
      console.warn(`  ✗ ${key} — ${(e as Error).message}`)
    }
  }
  if (fetched > 0) {
    saveCache(cache)
    console.log(`Cached ${Object.keys(cache).length} routes (${fetched} new) → ${CACHE_PATH}`)
  } else {
    console.log(`Cache hit for all ${Object.keys(cache).length} routes`)
  }
  return cache
}

interface OrderRow {
  ID: string
  status: string
}

function parseOrders(): OrderRow[] {
  const csv = readFileSync(resolve(__dirname, '..', 'db/data/bookshop-Orders.csv'), 'utf8')
  const lines = csv.trim().split('\n')
  const header = lines[0].split(',')
  const idIdx = header.indexOf('ID')
  const statusIdx = header.indexOf('status')
  return lines.slice(1).map((line) => {
    const cols = line.split(',')
    return { ID: cols[idIdx], status: cols[statusIdx] }
  })
}

interface StatusEventRow {
  order_ID: string
  status: string
  at: string
}

function parseStatusEvents(): StatusEventRow[] {
  const path = resolve(__dirname, '..', 'db/data/bookshop-OrderStatusEvents.csv')
  if (!existsSync(path)) return []
  const csv = readFileSync(path, 'utf8')
  const lines = csv.trim().split('\n')
  const header = lines[0].split(',')
  const orderIdx = header.indexOf('order_ID')
  const statusIdx = header.indexOf('status')
  const atIdx = header.indexOf('at')
  return lines.slice(1).map((line) => {
    const cols = line.split(',')
    return { order_ID: cols[orderIdx], status: cols[statusIdx], at: cols[atIdx] }
  })
}

function pickRouteFor(orderID: string, available: string[]): string {
  // Hash → pick deterministic route from pool
  const hash = createHash('sha1').update(orderID).digest()
  const idx = hash.readUInt32BE(0) % available.length
  return available[idx]
}

function csvEscape(value: string | number | undefined | null): string {
  if (value == null) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function main() {
  return buildRoutePool().then((pool) => {
    const orders = parseOrders()
    const events = parseStatusEvents()
    const eventsByOrder = new Map<string, StatusEventRow[]>()
    for (const ev of events) {
      if (!eventsByOrder.has(ev.order_ID)) eventsByOrder.set(ev.order_ID, [])
      eventsByOrder.get(ev.order_ID)!.push(ev)
    }

    const availableKeys = Object.keys(pool)
    if (availableKeys.length === 0) {
      console.error('No routes in pool — aborting')
      process.exit(1)
    }

    const trackable = orders.filter(
      (o) => o.status === 'shipped' || o.status === 'delivered',
    )
    console.log(`\nGenerating shipments for ${trackable.length} orders`)

    const rows: string[] = [
      'ID,order_ID,originName,originLat,originLng,destName,destLat,destLng,routeGeojson,shippedAt,etaMinutes,deliveredAt',
    ]
    let written = 0
    for (const order of trackable) {
      const key = pickRouteFor(order.ID, availableKeys)
      const route = pool[key]
      const [originName, destName] = key.split('__')
      const origin = WAREHOUSES.find((w) => w.name === originName)!
      const dest = DESTINATIONS.find((d) => d.name === destName)!

      const orderEvents = eventsByOrder.get(order.ID) ?? []
      const shippedEvent = orderEvents.find((e) => e.status === 'shipped')
      const deliveredEvent = orderEvents.find((e) => e.status === 'delivered')
      // Fall back to "now" if no event (shouldn't happen for shipped+delivered).
      const shippedAt = shippedEvent?.at ?? new Date().toISOString()
      const deliveredAt = order.status === 'delivered' ? deliveredEvent?.at ?? '' : ''
      const etaMinutes = Math.round(route.durationSec / 60)

      const routeJson = JSON.stringify(route.coords)

      rows.push(
        [
          randomUUID(),
          order.ID,
          csvEscape(origin.name),
          origin.lat,
          origin.lng,
          csvEscape(dest.name),
          dest.lat,
          dest.lng,
          csvEscape(routeJson),
          shippedAt,
          etaMinutes,
          deliveredAt,
        ].join(','),
      )
      written++
    }

    const outPath = resolve(__dirname, '..', 'db/data/bookshop-Shipments.csv')
    writeFileSync(outPath, rows.join('\n') + '\n')
    console.log(`Wrote ${written} shipments → ${outPath}`)
  })
}

main()
