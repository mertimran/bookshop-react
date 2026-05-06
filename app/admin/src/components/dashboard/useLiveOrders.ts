import { useEffect, useState } from 'react'
import { adminApi, type Order } from '@bookshop/shared/api'

export type ConnState = 'connecting' | 'connected' | 'reconnecting'

export interface LiveEvent {
  type: 'order.created' | 'order.updated' | 'order.submitted' | 'review.created'
  at: string
  order?: Order
  review?: any
}

export function useLiveOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [conn, setConn] = useState<ConnState>('connecting')
  const [lastEvent, setLastEvent] = useState<LiveEvent | null>(null)

  useEffect(() => {
    let alive = true
    adminApi
      .getOrders('$orderby=orderDate desc&$top=50')
      .then((r) => { if (alive) setOrders(r.value) })
      .finally(() => { if (alive) setLoading(false) })

    const es = new EventSource('/api/admin/events', { withCredentials: true })
    es.onopen = () => setConn('connected')
    es.onerror = () => setConn('reconnecting')

    const handle = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data) as LiveEvent
        setLastEvent(data)
        if (data.type === 'order.created' && data.order) {
          setOrders((prev) => {
            if (prev.some((o) => o.ID === data.order!.ID)) return prev
            return [data.order!, ...prev].slice(0, 50)
          })
        } else if (
          (data.type === 'order.updated' || data.type === 'order.submitted') &&
          data.order
        ) {
          setOrders((prev) => {
            const idx = prev.findIndex((o) => o.ID === data.order!.ID)
            if (idx === -1) return [data.order!, ...prev].slice(0, 50)
            const copy = prev.slice()
            copy[idx] = { ...copy[idx], ...data.order! }
            return copy
          })
        }
      } catch { /* noop */ }
    }
    for (const t of ['order.created', 'order.updated', 'order.submitted', 'review.created']) {
      es.addEventListener(t, handle)
    }

    return () => {
      alive = false
      es.close()
    }
  }, [])

  return { orders, loading, conn, lastEvent }
}
