import { Link } from '@tanstack/react-router'
import { Paper, Typography, Button } from '@mui/material'
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart'
import { useTranslation } from 'react-i18next'

export function EmptyCart() {
  const { t } = useTranslation()
  return (
    <Paper sx={{ p: 8, textAlign: 'center', border: 1, borderColor: 'divider' }}>
      <RemoveShoppingCartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
        {t('emptyCart')}
      </Typography>
      <Button component={Link} to="/books" variant="outlined">
        {t('books')}
      </Button>
    </Paper>
  )
}
