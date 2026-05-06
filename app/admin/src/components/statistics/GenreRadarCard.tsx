import { Box, alpha, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from 'recharts'
import { ChartCard } from './ChartCard'
import { SERIES_COLORS, type RadarRow } from './selectors'

export function GenreRadarCard({
  rows,
  genres,
  loading,
}: {
  rows: RadarRow[]
  genres: string[]
  loading?: boolean
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <ChartCard title={t('genreComparison')} subtitle={t('genreComparisonDesc')} loading={loading}>
      <Box sx={{ height: 360 }}>
        <ResponsiveContainer>
          <RadarChart data={rows} outerRadius="78%">
            <PolarGrid stroke={alpha(theme.palette.text.primary, 0.12)} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            {genres.map((g, i) => (
              <Radar
                key={g}
                name={g}
                dataKey={g}
                stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                fillOpacity={0.18}
                strokeWidth={2}
                isAnimationActive
                animationDuration={700}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
              formatter={(v: any) => `${v}/100`}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  )
}
