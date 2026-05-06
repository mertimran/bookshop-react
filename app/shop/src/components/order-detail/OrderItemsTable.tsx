import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Order } from '@bookshop/shared/api'

export function OrderItemsTable({ items }: { items: Order['items'] }) {
  const { t } = useTranslation()
  const list = items ?? []

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('title')}</TableCell>
            <TableCell align="right">{t('quantity')}</TableCell>
            <TableCell align="right">{t('amount')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map((item) => (
            <TableRow key={item.ID} sx={{ '&:last-child td': { border: 0 } }}>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {item.book?.title ?? 'Unknown'}
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
          {list.length === 0 && (
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
  )
}
