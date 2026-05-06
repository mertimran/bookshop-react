import cds from '@sap/cds'
import type { Order, OrderItem, Book } from '#cds-models/AdminService'
import { publish } from './event-bus'
import { buildMockShipment } from './shipment-mock'

// Pulled from the CDS schema via @cds-models. Add a status to db/schema.cds
// and unmatched status checks below stop compiling until they're updated.
type Status = NonNullable<Order['status']>

export default class AdminService extends cds.ApplicationService {
  async init() {
    const { Orders, Books, OrderItems, OrderStatusEvents, Shipments } = this.entities

    const advance = async (orderID: string, from: Status | Status[], to: Status) => {
      const order = (await SELECT.one.from(Orders).where({ ID: orderID })) as Order | null
      if (!order) throw new Error(`Order ${orderID} not found`)
      const allowed = Array.isArray(from) ? from : [from]
      if (!order.status || !allowed.includes(order.status as Status)) {
        throw new Error(`Order must be in ${allowed.join('/')} status`)
      }
      await UPDATE(Orders).where({ ID: orderID }).set({ status: to })
      await INSERT.into(OrderStatusEvents).entries({
        ID: cds.utils.uuid(),
        order_ID: orderID,
        status: to,
        at: new Date().toISOString(),
      })
      const updated = (await SELECT.one.from(Orders).where({ ID: orderID })) as Order
      publish({ type: 'order.updated', at: new Date().toISOString(), order: updated })
      return updated
    }

    this.on('confirmOrder', async (req) => {
      try { return await advance(req.data.orderID, 'submitted', 'confirmed') }
      catch (e: any) { return req.error(400, e.message) }
    })

    this.on('shipOrder', async (req) => {
      try {
        const updated = await advance(req.data.orderID, 'confirmed', 'shipped')
        const orderID = req.data.orderID
        const mock = buildMockShipment(orderID)
        if (mock) {
          const shipmentID = cds.utils.uuid()
          const shippedAt = new Date().toISOString()
          await INSERT.into(Shipments).entries({
            ID: shipmentID,
            order_ID: orderID,
            originName: mock.originName,
            originLat: mock.originLat,
            originLng: mock.originLng,
            destName: mock.destName,
            destLat: mock.destLat,
            destLng: mock.destLng,
            routeGeojson: mock.routeGeojson,
            shippedAt,
            etaMinutes: mock.etaMinutes,
          })
          const shipment = await SELECT.one.from(Shipments).where({ ID: shipmentID })
          publish({ type: 'shipment.started', at: shippedAt, shipment })
        }
        return updated
      } catch (e: any) {
        return req.error(400, e.message)
      }
    })

    this.on('cancelOrder', async (req) => {
      const { orderID } = req.data
      const order = (await SELECT.one.from(Orders).where({ ID: orderID })) as Order | null
      if (!order) return req.error(404, `Order ${orderID} not found`)

      const terminal: Status[] = ['delivered', 'cancelled']
      if (terminal.includes(order.status as Status)) {
        return req.error(400, `Cannot cancel order in ${order.status} status`)
      }

      const refundable: Status[] = ['submitted', 'confirmed', 'shipped']
      if (refundable.includes(order.status as Status)) {
        const items = (await SELECT.from(OrderItems).where({ parent_ID: orderID })) as OrderItem[]
        for (const item of items) {
          await UPDATE<Book>(Books).where({ ID: item.book_ID }).set({
            stock: { '+=': item.quantity }
          })
        }
      }

      await UPDATE(Orders).where({ ID: orderID }).set({ status: 'cancelled' satisfies Status })
      await INSERT.into(OrderStatusEvents).entries({
        ID: cds.utils.uuid(),
        order_ID: orderID,
        status: 'cancelled' satisfies Status,
        at: new Date().toISOString(),
      })
      const updated = (await SELECT.one.from(Orders).where({ ID: orderID })) as Order
      publish({ type: 'order.updated', at: new Date().toISOString(), order: updated })
      return updated
    })

    return super.init()
  }
}
