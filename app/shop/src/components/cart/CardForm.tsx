import { useState } from 'react'
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  InputAdornment,
} from '@mui/material'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { AnimatedAmount } from './AnimatedAmount'

export function CardForm({
  onSubmit,
  submitting,
  total,
}: {
  onSubmit: () => void
  submitting: boolean
  total: number
}) {
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
        <Typography variant="h6" fontWeight={700}>
          Payment
        </Typography>
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
          onChange={(e) =>
            setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })
          }
          size="small"
          sx={{ flex: 1 }}
          slotProps={{ htmlInput: { maxLength: 4 } }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Subtotal
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          <AnimatedAmount value={total} />
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Shipping
        </Typography>
        <Typography variant="body2" fontWeight={600} color="success.main">
          Free
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Total
        </Typography>
        <Typography variant="h6" fontWeight={800} color="primary.main">
          <AnimatedAmount value={total} />
        </Typography>
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
        {submitting ? (
          'Processing...'
        ) : (
          <>
            Pay <AnimatedAmount value={total} />
          </>
        )}
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
