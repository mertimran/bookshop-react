import { Box, Typography, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ResponsiveContainer, FunnelChart, Funnel, LabelList, Tooltip } from 'recharts'
import { ChartCard } from './ChartCard'

interface FunnelDatum {
  name: string
  value: number
  fill: string
}

export function OrderFunnelCard({ data, loading }: { data: FunnelDatum[]; loading?: boolean }) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <ChartCard title={t('orderFunnel')} subtitle={t('orderFunnelDesc')} loading={loading}>
      <Box sx={{ height: 320 }}>
        {data.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
            {t('noData')}
          </Typography>
        ) : (
          <ResponsiveContainer>
            <FunnelChart>
              <Tooltip
                contentStyle={{
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
                formatter={(value: any, _name: any, payload: any) => {
                  const top = data[0]?.value || 1
                  const pct = ((value / top) * 100).toFixed(0)
                  return [`${value} (${pct}%)`, payload?.payload?.name]
                }}
              />
              <Funnel
                data={data}
                dataKey="value"
                nameKey="name"
                isAnimationActive
                animationDuration={700}
              >
                <LabelList
                  position="right"
                  fill={theme.palette.text.primary}
                  stroke="none"
                  dataKey="name"
                  fontSize={12}
                  fontWeight={600}
                />
                <LabelList
                  position="center"
                  fill="#fff"
                  stroke="none"
                  dataKey="value"
                  fontSize={14}
                  fontWeight={700}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        )}
      </Box>
    </ChartCard>
  )
}
