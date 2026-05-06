import type { Book, Order } from '@bookshop/shared/api'
import type { Order as CdsOrder } from '#cds-models/CatalogService'

type OrderStatus = NonNullable<CdsOrder['status']>

export interface RadarRow {
  subject: string
  [key: string]: number | string
}

export function buildGenreRadar(books: Book[]): { rows: RadarRow[]; genres: string[] } {
  const byGenre = new Map<string, Book[]>()
  for (const b of books) {
    for (const bg of b.genres ?? []) {
      const name = bg.genre?.name
      if (!name) continue
      if (!byGenre.has(name)) byGenre.set(name, [])
      byGenre.get(name)!.push(b)
    }
  }
  const entries = Array.from(byGenre.entries())
    .map(([name, bs]) => {
      const ratings = bs.map((b) => b.rating ?? 0).filter((r) => r > 0)
      return {
        name,
        bookCount: bs.length,
        avgRating: ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : 0,
        totalStock: bs.reduce((s, b) => s + (b.stock ?? 0), 0),
        avgPrice:
          bs.length ? bs.reduce((s, b) => s + (b.price ?? 0), 0) / bs.length : 0,
        inventoryValue: bs.reduce(
          (s, b) => s + (b.price ?? 0) * (b.stock ?? 0),
          0,
        ),
      }
    })
    .sort((a, b) => b.bookCount - a.bookCount)
    .slice(0, 6)

  const metrics: { key: keyof (typeof entries)[number]; label: string }[] = [
    { key: 'bookCount', label: 'Books' },
    { key: 'avgRating', label: 'Avg Rating' },
    { key: 'totalStock', label: 'Stock' },
    { key: 'avgPrice', label: 'Avg Price' },
    { key: 'inventoryValue', label: 'Value' },
  ]

  const max: Record<string, number> = {}
  for (const m of metrics) {
    max[m.key as string] = Math.max(...entries.map((e) => e[m.key] as number)) || 1
  }

  const rows = metrics.map((m) => {
    const row: RadarRow = { subject: m.label }
    for (const e of entries) {
      row[e.name] = Number((((e[m.key] as number) / max[m.key as string]) * 100).toFixed(1))
    }
    return row
  })

  return { rows, genres: entries.map((e) => e.name) }
}

export interface TreemapNode {
  name: string
  size: number
  stock: number
  price: number
  [key: string]: string | number
}

export function buildInventoryTreemap(books: Book[]): TreemapNode[] {
  return books
    .filter((b) => (b.stock ?? 0) > 0 && (b.price ?? 0) > 0)
    .map((b) => {
      const title = b.title ?? ''
      return {
        name: title.length > 22 ? title.slice(0, 20) + '…' : title,
        size: Math.round((b.price ?? 0) * (b.stock ?? 0) * 100) / 100,
        stock: b.stock ?? 0,
        price: b.price ?? 0,
      }
    })
    .sort((a, b) => b.size - a.size)
}

export function buildOrderHeatmap(orders: Order[]): number[][] {
  const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0))
  for (const o of orders) {
    if (!o.orderDate) continue
    const d = new Date(o.orderDate)
    grid[d.getDay()][d.getHours()] += 1
  }
  return grid
}

export function buildRevenueTrend(orders: Order[]) {
  const days = 30
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const buckets: { day: string; revenue: number; orders: number; ts: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    buckets.push({
      day: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      revenue: 0,
      orders: 0,
      ts: d.getTime(),
    })
  }
  const startTs = buckets[0].ts
  for (const o of orders) {
    if (!o.orderDate) continue
    const od = new Date(o.orderDate)
    od.setHours(0, 0, 0, 0)
    const idx = Math.floor((od.getTime() - startTs) / 86400000)
    if (idx < 0 || idx >= days) continue
    buckets[idx].revenue += o.totalAmount || 0
    buckets[idx].orders += 1
  }
  return buckets.map((b) => ({ ...b, revenue: Number(b.revenue.toFixed(2)) }))
}

