import cds from '@sap/cds'

export default class CatalogService extends cds.ApplicationService {
  async init() {
    const { Books, Orders, OrderItems } = this.entities

    this.before('CREATE', 'Orders', async (req) => {
      const order = req.data
      if (!order.orderNo) {
        order.orderNo = `ORD-${Date.now()}`
      }
      order.status = 'draft'
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
      return SELECT.one.from(Orders).where({ ID: orderID })
    })

    this.after('READ', 'Books', (each: any) => {
      if (each.stock !== undefined && each.stock < 1) {
        each.title = `${each.title} — Out of Stock`
      }
    })

    return super.init()
  }
}
