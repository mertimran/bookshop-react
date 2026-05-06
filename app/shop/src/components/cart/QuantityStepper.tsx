import { useRef, useState } from 'react'
import { Box, IconButton, Typography, alpha, useTheme } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { motion, AnimatePresence } from 'framer-motion'

export function QuantityStepper({
  value,
  max,
  onChange,
  onRequestRemove,
}: {
  value: number
  max: number
  onChange: (qty: number) => void
  onRequestRemove: () => void
}) {
  const theme = useTheme()
  const [direction, setDirection] = useState<1 | -1>(1)
  const holdTimer = useRef<number | null>(null)
  const intervalTimer = useRef<number | null>(null)
  const valueRef = useRef(value)
  valueRef.current = value

  const dec = () => {
    if (valueRef.current <= 1) return onRequestRemove()
    setDirection(-1)
    onChange(valueRef.current - 1)
  }
  const inc = () => {
    if (valueRef.current >= max) return
    setDirection(1)
    onChange(valueRef.current + 1)
  }

  const startHold = (action: () => void) => {
    action()
    holdTimer.current = window.setTimeout(() => {
      intervalTimer.current = window.setInterval(action, 90)
    }, 380)
  }
  const stopHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    if (intervalTimer.current) clearInterval(intervalTimer.current)
    holdTimer.current = null
    intervalTimer.current = null
  }

  const atMin = value <= 1
  const atMax = value >= max

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        bgcolor: alpha(theme.palette.primary.main, 0.06),
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.12),
        borderRadius: 999,
        height: 40,
        px: 0.5,
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.16)}`,
          borderColor: alpha(theme.palette.primary.main, 0.3),
        },
      }}
    >
      <IconButton
        size="small"
        onPointerDown={() => startHold(dec)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        sx={{
          width: 30,
          height: 30,
          color: atMin ? 'error.main' : 'primary.main',
          '&:hover': {
            bgcolor: atMin
              ? alpha(theme.palette.error.main, 0.12)
              : alpha(theme.palette.primary.main, 0.12),
          },
        }}
      >
        <motion.span
          key={atMin ? 'trash' : 'minus'}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          style={{ display: 'inline-flex' }}
        >
          {atMin ? (
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          ) : (
            <RemoveIcon sx={{ fontSize: 18 }} />
          )}
        </motion.span>
      </IconButton>

      <Box
        sx={{
          width: 36,
          height: 30,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={value}
            initial={{ y: direction * 22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction * -22, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 480, damping: 28 }}
            style={{ position: 'absolute' }}
          >
            <Typography fontWeight={700} fontSize="0.95rem" lineHeight={1}>
              {value}
            </Typography>
          </motion.div>
        </AnimatePresence>
      </Box>

      <IconButton
        size="small"
        disabled={atMax}
        onPointerDown={() => startHold(inc)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        sx={{
          width: 30,
          height: 30,
          color: 'primary.main',
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
          '&.Mui-disabled': { color: alpha(theme.palette.primary.main, 0.3) },
        }}
      >
        <AddIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  )
}
