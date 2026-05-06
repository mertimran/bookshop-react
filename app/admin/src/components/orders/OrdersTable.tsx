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
  alpha,
  useTheme,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Order } from '@bookshop/shared/api'
import { STATUS_COLOR } from '../orderStatus'

export function OrdersTable({
  orders,
  selectedId,
  onSelect,
}: {
  orders: Order[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('orderNo')}</TableCell>
            <TableCell>{t('orderDate')}</TableCell>
            <TableCell>{t('status')}</TableCell>
            <TableCell align="right">{t('total')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.ID}
              hover
              onClick={() => onSelect(order.ID!)}
              selected={selectedId === order.ID}
              sx={{
                cursor: 'pointer',
                '&:last-child td': { border: 0 },
                '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
              }}
            >
              <TableCell>
                <Typography fontWeight={600}>{order.orderNo}</Typography>
              </TableCell>
              <TableCell>
                {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}
              </TableCell>
              <TableCell>
                <Chip
                  label={t(order.status ?? 'draft')}
                  color={STATUS_COLOR[order.status ?? 'draft'] || 'default'}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight={600}>
                  ${order.totalAmount?.toFixed(2) || '0.00'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">{t('noData')}</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
