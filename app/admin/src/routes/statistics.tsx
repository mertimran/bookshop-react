import { createFileRoute } from '@tanstack/react-router'
import { Typography, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'
import { adminApi, type Book, type Order } from '@bookshop/shared/api'
import { ChartCard } from '../components/statistics/ChartCard'
import { ActivityHeatmap } from '../components/statistics/ActivityHeatmap'
import { GenreRadarCard } from '../components/statistics/GenreRadarCard'
import { InventoryTreemapCard } from '../components/statistics/InventoryTreemapCard'
import { RevenueTrendCard } from '../components/statistics/RevenueTrendCard'
import { OrderFunnelCard } from '../components/statistics/OrderFunnelCard'
import { HourlyPolarCard } from '../components/statistics/HourlyPolarCard'
import { TopBooksRevenueCard } from '../components/statistics/TopBooksRevenueCard'
import { RatingPriceScatterCard } from '../components/statistics/RatingPriceScatterCard'
import { GenreAuthorSankeyCard } from '../components/statistics/GenreAuthorSankeyCard'
import {
  buildGenreRadar,
  buildInventoryTreemap,
  buildOrderHeatmap,
  buildRevenueTrend,
  buildStatusFunnel,
  buildTopBooks,
  buildHourlyPolar,
  buildBookScatter,
  buildGenreAuthorSankey,
} from '../components/statistics/selectors'

export const Route = createFileRoute('/statistics')({
  component: StatisticsPage,
})

function StatisticsPage() {
  const { t } = useTranslation()
  const [books, setBooks] = useState<Book[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [booksLoading, setBooksLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    let alive = true
    adminApi
      .getBooks('$expand=author,genres($expand=genre)')
      .then((r) => { if (alive) setBooks(r.value) })
      .finally(() => { if (alive) setBooksLoading(false) })
    adminApi
      .getOrders('$top=500&$expand=items($expand=book)')
      .then((r) => { if (alive) setOrders(r.value) })
      .finally(() => { if (alive) setOrdersLoading(false) })
    return () => { alive = false }
  }, [])

  const radar = useMemo(() => buildGenreRadar(books), [books])
  const treemapData = useMemo(() => buildInventoryTreemap(books), [books])
  const heatmap = useMemo(() => buildOrderHeatmap(orders), [orders])
  const scatterGroups = useMemo(() => buildBookScatter(books), [books])
  const sankeyData = useMemo(() => buildGenreAuthorSankey(books), [books])
  const revenueTrend = useMemo(() => buildRevenueTrend(orders), [orders])
  const funnelData = useMemo(() => buildStatusFunnel(orders), [orders])
  const topBooks = useMemo(() => buildTopBooks(orders, books), [orders, books])
  const hourlyPolar = useMemo(() => buildHourlyPolar(orders), [orders])

  return (
    <>
      <Typography variant="h2" sx={{ mb: 0.5 }}>{t('statistics')}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Visual analytics that go beyond a typical chart pack
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <GenreRadarCard rows={radar.rows} genres={radar.genres} loading={booksLoading} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <InventoryTreemapCard data={treemapData} loading={booksLoading} />
        </Grid>
        <Grid size={12}>
          <ChartCard
            title={t('activityHeatmap')}
            subtitle={t('activityHeatmapDesc')}
            loading={ordersLoading}
          >
            <ActivityHeatmap grid={heatmap} />
          </ChartCard>
        </Grid>
        <Grid size={12}>
          <RevenueTrendCard data={revenueTrend} loading={ordersLoading} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <OrderFunnelCard data={funnelData} loading={ordersLoading} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <HourlyPolarCard data={hourlyPolar} loading={ordersLoading} />
        </Grid>
        <Grid size={12}>
          <TopBooksRevenueCard data={topBooks} loading={ordersLoading || booksLoading} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <RatingPriceScatterCard groups={scatterGroups} loading={booksLoading} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <GenreAuthorSankeyCard data={sankeyData} loading={booksLoading} />
        </Grid>
      </Grid>
    </>
  )
}
