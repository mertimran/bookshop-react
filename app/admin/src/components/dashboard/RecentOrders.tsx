import { Card, CardContent, Box, Typography, Paper, Chip, Skeleton } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { Order } from '@bookshop/shared/api'
import { STATUS_COLOR } from '../orderStatus'

export function RecentOrders({ orders, loading }: { orders: Order[]; loading?: boolean }) {
  const { t } = useTranslation()

  return (
    <Card sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          {t('recentOrders')}
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={48} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <AnimatePresence initial={false}>
              {orders.slice(0, 3).map((order) => (
                <motion.div
                  key={order.ID}
                  layout
                  initial={{ opacity: 0, y: -16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      px: 2,
                      py: 1.25,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>
                        {order.orderNo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.orderDate ? new Date(order.orderDate).toLocaleTimeString() : ''}
                      </Typography>
                    </Box>
                    <Chip
                      label={t(order.status ?? 'draft')}
                      color={STATUS_COLOR[order.status ?? 'draft'] || 'default'}
                      size="small"
                      variant="outlined"
                    />
                    <Typography fontWeight={700} sx={{ minWidth: 80, textAlign: 'right' }}>
                      ${(order.totalAmount || 0).toFixed(2)}
                    </Typography>
                  </Paper>
                </motion.div>
              ))}
            </AnimatePresence>
            {orders.length === 0 && (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                {t('noData')}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
