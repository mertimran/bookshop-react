import { createFileRoute } from '@tanstack/react-router'
import {
  Typography,
  Grid,
  Box,
  Button,
  Snackbar,
  Alert,
  useTheme,
  LinearProgress,
} from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import BoltIcon from '@mui/icons-material/Bolt'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { catalogApi } from '@bookshop/shared/api'
import { useLiveOrders, type LiveEvent } from '../components/dashboard/useLiveOrders'
import { useBooks } from '../components/dashboard/useBooks'
import { StatCard } from '../components/dashboard/StatCard'
import { ConnectionPill } from '../components/dashboard/ConnectionPill'
import { StatusDonut } from '../components/dashboard/StatusDonut'
import { StockLevels } from '../components/dashboard/StockLevels'
import { HourlyAreaChart } from '../components/dashboard/HourlyAreaChart'
import { ChartCard } from '../components/dashboard/ChartCard'
import { RecentOrders } from '../components/dashboard/RecentOrders'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function isToday(iso?: string) {
  if (!iso) return false
  const d = new Date(iso)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

function DashboardPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { orders, loading: ordersLoading, conn, lastEvent } = useLiveOrders()
  const { books, loading: booksLoading } = useBooks()

  const [seeding, setSeeding] = useState(false)
  const [toast, setToast] = useState<{ msg: string; sev: 'success' | 'info' } | null>(null)
  const [orderPulseKey, setOrderPulseKey] = useState(0)
  const seenEventRef = useRef<LiveEvent | null>(null)

  useEffect(() => {
    if (!lastEvent || lastEvent === seenEventRef.current) return
    seenEventRef.current = lastEvent
    setOrderPulseKey((k) => k + 1)
    if (lastEvent.type === 'order.created' && lastEvent.order) {
      setToast({
        msg: `${t('newOrder')}: ${lastEvent.order.orderNo} — $${(lastEvent.order.totalAmount || 0).toFixed(2)}`,
        sev: 'success',
      })
    } else if (lastEvent.type === 'order.updated' && lastEvent.order) {
      setToast({
        msg: `${t('orderUpdated')}: ${lastEvent.order.orderNo} → ${t(lastEvent.order.status ?? 'draft')}`,
        sev: 'info',
      })
    }
  }, [lastEvent, t])

  const ordersToday = useMemo(() => orders.filter((o) => isToday(o.orderDate ?? undefined)), [orders])
  const revenueToday = ordersToday.reduce((s, o) => s + (o.totalAmount || 0), 0)
  const lowStockBooks = useMemo(() => books.filter((b) => (b.stock ?? 0) < 10), [books])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await catalogApi.seedDemoOrder()
    } catch (e) {
      setToast({ msg: e instanceof Error ? e.message : String(e), sev: 'info' })
    } finally {
      setSeeding(false)
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5, flexWrap: 'wrap' }}>
        <Typography variant="h2">{t('dashboard')}</Typography>
        <ConnectionPill conn={conn} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Typography variant="body1" color="text.secondary" sx={{ flex: 1 }}>
          {t('live')} · {new Date().toLocaleDateString()}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleSeed}
          disabled={seeding}
        >
          {t('seedDemoOrder')}
        </Button>
      </Box>

      {(ordersLoading || booksLoading) && (
        <LinearProgress sx={{ mb: 3, borderRadius: 2 }} />
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label={t('ordersToday')}
            value={ordersToday.length}
            icon={<BoltIcon />}
            color={theme.palette.primary.main}
            pulseKey={orderPulseKey}
            loading={ordersLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label={t('revenueToday')}
            value={revenueToday}
            format={(v) => `$${v.toFixed(2)}`}
            icon={<AttachMoneyIcon />}
            color={theme.palette.secondary.main}
            pulseKey={orderPulseKey}
            loading={ordersLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label={t('totalBooks')}
            value={books.length}
            icon={<MenuBookIcon />}
            color="#2e7d32"
            loading={booksLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label={t('lowStock')}
            value={lowStockBooks.length}
            icon={<WarningAmberIcon />}
            color="#d32f2f"
            loading={booksLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <ChartCard title={t('ordersByHour')} loading={ordersLoading}>
            <HourlyAreaChart orders={orders} />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <ChartCard title={t('orderStatusDistribution')} loading={ordersLoading}>
            <StatusDonut orders={orders} />
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <ChartCard title={t('lowestStock')} loading={booksLoading}>
            <StockLevels books={books} />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <RecentOrders orders={orders} loading={ordersLoading} />
        </Grid>
      </Grid>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast?.sev || 'info'}
          variant="filled"
          onClose={() => setToast(null)}
          sx={{ minWidth: 280 }}
        >
          {toast?.msg}
        </Alert>
      </Snackbar>
    </>
  )
}
