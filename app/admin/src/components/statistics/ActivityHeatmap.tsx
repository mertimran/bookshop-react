import { Box, Typography, alpha, useTheme } from '@mui/material'
import { motion } from 'framer-motion'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, h) => h)

export function ActivityHeatmap({ grid }: { grid: number[][] }) {
  const theme = useTheme()
  const max = Math.max(1, ...grid.flat())
  const cellSize = 22
  const gap = 3
  const labelWidth = 40
  const topLabelHeight = 18
  const widthPx = labelWidth + 24 * (cellSize + gap)
  const heightPx = topLabelHeight + 7 * (cellSize + gap)

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Box sx={{ minWidth: widthPx, mt: 2 }}>
        <svg width={widthPx} height={heightPx} role="img" aria-label="Order activity heatmap">
          {HOURS.map((h) => (
            <text
              key={h}
              x={labelWidth + h * (cellSize + gap) + cellSize / 2}
              y={12}
              fontSize={10}
              fill={theme.palette.text.secondary}
              textAnchor="middle"
            >
              {h % 3 === 0 ? `${h.toString().padStart(2, '0')}` : ''}
            </text>
          ))}
          {grid.map((row, dayIdx) =>
            row.map((count, hourIdx) => {
              const intensity = count / max
              const fill =
                count === 0
                  ? alpha(theme.palette.primary.main, 0.06)
                  : alpha(theme.palette.primary.main, 0.18 + intensity * 0.78)
              return (
                <motion.rect
                  key={`${dayIdx}-${hourIdx}`}
                  x={labelWidth + hourIdx * (cellSize + gap)}
                  y={topLabelHeight + dayIdx * (cellSize + gap)}
                  width={cellSize}
                  height={cellSize}
                  rx={4}
                  fill={fill}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: (dayIdx * 24 + hourIdx) * 0.002,
                    duration: 0.3,
                    ease: 'easeOut',
                  }}
                >
                  <title>{`${DAYS[dayIdx]} ${hourIdx.toString().padStart(2, '0')}:00 — ${count} order${count === 1 ? '' : 's'}`}</title>
                </motion.rect>
              )
            }),
          )}
          {DAYS.map((d, i) => (
            <text
              key={d}
              x={0}
              y={topLabelHeight + i * (cellSize + gap) + cellSize * 0.7}
              fontSize={11}
              fontWeight={600}
              fill={theme.palette.text.secondary}
            >
              {d}
            </text>
          ))}
        </svg>
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Less
          </Typography>
          {[0.06, 0.25, 0.45, 0.7, 0.95].map((a, i) => (
            <Box
              key={i}
              sx={{
                width: 14,
                height: 14,
                borderRadius: 0.6,
                bgcolor: alpha(theme.palette.primary.main, a),
              }}
            />
          ))}
          <Typography variant="caption" color="text.secondary">
            More · max {max}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
