import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Container,
  Alert,
  alpha,
  useTheme,
  InputAdornment,
  IconButton,
} from '@mui/material'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useAuth } from '@bookshop/shared/auth'

export const Route = createFileRoute('/login')({
  component: AdminLoginPage,
})

function AdminLoginPage() {
  const { t } = useTranslation()
  const { loginAsAdmin, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate({ to: '/' })
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError(t('fillAllFields'))
      return
    }
    setLoading(true)
    setError('')
    try {
      await loginAsAdmin(email, password)
      navigate({ to: '/' })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{ p: 5, border: 1, borderColor: 'divider', textAlign: 'center' }}
        >
          <AdminPanelSettingsIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
            {t('appName')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t('adminSignInSubtitle')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, textAlign: 'left' }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            sx={{ mb: 2.5 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            fullWidth
            label={t('password')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? t('signingIn') : t('signIn')}
          </Button>
        </Paper>
      </Container>
    </Box>
  )
}
