import { useMemo } from 'react'
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
import type { Book } from '@bookshop/shared/api'

export function StockLevels({ books }: { books: Book[] }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const data = useMemo(() => {
    return books
      .slice()
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
      .slice(0, 8)
      .map((b) => {
        const title = b.title ?? ''
        const stock = b.stock ?? 0
        return {
          name: title.length > 24 ? title.slice(0, 22) + '…' : title,
          stock,
          fill:
            stock < 5
              ? theme.palette.error.main
              : stock < 15
                ? theme.palette.warning.main
                : theme.palette.success.main,
        }
      })
  }, [books, theme.palette.error.main, theme.palette.warning.main, theme.palette.success.main])

  if (!data.length) {
    return (
      <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">{t('noData')}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={alpha(theme.palette.text.primary, 0.08)}
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
            width={140}
          />
          <Tooltip
            cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }}
            contentStyle={{
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
            }}
          />
          <Bar dataKey="stock" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={500} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}
