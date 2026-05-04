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
  Box,
  Skeleton,
} from '@mui/material'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { type Order } from '@bookshop/shared/api'

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
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/catalog/Orders?$orderby=orderDate desc')
      .then((r) => r.json())
      .then((r) => setOrders(r.value || []))
      .finally(() => setLoading(false))
  }, [])

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
                <TableRow key={order.ID} sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Typography fontWeight={600}>{order.orderNo}</Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(order.orderDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(order.status)}
                      color={STATUS_COLOR[order.status] || 'default'}
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
    </Container>
  )
}
