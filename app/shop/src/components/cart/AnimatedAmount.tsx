import { Box } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

export function AnimatedAmount({ value }: { value: number }) {
  return (
    <Box sx={{ display: 'inline-block', position: 'relative' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ display: 'inline-block' }}
        >
          ${value.toFixed(2)}
        </motion.span>
      </AnimatePresence>
    </Box>
  )
}
