import cds from '@sap/cds'

export default class AdminService extends cds.ApplicationService {
  async init() {
    const { Orders, Books, OrderItems } = this.entities

    this.on('confirmOrder', async (req) => {
      const { orderID } = req.data
      const order = await SELECT.one.from(Orders).where({ ID: orderID })
      if (!order) return req.error(404, `Order ${orderID} not found`)
      if (order.status !== 'submitted') return req.error(400, 'Order must be in submitted status')
      await UPDATE(Orders).where({ ID: orderID }).set({ status: 'confirmed' })
      return SELECT.one.from(Orders).where({ ID: orderID })
    })

    this.on('shipOrder', async (req) => {
      const { orderID } = req.data
      const order = await SELECT.one.from(Orders).where({ ID: orderID })
      if (!order) return req.error(404, `Order ${orderID} not found`)
      if (order.status !== 'confirmed') return req.error(400, 'Order must be in confirmed status')
      await UPDATE(Orders).where({ ID: orderID }).set({ status: 'shipped' })
      return SELECT.one.from(Orders).where({ ID: orderID })
    })

    this.on('cancelOrder', async (req) => {
      const { orderID } = req.data
      const order = await SELECT.one.from(Orders).where({ ID: orderID })
      if (!order) return req.error(404, `Order ${orderID} not found`)
      if (['delivered', 'cancelled'].includes(order.status)) {
        return req.error(400, `Cannot cancel order in ${order.status} status`)
      }

      if (['submitted', 'confirmed', 'shipped'].includes(order.status)) {
        const items = await SELECT.from(OrderItems).where({ parent_ID: orderID })
        for (const item of items) {
          await UPDATE(Books).where({ ID: item.book_ID }).set({
            stock: { '+=': item.quantity }
          })
        }
      }

      await UPDATE(Orders).where({ ID: orderID }).set({ status: 'cancelled' })
      return SELECT.one.from(Orders).where({ ID: orderID })
    })

    return super.init()
  }
}
