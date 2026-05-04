import { createFileRoute } from '@tanstack/react-router'
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { adminApi, type Book, type Order } from '@bookshop/shared/api'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

const STATUS_COLOR: Record<string, 'default' | 'info' | 'primary' | 'warning' | 'success' | 'error'> = {
  draft: 'default',
  submitted: 'info',
  confirmed: 'primary',
  shipped: 'warning',
  delivered: 'success',
  cancelled: 'error',
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}) {
  const theme = useTheme()

  return (
    <Card sx={{ border: 1, borderColor: 'divider' }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              textTransform="uppercase"
              fontWeight={600}
              letterSpacing="0.05em"
            >
              {label}
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mt: 0.5 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: alpha(color, 0.1),
              color,
              p: 1.5,
              borderRadius: 3,
              display: 'flex',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function DashboardPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [books, setBooks] = useState<Book[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.getBooks(),
      adminApi.getOrders('$orderby=orderDate desc&$top=5'),
    ])
      .then(([booksRes, ordersRes]) => {
        setBooks(booksRes.value)
        setOrders(ordersRes.value)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <>
        <Skeleton width={200} height={48} sx={{ mb: 3 }} />
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[...Array(4)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rounded" height={120} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 4 }} />
      </>
    )
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const lowStockBooks = books.filter((b) => b.stock < 10)

  const stats = [
    { label: t('totalBooks'), value: books.length, icon: <MenuBookIcon />, color: theme.palette.primary.main },
    { label: t('totalOrders'), value: orders.length, icon: <LocalShippingOutlinedIcon />, color: '#2e7d32' },
    { label: t('totalRevenue'), value: `$${totalRevenue.toFixed(2)}`, icon: <AttachMoneyIcon />, color: theme.palette.secondary.main },
    { label: t('lowStock'), value: lowStockBooks.length, icon: <WarningAmberIcon />, color: '#d32f2f' },
  ]

  return (
    <>
      <Typography variant="h2" sx={{ mb: 0.5 }}>{t('dashboard')}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        {t('recentOrders')}
      </Typography>
      <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('orderNo')}</TableCell>
              <TableCell>{t('orderDate')}</TableCell>
              <TableCell>{t('status')}</TableCell>
              <TableCell align="right">{t('total')}</TableCell>
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
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">{t('noData')}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
