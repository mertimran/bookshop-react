import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Box,
  Grid,
  Button,
  Alert,
  Divider,
} from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { useTranslation } from 'react-i18next'
import type { Order } from '@bookshop/shared/api'
import { StatusTimeline } from '@bookshop/shared/components'
import { EntityDrawer } from '../EntityDrawer'
import { STATUS_COLOR } from '../orderStatus'

export function OrderDetailDrawer({
  open,
  detail,
  loading,
  busy,
  error,
  onClose,
  onAction,
}: {
  open: boolean
  detail: Order | null
  loading: boolean
  busy: boolean
  error: string
  onClose: () => void
  onAction: (action: 'confirm' | 'ship' | 'cancel') => void
}) {
  const { t } = useTranslation()

  return (
    <EntityDrawer
      open={open}
      title={detail?.orderNo || t('orderDetails')}
      subtitle={detail?.orderDate ? new Date(detail.orderDate).toLocaleString() : undefined}
      onClose={onClose}
      width={520}
      actions={
        detail && (
          <>
            {detail.status === 'submitted' && (
              <Button
                variant="contained"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={() => onAction('confirm')}
                disabled={busy}
              >
                {t('confirmOrder')}
              </Button>
            )}
            {detail.status === 'confirmed' && (
              <Button
                variant="contained"
                color="warning"
                startIcon={<LocalShippingOutlinedIcon />}
                onClick={() => onAction('ship')}
                disabled={busy}
              >
                {t('shipOrder')}
              </Button>
            )}
            {!['delivered', 'cancelled'].includes(detail.status ?? '') && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                onClick={() => onAction('cancel')}
                disabled={busy}
              >
                {t('cancelOrder')}
              </Button>
            )}
          </>
        )
      }
    >
      {loading && !detail ? (
        <>
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
        </>
      ) : detail ? (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={6}>
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
                  color={STATUS_COLOR[detail.status ?? 'draft'] || 'default'}
                  size="small"
                />
              </Box>
            </Grid>
            <Grid size={6}>
              <Typography
                variant="caption"
                color="text.secondary"
                textTransform="uppercase"
                fontWeight={600}
              >
                {t('total')}
              </Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                ${detail.totalAmount?.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Items
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Book</TableCell>
                  <TableCell align="right">{t('quantity')}</TableCell>
                  <TableCell align="right">{t('amount')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detail.items?.map((item) => (
                  <TableRow key={item.ID} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.book?.title || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${item.unitPrice?.toFixed(2)} × {item.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>${item.amount?.toFixed(2)}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {!detail.items?.length && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary" variant="body2">
                        {t('noData')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

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
    </EntityDrawer>
  )
}
