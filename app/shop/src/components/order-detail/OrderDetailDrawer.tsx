import { useState } from 'react'
import {
  Drawer,
  Box,
  Typography,
  Chip,
  IconButton,
  Skeleton,
  Divider,
  alpha,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import type { Order } from '@bookshop/shared/api'
import type { Order as CdsOrder } from '#cds-models/CatalogService'
import { StatusTimeline } from '@bookshop/shared/components'
import { OrderItemsTable } from './OrderItemsTable'
import { TrackShipmentTeaser } from './TrackShipmentTeaser'
import { TrackShipmentDialog } from './TrackShipmentDialog'

type Status = NonNullable<CdsOrder['status']>

const STATUS_COLOR: Record<
  Status,
  'default' | 'info' | 'primary' | 'warning' | 'success' | 'error'
> = {
  draft: 'default',
  submitted: 'info',
  confirmed: 'primary',
  shipped: 'warning',
  delivered: 'success',
  cancelled: 'error',
}

export function OrderDetailDrawer({
  open,
  detail,
  loading,
  onClose,
}: {
  open: boolean
  detail: Order | null
  loading: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [trackOpen, setTrackOpen] = useState(false)

  const trackable = detail?.status === 'shipped' || detail?.status === 'delivered'

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 480 },
            bgcolor: 'background.default',
          },
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700} noWrap>
            {detail?.orderNo || t('orderDetails')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {detail?.orderDate ? new Date(detail.orderDate).toLocaleString() : ''}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, overflowY: 'auto' }}>
        {loading && !detail ? (
          <>
            <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2, mb: 3 }} />
            <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2, mb: 3 }} />
            <Skeleton variant="rounded" height={240} sx={{ borderRadius: 2 }} />
          </>
        ) : detail ? (
          <>
            <Box
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  {t('status')}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={t(detail.status ?? 'draft')}
                    color={STATUS_COLOR[detail.status ?? 'draft']}
                    size="small"
                  />
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  {t('total')}
                </Typography>
                <Typography variant="h5" fontWeight={800} color="primary.main">
                  ${detail.totalAmount?.toFixed(2) ?? '0.00'}
                </Typography>
              </Box>
            </Box>

            {trackable && (
              <Box sx={{ mb: 3 }}>
                <TrackShipmentTeaser onClick={() => setTrackOpen(true)} />
              </Box>
            )}

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
              {t('orderItems')}
            </Typography>
            <OrderItemsTable items={detail.items} />

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              {t('timeline')}
            </Typography>
            <StatusTimeline
              events={detail.statusEvents ?? []}
              currentStatus={detail.status}
            />
          </>
        ) : null}
      </Box>

      <TrackShipmentDialog
        open={trackOpen}
        orderID={detail?.ID ?? null}
        orderNo={detail?.orderNo}
        onClose={() => setTrackOpen(false)}
      />
    </Drawer>
  )
}
