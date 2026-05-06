import { createFileRoute } from '@tanstack/react-router'
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Container,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { catalogApi, type Order } from '@bookshop/shared/api'
import { OrderDetailDrawer } from '../../components/order-detail/OrderDetailDrawer'

export const Route = createFileRoute('/orders/')({
  component: OrdersPage,
})

const STATUS_COLOR: Record<string, 'default' | 'info' | 'primary' | 'warning' | 'success' | 'error'> = {
  draft: 'default',
  submitted: 'info',
  confirmed: 'primary',
  shipped: 'warning',
  delivered: 'success',
  cancelled: 'error',
}

function OrdersPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Order | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    catalogApi
      .getOrders('$orderby=orderDate desc')
      .then((r) => setOrders(r.value))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    setDetailLoading(true)
    catalogApi
      .getOrder(selectedId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false))
  }, [selectedId])

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h2" sx={{ mb: 1 }}>{t('orderHistory')}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('orders')}
      </Typography>

      {loading ? (
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 4 }} />
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', border: 1, borderColor: 'divider' }}>
          <ReceiptLongIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">{t('noResults')}</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('orderNo')}</TableCell>
                <TableCell>{t('orderDate')}</TableCell>
                <TableCell>{t('orderStatus')}</TableCell>
                <TableCell align="right">{t('total')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.ID}
                  hover
                  onClick={() => setSelectedId(order.ID!)}
                  selected={selectedId === order.ID}
                  sx={{
                    cursor: 'pointer',
                    '&:last-child td': { border: 0 },
                    '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                  }}
                >
                  <TableCell>
                    <Typography fontWeight={600}>{order.orderNo}</Typography>
                  </TableCell>
                  <TableCell>
                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(order.status ?? 'draft')}
                      color={STATUS_COLOR[order.status ?? 'draft'] || 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <OrderDetailDrawer
        open={!!selectedId}
        detail={detail}
        loading={detailLoading}
        onClose={() => setSelectedId(null)}
      />
    </Container>
  )
}
