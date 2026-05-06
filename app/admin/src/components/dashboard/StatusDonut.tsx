import { useMemo } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import type { Order } from '@bookshop/shared/api'
import { AnimatedNumber } from './AnimatedNumber'
import { STATUS_HEX, STATUS_ORDER } from '../orderStatus'

function ordersByStatus(orders: Order[]) {
  const counts: Record<string, number> = {}
  for (const s of STATUS_ORDER) counts[s] = 0
  for (const o of orders) {
    const status = o.status ?? 'draft'
    counts[status] = (counts[status] || 0) + 1
  }
  return STATUS_ORDER.filter((s) => counts[s] > 0).map((s) => ({
    name: s,
    value: counts[s],
    color: STATUS_HEX[s],
  }))
}

export function StatusDonut({ orders }: { orders: Order[] }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const data = useMemo(() => ordersByStatus(orders), [orders])
  const total = data.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return (
      <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">{t('noData')}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: 280, position: 'relative' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography variant="h3" fontWeight={800} lineHeight={1}>
          <AnimatedNumber value={total} />
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          textTransform="uppercase"
          fontWeight={600}
          letterSpacing="0.05em"
        >
          {t('totalOrders')}
        </Typography>
      </Box>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={2}
            stroke={theme.palette.background.paper}
            strokeWidth={3}
            isAnimationActive
            animationDuration={500}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: any, n: any) => [v, t(String(n))]}
            contentStyle={{
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            formatter={(v) => t(String(v))}
            wrapperStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  )
}
