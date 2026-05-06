import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Skeleton,
  Paper,
  Chip,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import { adminApi, type Shipment } from '@bookshop/shared/api'
import { ShipmentMap, type ShipmentForMap } from '@bookshop/shared/components'

export const Route = createFileRoute('/shipments')({
  component: LiveShipmentsPage,
})

function toMapShipment(s: Shipment): ShipmentForMap | null {
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
    orderNo: (s as any).order?.orderNo ?? null,
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

function formatRemaining(shippedAt: string, etaMinutes: number) {
  const start = new Date(shippedAt).getTime()
  const end = start + etaMinutes * 60_000
  const remainingMs = end - Date.now()
  if (remainingMs <= 0) return 'Arriving now'
  const hours = Math.floor(remainingMs / 3_600_000)
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000)
  if (hours >= 24) return `~${Math.round(hours / 24)} days`
  if (hours >= 1) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function LiveShipmentsPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedID, setSelectedID] = useState<string | null>(null)

  // Initial load: only in-transit (not delivered).
  useEffect(() => {
    let alive = true
    adminApi
      .getShipments('$filter=deliveredAt eq null&$expand=order&$top=200')
      .then((r) => { if (alive) setShipments(r.value) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  // Live updates from SSE.
  useEffect(() => {
    const es = new EventSource('/api/admin/events', { withCredentials: true })

    const onStarted = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data)
        const newShipment = data.shipment as Shipment
        setShipments((prev) => {
          if (prev.some((s) => s.ID === newShipment.ID)) return prev
          return [...prev, newShipment]
        })
      } catch { /* noop */ }
    }

    const onOrderUpdated = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data)
        const order = data.order
        if (order?.status === 'delivered' || order?.status === 'cancelled') {
          setShipments((prev) => prev.filter((s) => (s as any).order_ID !== order.ID))
        }
      } catch { /* noop */ }
    }

    es.addEventListener('shipment.started', onStarted)
    es.addEventListener('order.updated', onOrderUpdated)

    return () => {
      es.close()
    }
  }, [])

  const mapShipments = useMemo(() => {
    return shipments.map(toMapShipment).filter((s): s is ShipmentForMap => s !== null)
  }, [shipments])

  const selected = useMemo(
    () => mapShipments.find((s) => s.ID === selectedID) ?? null,
    [mapShipments, selectedID],
  )

  return (
    <Box sx={{ height: 'calc(100vh - 96px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h2">{t('liveShipments')}</Typography>
        <Chip
          label={`${mapShipments.length} in transit`}
          color="primary"
          size="small"
          sx={{ fontWeight: 700 }}
        />
      </Box>

      <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {loading ? (
          <Skeleton variant="rounded" height="100%" sx={{ borderRadius: 2 }} />
        ) : (
          <ShipmentMap
            shipments={mapShipments}
            height="100%"
            onMarkerClick={setSelectedID}
            selectedID={selectedID}
          />
        )}

        {selected && (
          <Paper
            elevation={6}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              p: 2,
              minWidth: 280,
              maxWidth: 320,
              borderRadius: 2,
              border: 1,
              borderColor: alpha(theme.palette.primary.main, 0.2),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={700} noWrap>
                  {selected.orderNo || selected.ID.slice(0, 8)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selected.originName} → {selected.destName}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedID(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
                ETA
              </Typography>
              <Chip
                label={formatRemaining(selected.shippedAt, selected.etaMinutes)}
                color="primary"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  )
}
