import { Box, alpha, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { ChartCard } from './ChartCard'

interface TrendPoint {
  day: string
  revenue: number
  orders: number
}

export function RevenueTrendCard({ data, loading }: { data: TrendPoint[]; loading?: boolean }) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <ChartCard title={t('revenueTrend')} subtitle={t('revenueTrendDesc')} loading={loading}>
      <Box sx={{ height: 320 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.palette.secondary.main} stopOpacity={0.55} />
                <stop offset="100%" stopColor={theme.palette.secondary.main} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.08)} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              interval={Math.floor(data.length / 8)}
            />
            <YAxis
              tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              tickFormatter={(v: any) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
              formatter={(value: any, name: any) => {
                if (name === 'revenue') return [`$${value}`, 'Revenue']
                return [value, name]
              }}
              labelFormatter={(_: any, payload: any) => {
                const p = payload?.[0]?.payload
                return p ? `${p.day} · ${p.orders} order${p.orders === 1 ? '' : 's'}` : ''
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={theme.palette.secondary.main}
              strokeWidth={2.5}
              fill="url(#revFill)"
              isAnimationActive
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  )
}
