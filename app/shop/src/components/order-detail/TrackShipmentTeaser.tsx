import { Box, Typography, Chip, alpha, useTheme } from '@mui/material'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'

/**
 * Compact teaser shown inside the order drawer. Uses a CSS-only "blurred map"
 * background — not a real map — so we don't pay for a tile request just to
 * render this preview.
 */
export function TrackShipmentTeaser({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      sx={{
        position: 'relative',
        height: 120,
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        border: 1,
        borderColor: 'divider',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.5),
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
          transform: 'translateY(-2px)',
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      {/* Fake "map" — radial gradients on a base color, blurred to look like
          out-of-focus terrain. Cheap and free. */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 20% 30%, ${alpha(theme.palette.success.main, 0.45)} 0%, transparent 35%),
            radial-gradient(circle at 75% 60%, ${alpha(theme.palette.info.main, 0.4)} 0%, transparent 40%),
            radial-gradient(circle at 50% 80%, ${alpha(theme.palette.warning.main, 0.35)} 0%, transparent 35%),
            linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)
          `,
          filter: 'blur(14px)',
          transform: 'scale(1.1)', // hide blurred edges
        }}
      />
      {/* Faint route hint — diagonal line */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(105deg, transparent 30%, ${alpha(theme.palette.primary.main, 0.4)} 30%, ${alpha(theme.palette.primary.main, 0.4)} 32%, transparent 32%)`,
          opacity: 0.6,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          gap: 1.5,
          backdropFilter: 'blur(2px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 3,
              flexShrink: 0,
            }}
          >
            <LocalShippingIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={700} noWrap>
              {t('trackShipment')}
            </Typography>
            <Chip
              label={t('liveTracking')}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: 'rgba(255,255,255,0.7)',
                color: 'primary.main',
                mt: 0.5,
              }}
            />
          </Box>
        </Box>
        <ArrowForwardIcon sx={{ color: 'primary.main' }} />
      </Box>
    </Box>
  )
}
