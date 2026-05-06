import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, alpha, useTheme } from '@mui/material'
import { Map as MapLibreMap, Source, Layer, Marker, type MapRef } from 'react-map-gl/maplibre'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import 'maplibre-gl/dist/maplibre-gl.css'

export interface ShipmentForMap {
  ID: string
  orderNo?: string | null
  originName?: string | null
  originLat: number
  originLng: number
  destName?: string | null
  destLat: number
  destLng: number
  // JSON-encoded array of [lng, lat] pairs
  routeGeojson: string
  shippedAt: string
  etaMinutes: number
  deliveredAt?: string | null
}

// MapLibre style with raw OpenStreetMap raster tiles. Free, attribution
// required, not for production heavy traffic — see operations.osmfoundation.org.
const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
}

interface ParsedRoute {
  coords: [number, number][]
  cumulative: number[] // cumulative distance up to point i (Euclidean lng/lat)
  total: number
}

function parseRoute(json: string): ParsedRoute {
  let coords: [number, number][] = []
  try {
    coords = JSON.parse(json)
  } catch {
    coords = []
  }
  const cumulative = [0]
  for (let i = 1; i < coords.length; i++) {
    const [x1, y1] = coords[i - 1]
    const [x2, y2] = coords[i]
    const dx = x2 - x1
    const dy = y2 - y1
    cumulative.push(cumulative[i - 1] + Math.hypot(dx, dy))
  }
  return { coords, cumulative, total: cumulative[cumulative.length - 1] || 0 }
}

function interpolate(route: ParsedRoute, progress: number) {
  const { coords, cumulative, total } = route
  if (coords.length < 2) return { lng: coords[0]?.[0] ?? 0, lat: coords[0]?.[1] ?? 0, heading: 0 }
  const target = Math.max(0, Math.min(1, progress)) * total
  // Binary search for segment containing target
  let lo = 0
  let hi = cumulative.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (cumulative[mid] < target) lo = mid + 1
    else hi = mid
  }
  const i = Math.max(1, lo)
  const segStart = cumulative[i - 1]
  const segLen = cumulative[i] - segStart || 1
  const t = (target - segStart) / segLen
  const [x1, y1] = coords[i - 1]
  const [x2, y2] = coords[i]
  const lng = x1 + (x2 - x1) * t
  const lat = y1 + (y2 - y1) * t
  const heading = (Math.atan2(x2 - x1, y2 - y1) * 180) / Math.PI
  return { lng, lat, heading }
}

function progressFromTime(shippedAt: string, etaMinutes: number, now: number): number {
  const start = new Date(shippedAt).getTime()
  const end = start + etaMinutes * 60_000
  if (end <= start) return 1
  return Math.max(0, Math.min(1, (now - start) / (end - start)))
}

function fitBounds(shipments: ShipmentForMap[]) {
  if (shipments.length === 0) {
    return { longitude: 10.45, latitude: 51.16, zoom: 5 } // Germany
  }
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity
  for (const s of shipments) {
    minLng = Math.min(minLng, s.originLng, s.destLng)
    maxLng = Math.max(maxLng, s.originLng, s.destLng)
    minLat = Math.min(minLat, s.originLat, s.destLat)
    maxLat = Math.max(maxLat, s.originLat, s.destLat)
  }
  return {
    longitude: (minLng + maxLng) / 2,
    latitude: (minLat + maxLat) / 2,
    zoom: shipments.length === 1 ? 7 : 5.4,
  }
}

