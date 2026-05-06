import { Box, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts'
import { ChartCard } from './ChartCard'
import type { TreemapNode } from './selectors'

interface TreemapContentProps {
  x?: number
  y?: number
  width?: number
  height?: number
  name?: string
  stock?: number
  price?: number
  size?: number
  depth?: number
}

function TreemapTile(
  props: TreemapContentProps & { palette: { error: string; warning: string; success: string } },
) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    name = '',
    stock = 0,
    price = 0,
    size = 0,
    depth = 0,
    palette,
  } = props
  if (depth === 0) return null
  const fill = stock < 5 ? palette.error : stock < 15 ? palette.warning : palette.success
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        style={{ fill, stroke: '#fff', strokeWidth: 2, opacity: 0.85 }}
      />
      {width > 80 && height > 36 && (
        <>
          <text x={x + 8} y={y + 18} fontSize={12} fontWeight={700} fill="#fff">
            {name}
          </text>
          <text x={x + 8} y={y + 34} fontSize={11} fill="rgba(255,255,255,0.85)">
            ${size.toFixed(0)} · {stock} @ ${price.toFixed(2)}
          </text>
        </>
      )}
    </g>
  )
}

export function InventoryTreemapCard({
  data,
  loading,
}: {
  data: TreemapNode[]
  loading?: boolean
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const palette = {
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    success: theme.palette.success.main,
  }

  return (
    <ChartCard title={t('inventoryValue')} subtitle={t('inventoryValueDesc')} loading={loading}>
      <Box sx={{ height: 360 }}>
        <ResponsiveContainer>
          <Treemap
            data={data}
            dataKey="size"
            isAnimationActive
            animationDuration={500}
            content={(props: any) => <TreemapTile {...props} palette={palette} />}
          >
            <Tooltip
              contentStyle={{
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
              formatter={(value: any, _name: any, payload: any) => {
                const p = payload?.payload
                if (!p) return value
                return [`$${value} (${p.stock} × $${p.price})`, p.name]
              }}
            />
          </Treemap>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  )
}
