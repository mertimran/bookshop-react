import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
  Button,
  Box,
  Grid,
  Alert,
  Skeleton,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { adminApi, type Order } from '@bookshop/shared/api'

export const Route = createFileRoute('/orders/$orderId')({
  component: OrderDetailPage,
})

const STATUS_COLOR: Record<string, 'default' | 'info' | 'primary' | 'warning' | 'success' | 'error'> = {
  draft: 'default',
  submitted: 'info',
  confirmed: 'primary',
  shipped: 'warning',
  delivered: 'success',
  cancelled: 'error',
}

function OrderDetailPage() {
  const { orderId } = Route.useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrder = () => {
    setLoading(true)
    adminApi
      .getOrder(orderId)
      .then(setOrder)
      .finally(() => setLoading(false))
  }

  useEffect(loadOrder, [orderId])

  const handleAction = async (action: 'confirm' | 'ship' | 'cancel') => {
    setError('')
    try {
      const fn = {
        confirm: adminApi.confirmOrder,
        ship: adminApi.shipOrder,
        cancel: adminApi.cancelOrder,
      }[action]
      await fn(orderId)
      loadOrder()
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (loading) {
    return (
      <>
        <Skeleton width={120} height={40} sx={{ mb: 2 }} />
        <Skeleton width={200} height={48} sx={{ mb: 4 }} />
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 4, mb: 3 }} />
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 4 }} />
      </>
    )
  }

  if (!order) {
    return <Typography color="error">{t('error')}</Typography>
  }

  return (
    <>
      <Button
        onClick={() => navigate({ to: '/orders' })}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        {t('orders')}
      </Button>

      <Typography variant="h2" sx={{ mb: 4 }}>{t('orderDetails')}</Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, border: 1, borderColor: 'divider' }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
              {t('orderNo')}
            </Typography>
            <Typography variant="h6" fontWeight={700}>{order.orderNo}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
              {t('orderDate')}
            </Typography>
            <Typography variant="h6" fontWeight={500}>
              {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
              {t('status')}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip label={t(order.status ?? 'draft')} color={STATUS_COLOR[order.status ?? 'draft'] || 'default'} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
              {t('total')}
            </Typography>
            <Typography variant="h6" fontWeight={800} color="primary.main">
              ${order.totalAmount?.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Items</Typography>
      <TableContainer component={Paper} sx={{ mb: 4, border: 1, borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Book</TableCell>
              <TableCell align="right">{t('unitPrice')}</TableCell>
              <TableCell align="right">{t('quantity')}</TableCell>
              <TableCell align="right">{t('amount')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items?.map((item) => (
              <TableRow key={item.ID} sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell>
                  <Typography fontWeight={600}>{item.book?.title || 'Unknown'}</Typography>
                </TableCell>
                <TableCell align="right">${item.unitPrice?.toFixed(2)}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight={600}>${item.amount?.toFixed(2)}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', gap: 2 }}>
        {order.status === 'submitted' && (
          <Button
            variant="contained"
            startIcon={<CheckCircleOutlineIcon />}
            onClick={() => handleAction('confirm')}
          >
            {t('confirmOrder')}
          </Button>
        )}
        {order.status === 'confirmed' && (
          <Button
            variant="contained"
            color="warning"
            startIcon={<LocalShippingOutlinedIcon />}
            onClick={() => handleAction('ship')}
          >
            {t('shipOrder')}
          </Button>
        )}
        {!['delivered', 'cancelled'].includes(order.status ?? '') && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelOutlinedIcon />}
            onClick={() => handleAction('cancel')}
          >
            {t('cancelOrder')}
          </Button>
        )}
      </Box>
    </>
  )
}
