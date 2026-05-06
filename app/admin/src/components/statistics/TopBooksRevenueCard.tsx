import { Box, Typography, alpha, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { ChartCard } from './ChartCard'

interface TopBook {
  id: string
  title: string
  revenue: number
  units: number
  label: string
}

export function TopBooksRevenueCard({ data, loading }: { data: TopBook[]; loading?: boolean }) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <ChartCard title={t('topBooksRevenue')} subtitle={t('topBooksRevenueDesc')} loading={loading}>
      <Box sx={{ height: Math.max(280, data.length * 42) }}>
        {data.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
            {t('noData')}
          </Typography>
        ) : (
          <ResponsiveContainer>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 0, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={alpha(theme.palette.text.primary, 0.08)}
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                tickFormatter={(v: any) => `$${v}`}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                width={200}
              />
              <Tooltip
                cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }}
                contentStyle={{
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
                formatter={(value: any, _name: any, payload: any) => {
                  const p = payload?.payload
                  if (!p) return value
                  return [`$${value} (${p.units} unit${p.units === 1 ? '' : 's'})`, p.title]
                }}
                labelFormatter={() => ''}
              />
              <Bar
                dataKey="revenue"
                fill={theme.palette.primary.main}
                radius={[0, 6, 6, 0]}
                isAnimationActive
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </ChartCard>
  )
}
