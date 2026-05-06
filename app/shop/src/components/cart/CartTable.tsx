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
import { QuantityStepper } from './QuantityStepper'
import { AnimatedAmount } from './AnimatedAmount'
import type { useCart } from '../../cart'

type Cart = ReturnType<typeof useCart>

export function CartTable({ cart }: { cart: Cart }) {
  const { t } = useTranslation()

  return (
    <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('title')}</TableCell>
            <TableCell align="right">{t('price')}</TableCell>
            <TableCell align="right">{t('quantity')}</TableCell>
            <TableCell align="right">{t('total')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cart.items.map((item) => (
            <TableRow key={item.book.ID} sx={{ '&:last-child td': { border: 0 } }}>
              <TableCell>
                <Typography fontWeight={600}>{item.book.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.book.authorName || item.book.author?.name}
                </Typography>
              </TableCell>
              <TableCell align="right">${item.book.price}</TableCell>
              <TableCell align="right">
                <QuantityStepper
                  value={item.quantity}
                  max={item.book.stock || 99}
                  onChange={(q) => cart.setQuantity(item.book.ID!, q)}
                  onRequestRemove={() => cart.remove(item.book.ID!)}
                />
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                <AnimatedAmount value={(item.book.price ?? 0) * item.quantity} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
