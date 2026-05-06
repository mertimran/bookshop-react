/**
 * Server-side helper for synthesising a mock shipment when an order moves to
 * 'shipped'. Reads the same OSRM-cached route pool used by the seed script —
 * see scripts/seed-shipments.ts. Routes get picked deterministically from the
 * order ID so re-shipping the same order is stable.
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'

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
  coords: [number, number][]
  durationSec: number
  distanceM: number
}

const CACHE_PATH = resolve(__dirname, '..', 'scripts', '.cache', 'routes.json')

let routePool: Record<string, RouteData> | null = null

function loadPool(): Record<string, RouteData> {
  if (routePool) return routePool
  if (!existsSync(CACHE_PATH)) {
    console.warn(`[shipments] route cache not found at ${CACHE_PATH} — run scripts/seed-shipments.ts`)
    routePool = {}
    return routePool
  }
  routePool = JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
  return routePool!
}

function pickRouteKey(orderID: string, keys: string[]): string {
  const hash = createHash('sha1').update(orderID).digest()
  return keys[hash.readUInt32BE(0) % keys.length]
}

export interface MockShipment {
  originName: string
  originLat: number
  originLng: number
  destName: string
  destLat: number
  destLng: number
  routeGeojson: string
  etaMinutes: number
}

export function buildMockShipment(orderID: string): MockShipment | null {
  const pool = loadPool()
  const keys = Object.keys(pool)
  if (keys.length === 0) return null

  const key = pickRouteKey(orderID, keys)
  const route = pool[key]
  const [originName, destName] = key.split('__')
  const origin = WAREHOUSES.find((w) => w.name === originName)
  const dest = DESTINATIONS.find((d) => d.name === destName)
  if (!origin || !dest) return null

  return {
    originName: origin.name,
    originLat: origin.lat,
    originLng: origin.lng,
    destName: dest.name,
    destLat: dest.lat,
    destLng: dest.lng,
    routeGeojson: JSON.stringify(route.coords),
    etaMinutes: Math.round(route.durationSec / 60),
  }
}
