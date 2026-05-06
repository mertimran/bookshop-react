import { Box, alpha, useTheme } from '@mui/material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { ConnState } from './useLiveOrders'

export function ConnectionPill({ conn }: { conn: ConnState }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const colors: Record<ConnState, string> = {
    connecting: theme.palette.warning.main,
    connected: theme.palette.success.main,
    reconnecting: theme.palette.error.main,
  }
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.5,
        borderRadius: 999,
        bgcolor: alpha(colors[conn], 0.12),
        color: colors[conn],
        fontWeight: 700,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      <motion.span
        animate={{ scale: conn === 'connected' ? [1, 1.4, 1] : 1, opacity: 1 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'currentColor',
          display: 'inline-block',
        }}
      />
      {t(conn)}
    </Box>
  )
}
