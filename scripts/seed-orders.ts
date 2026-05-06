/**
 * Seeds db/data/bookshop-Orders.csv and bookshop-OrderItems.csv with realistic
 * mock data. Run with: npx tsx scripts/seed-orders.ts
 *
 * Distribution biases:
 *  - Hourly: peak around 12-14 (lunch) and 18-21 (evening)
 *  - Day-of-week: lower on Sun/Mon, higher Tue-Sat
 *  - Status: older orders mostly delivered, recent ones in earlier stages
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

const BOOKS = [
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567801', price: 12.99 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567802', price: 11.99 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567803', price: 5.99 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567804', price: 4.99 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567805', price: 8.99 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567806', price: 10.99 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567807', price: 9.99 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567808', price: 11.49 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567809', price: 13.49 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567810', price: 14.99 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567811', price: 11.99 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567812', price: 9.99 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567813', price: 12.49 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567814', price: 7.99 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567815', price: 8.49 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567816', price: 9.99 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567817', price: 13.99 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567818', price: 10.49 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567819', price: 14.49 },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567820', price: 15.99 },
]

const ORDERS_TARGET = 200
const DAYS_BACK = 30

// Seeded RNG so re-runs produce the same output
let seed = 0xdeadbeef
const rand = () => {
  seed = (seed * 1664525 + 1013904223) | 0
  return ((seed >>> 0) / 0x100000000)
}

const pickWeighted = (weights: number[]): number => {
  const total = weights.reduce((s, w) => s + w, 0)
  let r = rand() * total
  for (let i = 0; i < weights.length; i++) {
    if (r < weights[i]) return i
    r -= weights[i]
  }
  return weights.length - 1
}

const HOUR_WEIGHTS = [
  1, 1, 1, 1, 1, 1, // 0-5
  2, 3, 5, 8, 10, 12, // 6-11
  15, 14, 10, 8, 9, 12, // 12-17
  18, 20, 17, 12, 7, 3, // 18-23
]
// Sun=0 .. Sat=6
const DAY_WEIGHTS = [3, 5, 7, 8, 7, 6, 9]

const pickStatus = (daysAgo: number): string => {
  if (daysAgo > 14) return rand() < 0.95 ? 'delivered' : 'cancelled'
  if (daysAgo > 7) {
    const r = rand()
    if (r < 0.7) return 'delivered'
    if (r < 0.9) return 'shipped'
    return 'cancelled'
  }
  if (daysAgo > 3) {
    const r = rand()
    if (r < 0.4) return 'delivered'
    if (r < 0.7) return 'shipped'
    if (r < 0.85) return 'confirmed'
    if (r < 0.95) return 'submitted'
    return 'cancelled'
  }
  const r = rand()
  if (r < 0.2) return 'delivered'
  if (r < 0.5) return 'shipped'
  if (r < 0.7) return 'confirmed'
  if (r < 0.95) return 'submitted'
  return 'cancelled'
}

const NOW = new Date()
const orders: Record<string, any>[] = []
const items: Record<string, any>[] = []

for (let i = 0; i < ORDERS_TARGET; i++) {
  const daysAgo = Math.floor(rand() * DAYS_BACK)
  const targetDay = pickWeighted(DAY_WEIGHTS)
  const hour = pickWeighted(HOUR_WEIGHTS)
  const minute = Math.floor(rand() * 60)

  // Walk back daysAgo, then nudge to land on target day-of-week
  const date = new Date(NOW)
  date.setUTCDate(date.getUTCDate() - daysAgo)
  const drift = (date.getUTCDay() - targetDay + 7) % 7
  date.setUTCDate(date.getUTCDate() - drift)
  date.setUTCHours(hour, minute, 0, 0)

  const realDaysAgo = Math.max(0, Math.floor((NOW.getTime() - date.getTime()) / 86400000))
  const status = pickStatus(realDaysAgo)
  const orderID = randomUUID()
  const orderNo = `ORD-${(i + 1).toString().padStart(5, '0')}`

  const itemCount = 1 + Math.floor(rand() * 4)
  const used = new Set<string>()
  let total = 0
  for (let j = 0; j < itemCount; j++) {
    const book = BOOKS[Math.floor(rand() * BOOKS.length)]
    if (used.has(book.id)) continue
    used.add(book.id)
    const quantity = 1 + Math.floor(rand() * 3)
    const amount = +(book.price * quantity).toFixed(2)
    total += amount
    items.push({
      ID: randomUUID(),
      parent_ID: orderID,
      book_ID: book.id,
      quantity,
      unitPrice: book.price.toFixed(2),
      amount: amount.toFixed(2),
    })
  }

  orders.push({
    ID: orderID,
    orderNo,
    orderDate: date.toISOString(),
    status,
    totalAmount: total.toFixed(2),
    currency_code: 'USD',
  })
}

orders.sort((a, b) => a.orderDate.localeCompare(b.orderDate))

const toCsv = (headers: string[], rows: Record<string, any>[]) =>
  [headers.join(','), ...rows.map((r) => headers.map((h) => r[h] ?? '').join(','))].join('\n') + '\n'

const ordersCsv = toCsv(
  ['ID', 'orderNo', 'orderDate', 'status', 'totalAmount', 'currency_code'],
  orders,
)
const itemsCsv = toCsv(
  ['ID', 'parent_ID', 'book_ID', 'quantity', 'unitPrice', 'amount'],
  items,
)

writeFileSync(resolve('db/data/bookshop-Orders.csv'), ordersCsv)
writeFileSync(resolve('db/data/bookshop-OrderItems.csv'), itemsCsv)

const statusCounts = orders.reduce(
  (acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }),
  {} as Record<string, number>,
)
console.log(`Generated ${orders.length} orders, ${items.length} items`)
console.log('Status breakdown:', statusCounts)
