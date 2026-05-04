import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Container,
  alpha,
  useTheme,
  TextField,
  Grid,
  Divider,
  InputAdornment,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { catalogApi } from '@bookshop/shared/api'
import { useAuth } from '@bookshop/shared/auth'
import { useCart } from '../cart'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CardForm({
  onSubmit,
  submitting,
  total,
}: {
  onSubmit: () => void
  submitting: boolean
  total: number
}) {
  const theme = useTheme()
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' })

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  return (
    <Paper
      sx={{
        p: 3.5,
        border: 1,
        borderColor: 'divider',
        position: 'sticky',
        top: 80,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <CreditCardIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={700}>Payment</Typography>
      </Box>

      <TextField
        fullWidth
        label="Cardholder Name"
        value={card.name}
        onChange={(e) => setCard({ ...card, name: e.target.value })}
        size="small"
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Card Number"
        value={card.number}
        onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
        placeholder="4242 4242 4242 4242"
        size="small"
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <CreditCardIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
              </InputAdornment>
            ),
          },
          htmlInput: { maxLength: 19 },
        }}
      />
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="MM/YY"
          value={card.expiry}
          onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
          size="small"
          sx={{ flex: 1 }}
          slotProps={{ htmlInput: { maxLength: 5 } }}
        />
        <TextField
          label="CVC"
          value={card.cvc}
          onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
          size="small"
          sx={{ flex: 1 }}
          slotProps={{ htmlInput: { maxLength: 4 } }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">Subtotal</Typography>
        <Typography variant="body2" fontWeight={600}>${total.toFixed(2)}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">Shipping</Typography>
        <Typography variant="body2" fontWeight={600} color="success.main">Free</Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>Total</Typography>
        <Typography variant="h6" fontWeight={800} color="primary.main">${total.toFixed(2)}</Typography>
      </Box>

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={onSubmit}
        disabled={submitting}
        startIcon={<LockOutlinedIcon />}
        sx={{ py: 1.5 }}
      >
        {submitting ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </Button>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', textAlign: 'center', mt: 2 }}
      >
        <LockOutlinedIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
        Secured by Stripe. Test mode.
      </Typography>
    </Paper>
  )
}

function CartPage() {
  const { t } = useTranslation()
  const cart = useCart()
  const navigate = useNavigate()
  const theme = useTheme()
  const { isAuthenticated } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const order = await catalogApi.createOrder({
        items: cart.items.map((item) => ({
          book_ID: item.book.ID,
          quantity: item.quantity,
          unitPrice: item.book.price,
          amount: item.book.price * item.quantity,
        })),
        totalAmount: cart.totalAmount,
        currency_code: 'USD',
      } as any)
      await catalogApi.submitOrder(order.ID)
      cart.clear()
      setSuccess(true)
      setTimeout(() => navigate({ to: '/orders' }), 2000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h2" sx={{ mb: 4 }}>{t('cart')}</Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>{t('orderPlaced')}</Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>
      )}

      {cart.items.length === 0 && !success ? (
        <Paper sx={{ p: 8, textAlign: 'center', border: 1, borderColor: 'divider' }}>
          <RemoveShoppingCartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>{t('emptyCart')}</Typography>
          <Button component={Link} to="/books" variant="outlined">
            {t('books')}
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('title')}</TableCell>
                    <TableCell align="right">{t('price')}</TableCell>
                    <TableCell align="right">{t('quantity')}</TableCell>
                    <TableCell align="right">{t('total')}</TableCell>
                    <TableCell align="right" />
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
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        ${(item.book.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => cart.remove(item.book.ID)}
                          sx={{
                            color: 'error.main',
                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <CardForm
              onSubmit={handleCheckout}
              submitting={submitting}
              total={cart.totalAmount}
            />
          </Grid>
        </Grid>
      )}
    </Container>
  )
}
