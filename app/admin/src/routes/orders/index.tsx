import { createFileRoute, Link } from '@tanstack/react-router'
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
  IconButton,
  Skeleton,
} from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { adminApi, type Order } from '@bookshop/shared/api'

export const Route = createFileRoute('/orders/')({
  component: OrdersManagePage,
})

const STATUS_COLOR: Record<string, 'default' | 'info' | 'primary' | 'warning' | 'success' | 'error'> = {
  draft: 'default',
  submitted: 'info',
  confirmed: 'primary',
  shipped: 'warning',
  delivered: 'success',
  cancelled: 'error',
}

function OrdersManagePage() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi
      .getOrders('$orderby=orderDate desc')
      .then((r) => setOrders(r.value))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Typography variant="h2" sx={{ mb: 0.5 }}>{t('orders')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        {orders.length} total
      </Typography>

      {loading ? (
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
      ) : (
        <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('orderNo')}</TableCell>
                <TableCell>{t('orderDate')}</TableCell>
                <TableCell>{t('status')}</TableCell>
                <TableCell align="right">{t('total')}</TableCell>
                <TableCell align="right">{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.ID} sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Typography fontWeight={600}>{order.orderNo}</Typography>
                  </TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(order.status)}
                      color={STATUS_COLOR[order.status] || 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>${order.totalAmount?.toFixed(2) || '0.00'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      component={Link}
                      to="/orders/$orderId"
                      params={{ orderId: order.ID }}
                      size="small"
                      sx={{ color: 'primary.main' }}
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">{t('noData')}</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}
