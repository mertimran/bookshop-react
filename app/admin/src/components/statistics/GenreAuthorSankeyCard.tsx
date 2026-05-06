import { Box, Typography, Tooltip as MuiTooltip, alpha, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts'
import { ChartCard } from './ChartCard'
import type { SankeyData } from './selectors'

export function GenreAuthorSankeyCard({
  data,
  loading,
}: {
  data: SankeyData
  loading?: boolean
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <ChartCard title={t('genreAuthorFlow')} subtitle={t('genreAuthorFlowDesc')} loading={loading}>
      <Box sx={{ height: 360 }}>
        {data.links.length === 0 ? (
          <MuiTooltip title="" disableHoverListener>
            <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
              {t('noData')}
            </Typography>
          </MuiTooltip>
        ) : (
          <ResponsiveContainer>
            <Sankey
              data={data}
              nodePadding={20}
              nodeWidth={12}
              margin={{ top: 8, right: 100, bottom: 8, left: 8 }}
              link={{ stroke: alpha(theme.palette.primary.main, 0.5), strokeOpacity: 0.4 }}
              node={{
                fill: theme.palette.primary.main,
                stroke: theme.palette.primary.dark,
              }}
            >
              <Tooltip
                contentStyle={{
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
              />
            </Sankey>
          </ResponsiveContainer>
        )}
      </Box>
    </ChartCard>
  )
}
