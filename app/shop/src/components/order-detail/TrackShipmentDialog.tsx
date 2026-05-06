import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { useTranslation } from 'react-i18next'
import { catalogApi, type Shipment } from '@bookshop/shared/api'
import { ShipmentMap, type ShipmentForMap } from '@bookshop/shared/components'

function toMapShipment(s: Shipment, orderNo?: string | null): ShipmentForMap | null {
  if (
    s.originLat == null ||
    s.originLng == null ||
    s.destLat == null ||
    s.destLng == null ||
    !s.routeGeojson ||
    !s.shippedAt ||
    s.etaMinutes == null
  ) {
    return null
  }
  return {
    ID: s.ID!,
    orderNo,
    originName: s.originName,
    originLat: Number(s.originLat),
    originLng: Number(s.originLng),
    destName: s.destName,
    destLat: Number(s.destLat),
    destLng: Number(s.destLng),
    routeGeojson: s.routeGeojson,
    shippedAt: s.shippedAt,
    etaMinutes: s.etaMinutes,
    deliveredAt: s.deliveredAt,
  }
}

function formatRemaining(shippedAt: string, etaMinutes: number, deliveredAt?: string | null) {
  if (deliveredAt) return null
  const start = new Date(shippedAt).getTime()
  const end = start + etaMinutes * 60_000
  const remainingMs = end - Date.now()
  if (remainingMs <= 0) return 'Arriving now'
  const hours = Math.floor(remainingMs / 3_600_000)
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000)
  if (hours >= 24) return `~${Math.round(hours / 24)} day${hours >= 48 ? 's' : ''}`
  if (hours >= 1) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function TrackShipmentDialog({
  open,
  orderID,
  orderNo,
  onClose,
}: {
  open: boolean
  orderID: string | null
  orderNo?: string | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !orderID) {
      setShipment(null)
      return
    }
    setLoading(true)
    catalogApi
      .getShipmentForOrder(orderID)
      .then(setShipment)
      .catch(() => setShipment(null))
      .finally(() => setLoading(false))
  }, [open, orderID])

  const mapData = useMemo(() => {
    if (!shipment) return null
    return toMapShipment(shipment, orderNo)
  }, [shipment, orderNo])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      slotProps={{ paper: { sx: { borderRadius: 3, height: '85vh', maxHeight: 800 } } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <LocalShippingIcon sx={{ color: 'primary.main' }} />
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={700}>{t('trackShipment')}</Typography>
          {orderNo && (
            <Typography variant="caption" color="text.secondary">
              {orderNo}
            </Typography>
          )}
        </Box>
        {mapData && (
          <Chip
            label={
              mapData.deliveredAt
                ? t('delivered')
                : formatRemaining(mapData.shippedAt, mapData.etaMinutes, mapData.deliveredAt) ?? ''
            }
            color={mapData.deliveredAt ? 'success' : 'primary'}
            size="small"
            sx={{ fontWeight: 700 }}
          />
        )}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <Box sx={{ flex: 1, p: 3 }}>
            <Skeleton variant="rounded" height="100%" sx={{ borderRadius: 2 }} />
          </Box>
        ) : mapData ? (
          <>
            <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
              <ShipmentMap shipments={[mapData]} height="100%" />
            </Box>
            <Box
              sx={{
                p: 2.5,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                <HomeWorkIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
                    From
                  </Typography>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {mapData.originName}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flexShrink: 0, color: 'text.disabled' }}>→</Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                <LocationOnIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
                    To
                  </Typography>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {mapData.destName}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
            <Typography color="text.secondary">{t('noTrackingAvailable')}</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}
