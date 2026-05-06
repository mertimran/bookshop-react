import { Box, alpha, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Tooltip,
} from 'recharts'
import { ChartCard } from './ChartCard'

interface HourSlice {
  hour: string
  value: number
  fill: string
}

export function HourlyPolarCard({ data, loading }: { data: HourSlice[]; loading?: boolean }) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <ChartCard title={t('hourlyPolar')} subtitle={t('hourlyPolarDesc')} loading={loading}>
      <Box sx={{ height: 320 }}>
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="20%"
            outerRadius="95%"
            barSize={8}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="category"
              dataKey="hour"
              tick={{ fontSize: 9, fill: theme.palette.text.secondary }}
            />
            <RadialBar
              background={{ fill: alpha(theme.palette.text.primary, 0.05) }}
              dataKey="value"
              cornerRadius={4}
              isAnimationActive
              animationDuration={700}
            />
            <Tooltip
              contentStyle={{
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
              formatter={(value: any) => [`${value} order${value === 1 ? '' : 's'}`, 'Count']}
              labelFormatter={(label: any) => `${label}`}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  )
}
