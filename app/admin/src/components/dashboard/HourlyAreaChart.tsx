import { useMemo } from 'react'
import { Box, alpha, useTheme } from '@mui/material'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import type { Order } from '@bookshop/shared/api'

function ordersByHour(orders: Order[]) {
  const buckets = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${h.toString().padStart(2, '0')}:00`,
    orders: 0,
    revenue: 0,
  }))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (const o of orders) {
    if (!o.orderDate) continue
    const d = new Date(o.orderDate)
    if (d < today) continue
    const h = d.getHours()
    if (h >= 0 && h < 24) {
      buckets[h].orders += 1
      buckets[h].revenue += o.totalAmount || 0
    }
  }
  return buckets
}

export function HourlyAreaChart({ orders }: { orders: Order[] }) {
  const theme = useTheme()
  const data = useMemo(() => ordersByHour(orders), [orders])
  return (
    <Box sx={{ height: 280 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.5} />
              <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.08)} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
            interval={3}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
          />
          <Tooltip
            contentStyle={{
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
            }}
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke={theme.palette.primary.main}
            strokeWidth={2.5}
            fill="url(#ordersFill)"
            isAnimationActive
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}