export function ShipmentMap({
  shipments,
  height = 480,
  onMarkerClick,
  selectedID,
}: {
  shipments: ShipmentForMap[]
  height?: number | string
  onMarkerClick?: (shipmentID: string) => void
  selectedID?: string | null
}) {
  const theme = useTheme()
  const mapRef = useRef<MapRef | null>(null)
  const [tick, setTick] = useState(0)

  // Animate at ~30fps for smooth marker movement.
  useEffect(() => {
    let alive = true
    const step = () => {
      if (!alive) return
      setTick((t) => (t + 1) % 1_000_000)
      requestAnimationFrame(step)
    }
    const id = requestAnimationFrame(step)
    return () => {
      alive = false
      cancelAnimationFrame(id)
    }
  }, [])

  const parsedRoutes = useMemo(() => {
    const map = new Map<string, ParsedRoute>()
    for (const s of shipments) {
      map.set(s.ID, parseRoute(s.routeGeojson))
    }
    return map
  }, [shipments])

  const initial = useMemo(() => fitBounds(shipments), [shipments])

  // Zoom to fit when shipment set changes.
  useEffect(() => {
    const m = mapRef.current
    if (!m || shipments.length === 0) return
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity
    for (const s of shipments) {
      minLng = Math.min(minLng, s.originLng, s.destLng)
      maxLng = Math.max(maxLng, s.originLng, s.destLng)
      minLat = Math.min(minLat, s.originLat, s.destLat)
      maxLat = Math.max(maxLat, s.originLat, s.destLat)
    }
    if (Number.isFinite(minLng)) {
      m.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60, duration: 600 })
    }
  }, [shipments])

  const now = Date.now()
  void tick // referenced so React re-renders on each animation frame

  return (
    <Box sx={{ width: '100%', height, position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
      <MapLibreMap
        ref={mapRef}
        mapStyle={OSM_STYLE as any}
        initialViewState={initial}
        attributionControl={{ compact: true }}
        cooperativeGestures={shipments.length > 1}
      >
        {shipments.map((s) => {
          const route = parsedRoutes.get(s.ID)
          if (!route) return null
          const lineGeoJson = {
            type: 'Feature' as const,
            properties: {},
            geometry: { type: 'LineString' as const, coordinates: route.coords },
          }
          const isSelected = selectedID === s.ID
          const progress = s.deliveredAt
            ? 1
            : progressFromTime(s.shippedAt, s.etaMinutes, now)
          const pos = interpolate(route, progress)

          return (
            <Box key={s.ID} component="div">
              <Source id={`route-${s.ID}`} type="geojson" data={lineGeoJson}>
                <Layer
                  id={`route-glow-${s.ID}`}
                  type="line"
                  paint={{
                    'line-color': theme.palette.primary.main,
                    'line-width': isSelected ? 10 : 6,
                    'line-opacity': 0.18,
                    'line-blur': 4,
                  }}
                  layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                />
                <Layer
                  id={`route-${s.ID}`}
                  type="line"
                  paint={{
                    'line-color': theme.palette.primary.main,
                    'line-width': isSelected ? 4 : 3,
                    'line-opacity': 0.9,
                  }}
                  layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                />
              </Source>

              <Marker longitude={s.originLng} latitude={s.originLat} anchor="bottom">
                <Box
                  sx={{
                    bgcolor: 'background.paper',
                    border: 2,
                    borderColor: alpha(theme.palette.text.primary, 0.5),
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HomeWorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Box>
              </Marker>

              <Marker longitude={s.destLng} latitude={s.destLat} anchor="bottom">
                <Box sx={{ position: 'relative', width: 36, height: 36 }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      bgcolor: theme.palette.secondary.main,
                      opacity: 0.35,
                      animation: 'shipmentPulse 1.6s ease-out infinite',
                      '@keyframes shipmentPulse': {
                        '0%': { transform: 'scale(0.6)', opacity: 0.5 },
                        '100%': { transform: 'scale(2)', opacity: 0 },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 6,
                      borderRadius: '50%',
                      bgcolor: theme.palette.secondary.main,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 2,
                    }}
                  >
                    <LocationOnIcon sx={{ fontSize: 16, color: '#fff' }} />
                  </Box>
                </Box>
              </Marker>

              <Marker
                longitude={pos.lng}
                latitude={pos.lat}
                anchor="center"
                onClick={(e) => {
                  e.originalEvent.stopPropagation()
                  onMarkerClick?.(s.ID)
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isSelected ? 8 : 4,
                    border: 2,
                    borderColor: '#fff',
                    transform: `rotate(${pos.heading}deg)`,
                    transition: 'box-shadow 0.2s',
                    cursor: onMarkerClick ? 'pointer' : 'default',
                  }}
                >
                  <LocalShippingIcon
                    sx={{
                      fontSize: 18,
                      color: '#fff',
                      transform: `rotate(${-pos.heading}deg)`,
                    }}
                  />
                </Box>
              </Marker>
            </Box>
          )
        })}
      </MapLibreMap>
    </Box>
  )
}
