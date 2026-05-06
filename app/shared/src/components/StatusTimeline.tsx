import { Box, Typography, alpha, useTheme } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import type { OrderStatusEvent } from '@bookshop/shared/api'
import type { Order as CdsOrder } from '#cds-models/CatalogService'

type Status = NonNullable<CdsOrder['status']>

const HAPPY_PATH: Status[] = ['draft', 'submitted', 'confirmed', 'shipped', 'delivered']

function formatDate(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Step {
  status: Status
  reached: boolean
  current: boolean
  cancelled: boolean
  at?: string | null
}

function buildSteps(events: OrderStatusEvent[], currentStatus: Status | null | undefined): Step[] {
  const eventByStatus = new Map<Status, string | null | undefined>()
  for (const ev of events) {
    if (ev.status) eventByStatus.set(ev.status as Status, ev.at)
  }
  const isCancelled = currentStatus === 'cancelled'
  const reachedIndex = currentStatus
    ? HAPPY_PATH.indexOf(currentStatus as Status)
    : -1

  const steps: Step[] = HAPPY_PATH.map((status, idx) => ({
    status,
    reached: !isCancelled && idx <= reachedIndex,
    current: !isCancelled && status === currentStatus,
    cancelled: false,
    at: eventByStatus.get(status),
  }))

  if (isCancelled) {
    steps.push({
      status: 'cancelled',
      reached: true,
      current: true,
      cancelled: true,
      at: eventByStatus.get('cancelled'),
    })
  }

  return steps
}

export function StatusTimeline({
  events,
  currentStatus,
}: {
  events: OrderStatusEvent[]
  currentStatus: Status | null | undefined
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const sortedEvents = [...events].sort((a, b) => {
    const ta = a.at ? new Date(a.at).getTime() : 0
    const tb = b.at ? new Date(b.at).getTime() : 0
    return ta - tb
  })
  const steps = buildSteps(sortedEvents, currentStatus)

  return (
    <Box sx={{ position: 'relative', pl: 1 }}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1
        const dotColor = step.cancelled
          ? theme.palette.error.main
          : step.reached
            ? theme.palette.primary.main
            : alpha(theme.palette.text.primary, 0.18)
        const labelColor = step.reached || step.current ? 'text.primary' : 'text.disabled'

        return (
          <Box key={step.status} sx={{ display: 'flex', gap: 2, position: 'relative', minHeight: 56 }}>
            <Box
              sx={{
                width: 32,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: dotColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: step.current
                    ? `0 0 0 4px ${alpha(dotColor, 0.18)}`
                    : 'none',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {step.cancelled ? (
                  <CloseIcon sx={{ fontSize: 16 }} />
                ) : step.reached ? (
                  <CheckIcon sx={{ fontSize: 16 }} />
                ) : null}
              </Box>
              {!isLast && (
                <Box
                  sx={{
                    flex: 1,
                    width: 2,
                    bgcolor: step.reached
                      ? alpha(theme.palette.primary.main, 0.4)
                      : alpha(theme.palette.text.primary, 0.08),
                    my: 0.5,
                  }}
                />
              )}
            </Box>
            <Box sx={{ pb: isLast ? 0 : 2.5, flex: 1, minWidth: 0 }}>
              <Typography
                fontWeight={step.current ? 700 : 600}
                color={labelColor}
                sx={{ textTransform: 'capitalize' }}
              >
                {t(step.status)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {step.at ? formatDate(step.at) : step.reached ? '—' : ''}
              </Typography>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
