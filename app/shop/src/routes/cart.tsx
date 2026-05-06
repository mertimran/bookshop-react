import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Typography, Alert, Container, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { catalogApi } from '@bookshop/shared/api'
import { useAuth } from '@bookshop/shared/auth'
import { useCart } from '../cart'
import { CartTable } from '../components/cart/CartTable'
import { CardForm } from '../components/cart/CardForm'
import { EmptyCart } from '../components/cart/EmptyCart'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  const { t } = useTranslation()
  const cart = useCart()
  const navigate = useNavigate()
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
          amount: (item.book.price ?? 0) * item.quantity,
        })),
        totalAmount: cart.totalAmount,
        currency_code: 'USD',
      } as any)
      await catalogApi.submitOrder(order.ID!)
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
        <EmptyCart />
      ) : (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <CartTable cart={cart} />
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
