import { createFileRoute } from '@tanstack/react-router'
import { Typography, Skeleton } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { adminApi, type Order } from '@bookshop/shared/api'
import { OrdersTable } from '../../components/orders/OrdersTable'
import { OrderDetailDrawer } from '../../components/orders/OrderDetailDrawer'

export const Route = createFileRoute('/orders/')({
  component: OrdersManagePage,
})

function OrdersManagePage() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Order | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const loadOrders = () => {
    setLoading(true)
    adminApi
      .getOrders('$orderby=orderDate desc')
      .then((r) => setOrders(r.value))
      .finally(() => setLoading(false))
  }

  useEffect(loadOrders, [])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      setError('')
      return
    }
    setDetailLoading(true)
    adminApi
      .getOrder(selectedId)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setDetailLoading(false))
  }, [selectedId])

  const handleAction = async (action: 'confirm' | 'ship' | 'cancel') => {
    if (!selectedId) return
    setBusy(true)
    setError('')
    try {
      const fn = {
        confirm: adminApi.confirmOrder,
        ship: adminApi.shipOrder,
        cancel: adminApi.cancelOrder,
      }[action]
      await fn(selectedId)
      const fresh = await adminApi.getOrder(selectedId)
      setDetail(fresh)
      loadOrders()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Typography variant="h2" sx={{ mb: 0.5 }}>{t('orders')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        {orders.length} total
      </Typography>

      {loading ? (
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
      ) : (
        <OrdersTable orders={orders} selectedId={selectedId} onSelect={setSelectedId} />
      )}

      <OrderDetailDrawer
        open={!!selectedId}
        detail={detail}
        loading={detailLoading}
        busy={busy}
        error={error}
        onClose={() => setSelectedId(null)}
        onAction={handleAction}
      />
    </>
  )
}
