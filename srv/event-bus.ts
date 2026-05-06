import { EventEmitter } from 'node:events'

export type LiveEvent =
  | { type: 'order.created'; at: string; order: any }
  | { type: 'order.updated'; at: string; order: any }
  | { type: 'order.submitted'; at: string; order: any }
  | { type: 'review.created'; at: string; review: any }
  | { type: 'shipment.started'; at: string; shipment: any }
  | { type: 'shipment.delivered'; at: string; shipment: any }

class LiveBus extends EventEmitter {}

export const bus = new LiveBus()
bus.setMaxListeners(100)

export function publish(event: LiveEvent) {
  bus.emit('event', event)
}
