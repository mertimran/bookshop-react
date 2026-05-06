/**
 * Backfills db/data/bookshop-OrderStatusEvents.csv from the existing Orders
 * CSV. For each order, synthesises a plausible timeline of status transitions
 * based on its current status. Run with: npx tsx scripts/seed-status-events.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

type Status = 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

const HAPPY_PATH: Status[] = ['draft', 'submitted', 'confirmed', 'shipped', 'delivered']

// Seeded RNG so re-runs produce the same output (matches seed-orders.ts pattern).
let seed = 0xC0FFEE
function rand() {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 0x100000000
}
function pickInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min
}

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

// Time gaps between transitions, in milliseconds. Drawn uniformly.
const GAPS: Record<Exclude<Status, 'draft'>, () => number> = {
  submitted: () => pickInt(2, 30) * 60 * 1000,           // 2-30 min after draft
  confirmed: () => pickInt(2, 12) * HOUR,                // 2-12 hours after submit
  shipped:   () => pickInt(1, 3) * DAY + pickInt(0, 8) * HOUR,
  delivered: () => pickInt(2, 5) * DAY + pickInt(0, 12) * HOUR,
  cancelled: () => pickInt(1, 6) * HOUR,                 // applied after the last reached step
}

interface OrderRow {
  ID: string
  orderDate: string
  status: Status
}

function parseOrders(csv: string): OrderRow[] {
  const lines = csv.trim().split('\n')
  const header = lines[0].split(',')
  const idIdx = header.indexOf('ID')
  const dateIdx = header.indexOf('orderDate')
  const statusIdx = header.indexOf('status')
  return lines.slice(1).map((line) => {
    const cols = line.split(',')
    return {
      ID: cols[idIdx],
      orderDate: cols[dateIdx],
      status: cols[statusIdx] as Status,
    }
  })
}

interface Event {
  ID: string
  order_ID: string
  status: Status
  at: string
}

function buildTimeline(order: OrderRow): Event[] {
  const events: Event[] = []
  const submittedAt = new Date(order.orderDate).getTime()
  // Draft is a few minutes before orderDate.
  const draftAt = submittedAt - GAPS.submitted()

  if (order.status === 'cancelled') {
    // Pick a random reached step before cancellation. Most cancellations happen
    // after submission but before delivery.
    const reachedIndex = pickInt(1, 3) // submitted | confirmed | shipped
    let cursor = draftAt
    events.push({ ID: randomUUID(), order_ID: order.ID, status: 'draft', at: new Date(cursor).toISOString() })
    for (let i = 1; i <= reachedIndex; i++) {
      const step = HAPPY_PATH[i] as Exclude<Status, 'draft'>
      cursor += GAPS[step]()
      events.push({ ID: randomUUID(), order_ID: order.ID, status: step, at: new Date(cursor).toISOString() })
    }
    cursor += GAPS.cancelled()
    events.push({ ID: randomUUID(), order_ID: order.ID, status: 'cancelled', at: new Date(cursor).toISOString() })
    return events
  }

  const targetIdx = HAPPY_PATH.indexOf(order.status)
  if (targetIdx < 0) return events

  let cursor = draftAt
  events.push({ ID: randomUUID(), order_ID: order.ID, status: 'draft', at: new Date(cursor).toISOString() })
  for (let i = 1; i <= targetIdx; i++) {
    const step = HAPPY_PATH[i] as Exclude<Status, 'draft'>
    cursor += GAPS[step]()
    events.push({ ID: randomUUID(), order_ID: order.ID, status: step, at: new Date(cursor).toISOString() })
  }
  return events
}

function main() {
  const root = resolve(__dirname, '..')
  const ordersCsv = readFileSync(resolve(root, 'db/data/bookshop-Orders.csv'), 'utf8')
  const orders = parseOrders(ordersCsv)

  const allEvents = orders.flatMap(buildTimeline)
  // Sort by timestamp so the CSV reads chronologically.
  allEvents.sort((a, b) => a.at.localeCompare(b.at))

  const out = ['ID,order_ID,status,at']
  for (const ev of allEvents) {
    out.push(`${ev.ID},${ev.order_ID},${ev.status},${ev.at}`)
  }
  const path = resolve(root, 'db/data/bookshop-OrderStatusEvents.csv')
  writeFileSync(path, out.join('\n') + '\n')
  console.log(`Wrote ${allEvents.length} events for ${orders.length} orders → ${path}`)
}

main()