export function buildStatusFunnel(orders: Order[]) {
  // The string literals below are typed as OrderStatus from @cds-models — a
  // typo or schema rename surfaces here at compile time, not at runtime.
  const terminalExcluded: OrderStatus[] = ['draft', 'cancelled']
  const confirmedOrLater: OrderStatus[] = ['confirmed', 'shipped', 'delivered']
  const shippedOrLater: OrderStatus[] = ['shipped', 'delivered']

  const reachable = orders.filter((o) => !terminalExcluded.includes(o.status as OrderStatus))
  const submitted = reachable.length
  const confirmed = reachable.filter((o) =>
    confirmedOrLater.includes(o.status as OrderStatus),
  ).length
  const shipped = reachable.filter((o) => shippedOrLater.includes(o.status as OrderStatus)).length
  const delivered = reachable.filter((o) => o.status === 'delivered').length
  return [
    { name: 'Submitted', value: submitted, fill: '#0288d1' },
    { name: 'Confirmed', value: confirmed, fill: '#1A7B6E' },
    { name: 'Shipped', value: shipped, fill: '#E89C20' },
    { name: 'Delivered', value: delivered, fill: '#2e7d32' },
  ].filter((s) => s.value > 0)
}

export function buildTopBooks(orders: Order[], books: Book[]) {
  const titleByBook = new Map(books.map((b) => [b.ID, b.title]))
  const totals = new Map<string, { revenue: number; units: number }>()
  for (const o of orders) {
    for (const it of o.items ?? []) {
      const id = it.book?.ID
      if (!id) continue
      const cur = totals.get(id) ?? { revenue: 0, units: 0 }
      cur.revenue += it.amount ?? 0
      cur.units += it.quantity ?? 0
      totals.set(id, cur)
    }
  }
  return Array.from(totals.entries())
    .map(([id, v]) => ({
      id,
      title: titleByBook.get(id) ?? 'Unknown',
      revenue: Number(v.revenue.toFixed(2)),
      units: v.units,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
    .map((b) => ({
      ...b,
      label: b.title.length > 26 ? b.title.slice(0, 24) + '…' : b.title,
    }))
}

export function buildHourlyPolar(orders: Order[]) {
  const counts = Array.from({ length: 24 }, () => 0)
  for (const o of orders) {
    if (!o.orderDate) continue
    counts[new Date(o.orderDate).getHours()] += 1
  }
  return counts.map((value, h) => ({
    hour: `${h.toString().padStart(2, '0')}:00`,
    value,
    fill: `hsl(${175 - h * 4}, 60%, ${45 + (value > 0 ? 5 : 0)}%)`,
  }))
}

export interface ScatterPoint {
  title: string
  rating: number
  price: number
  stock: number
  genre: string
}

export function buildBookScatter(books: Book[]): Map<string, ScatterPoint[]> {
  const groups = new Map<string, ScatterPoint[]>()
  for (const b of books) {
    if (!b.rating || !b.price) continue
    const genre = b.genres?.[0]?.genre?.name || 'Other'
    const point: ScatterPoint = {
      title: b.title ?? '',
      rating: b.rating,
      price: b.price,
      stock: b.stock ?? 0,
      genre,
    }
    if (!groups.has(genre)) groups.set(genre, [])
    groups.get(genre)!.push(point)
  }
  return groups
}

export interface SankeyData {
  nodes: { name: string }[]
  links: { source: number; target: number; value: number }[]
}

export function buildGenreAuthorSankey(books: Book[]): SankeyData {
  const nodes: { name: string }[] = []
  const idx = new Map<string, number>()
  const addNode = (name: string) => {
    if (idx.has(name)) return idx.get(name)!
    const i = nodes.length
    nodes.push({ name })
    idx.set(name, i)
    return i
  }
  const flows = new Map<string, number>()
  for (const b of books) {
    const author = b.author?.name
    if (!author) continue
    for (const bg of b.genres ?? []) {
      const genre = bg.genre?.name
      if (!genre) continue
      const key = `${genre}|${author}`
      flows.set(key, (flows.get(key) || 0) + 1)
    }
  }
  const links: { source: number; target: number; value: number }[] = []
  for (const [key, value] of flows) {
    const [genre, author] = key.split('|')
    links.push({ source: addNode(genre), target: addNode(author), value })
  }
  return { nodes, links }
}

export const SERIES_COLORS = ['#1A7B6E', '#E89C20', '#0288d1', '#9c27b0', '#d32f2f', '#2e7d32']
