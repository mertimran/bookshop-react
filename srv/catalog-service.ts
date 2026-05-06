import cds from '@sap/cds'
import { Book, Order, OrderItem, Review } from '#cds-models/CatalogService'
import { publish } from './event-bus'

export default class CatalogService extends cds.ApplicationService {
  async init() {
    // Pull entity references from this.entities, but the imports above give us
    // typed shapes for `req.data`, SELECT results, and event payloads — change
    // db/schema.cds and these break at compile time.
    const { Books, Orders, OrderItems, OrderStatusEvents, Reviews } = this.entities

    this.before('CREATE', Orders, async (req) => {
      const order = req.data as Order
      if (!order.orderNo) {
        order.orderNo = `ORD-${Date.now()}`
      }
      order.status = 'draft'
    })

    this.after('CREATE', 'Orders', async (order: any) => {
      await INSERT.into(OrderStatusEvents).entries({
        ID: cds.utils.uuid(),
        order_ID: order.ID,
        status: 'draft',
        at: new Date().toISOString(),
      })
      publish({ type: 'order.created', at: new Date().toISOString(), order })
    })

    this.after('CREATE', 'Reviews', (review: any) => {
      publish({ type: 'review.created', at: new Date().toISOString(), review })
    })

    this.on('submitOrder', async (req) => {
      const { orderID } = req.data
      const order = await SELECT.one.from(Orders).where({ ID: orderID })
      if (!order) return req.error(404, `Order ${orderID} not found`)
      if (order.status !== 'draft') return req.error(400, `Order ${orderID} is not in draft status`)

      const items = await SELECT.from(OrderItems).where({ parent_ID: orderID })
      for (const item of items) {
        const book = await SELECT.one.from(Books).where({ ID: item.book_ID })
        if (!book) return req.error(404, `Book ${item.book_ID} not found`)
        if (book.stock < item.quantity) {
          return req.error(409, `Not enough stock for "${book.title}". Available: ${book.stock}`)
        }
      }

      for (const item of items) {
        await UPDATE(Books).where({ ID: item.book_ID }).set({
          stock: { '-=': item.quantity }
        })
      }

      await UPDATE(Orders).where({ ID: orderID }).set({ status: 'submitted' })
      await INSERT.into(OrderStatusEvents).entries({
        ID: cds.utils.uuid(),
        order_ID: orderID,
        status: 'submitted',
        at: new Date().toISOString(),
      })
      const updated = await SELECT.one.from(Orders).where({ ID: orderID })
      publish({ type: 'order.submitted', at: new Date().toISOString(), order: updated })
      return updated
    })

    this.on('seedDemoOrder', async () => {
      const books = await SELECT.from(Books).where({ stock: { '>': 0 } }).limit(20)
      if (!books.length) throw new Error('No books in stock to seed an order')
      const itemCount = 1 + Math.floor(Math.random() * 3)
      const picks: any[] = []
      const used = new Set<string>()
      for (let i = 0; i < itemCount && picks.length < books.length; i++) {
        const b = books[Math.floor(Math.random() * books.length)]
        if (used.has(b.ID)) continue
        used.add(b.ID)
        picks.push(b)
      }
      const items = picks.map((b) => {
        const quantity = 1 + Math.floor(Math.random() * 3)
        return {
          book_ID: b.ID,
          quantity,
          unitPrice: b.price ?? 9.99,
          amount: Number(((b.price ?? 9.99) * quantity).toFixed(2)),
        }
      })
      const totalAmount = Number(items.reduce((s, it) => s + it.amount, 0).toFixed(2))
      const ID = cds.utils.uuid()
      const orderNo = `ORD-${Date.now()}`
      await INSERT.into(Orders).entries({
        ID,
        orderNo,
        status: 'submitted',
        totalAmount,
        currency_code: 'USD',
        items: items.map((it) => ({ ...it, ID: cds.utils.uuid(), parent_ID: ID })),
      })
      // Synthetic seed: backfill draft → submitted timeline so the UI has
      // something coherent to render.
      const now = Date.now()
      await INSERT.into(OrderStatusEvents).entries([
        { ID: cds.utils.uuid(), order_ID: ID, status: 'draft', at: new Date(now - 1000).toISOString() },
        { ID: cds.utils.uuid(), order_ID: ID, status: 'submitted', at: new Date(now).toISOString() },
      ])
      // Service-internal INSERT doesn't route through the protocol layer, so
      // `after('CREATE', 'Orders')` doesn't fire here — emit explicitly.
      const created = await SELECT.one.from(Orders).where({ ID })
      publish({ type: 'order.created', at: new Date().toISOString(), order: created })
      return created
    })

    this.after('READ', 'Books', async (rows: any) => {
      const list = Array.isArray(rows) ? rows : [rows]
      const ids = list.map((r) => r.ID).filter(Boolean)
      if (ids.length) {
        const reviews: any[] = await SELECT.from(Reviews)
          .columns('book_ID', 'rating')
          .where({ book_ID: { in: ids } })
        const grouped: Record<string, number[]> = {}
        for (const r of reviews) {
          const arr = grouped[r.book_ID] ?? (grouped[r.book_ID] = [])
          if (typeof r.rating === 'number') arr.push(r.rating)
        }
        for (const row of list) {
          const arr = grouped[row.ID] ?? []
          row.rating = arr.length
            ? Number((arr.reduce((s, n) => s + n, 0) / arr.length).toFixed(1))
            : 0
        }
      }
      for (const each of list) {
        if (each.stock !== undefined && each.stock < 1) {
          each.title = `${each.title} — Out of Stock`
        }
      }
    })

    return super.init()
  }
}
