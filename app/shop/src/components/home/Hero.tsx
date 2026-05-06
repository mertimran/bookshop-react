import { Link } from '@tanstack/react-router'
import { Box, Container, Typography, Button, alpha, useTheme } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'

export function Hero() {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        textAlign: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '2rem', md: '2.75rem' } }}>
          {t('featuredBooks')}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          fontWeight={400}
          sx={{ maxWidth: 480, mx: 'auto' }}
        >
          {t('browseCollection')}
        </Typography>
        <Button
          component={Link}
          to="/books"
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          sx={{ mt: 4 }}
        >
          {t('books')}
        </Button>
      </Container>
    </Box>
  )
}
