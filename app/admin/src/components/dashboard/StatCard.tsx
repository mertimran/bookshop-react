import { memo } from 'react'
import { Card, CardContent, Typography, Box, Skeleton, alpha } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedNumber } from './AnimatedNumber'

interface StatCardProps {
  label: string
  value: number
  format?: (v: number) => string
  icon: React.ReactNode
  color: string
  pulseKey?: number
  loading?: boolean
}

export const StatCard = memo(function StatCard({
  label,
  value,
  format,
  icon,
  color,
  pulseKey,
  loading,
}: StatCardProps) {
  return (
    <Card sx={{ border: 1, borderColor: 'divider', overflow: 'hidden', position: 'relative' }}>
      <AnimatePresence>
        {pulseKey != null && pulseKey > 0 && (
          <motion.div
            key={pulseKey}
            initial={{ opacity: 0.45, scale: 0 }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 16,
              background: `radial-gradient(circle at 100% 0%, ${alpha(color, 0.35)} 0%, transparent 60%)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              textTransform="uppercase"
              fontWeight={600}
              letterSpacing="0.05em"
            >
              {label}
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mt: 0.5 }}>
              {loading ? <Skeleton width={70} /> : <AnimatedNumber value={value} format={format} />}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: alpha(color, 0.1),
              color,
              p: 1.5,
              borderRadius: 3,
              display: 'flex',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
})
