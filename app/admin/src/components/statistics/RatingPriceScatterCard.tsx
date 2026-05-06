import { Box, alpha, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { ChartCard } from './ChartCard'
import { SERIES_COLORS, type ScatterPoint } from './selectors'

export function RatingPriceScatterCard({
  groups,
  loading,
}: {
  groups: Map<string, ScatterPoint[]>
  loading?: boolean
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <ChartCard title={t('ratingVsPrice')} subtitle={t('ratingVsPriceDesc')} loading={loading}>
      <Box sx={{ height: 360 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid stroke={alpha(theme.palette.text.primary, 0.08)} />
            <XAxis
              type="number"
              dataKey="rating"
              name="Rating"
              domain={[0, 5]}
              tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              label={{
                value: 'Rating',
                position: 'insideBottom',
                offset: -2,
                fontSize: 12,
                fill: theme.palette.text.secondary,
              }}
            />
            <YAxis
              type="number"
              dataKey="price"
              name="Price"
              tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              label={{
                value: 'Price',
                angle: -90,
                position: 'insideLeft',
                fontSize: 12,
                fill: theme.palette.text.secondary,
              }}
            />
            <ZAxis type="number" dataKey="stock" range={[60, 900]} name="Stock" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
              formatter={(value: any, name: any) => {
                if (name === 'Price') return [`$${value}`, name]
                return [value, name]
              }}
              labelFormatter={(_label: any, payload: any) => payload?.[0]?.payload?.title || ''}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {Array.from(groups.entries()).map(([genre, points], i) => (
              <Scatter
                key={genre}
                name={genre}
                data={points}
                fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                isAnimationActive
                animationDuration={700}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  )
}
