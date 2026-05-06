import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher, ThemeToggle } from '@bookshop/shared/components'
import { useThemeMode } from '@bookshop/shared/hooks'
import { useCart } from '../cart'
import { CartButton } from '../components/layout/CartButton'
import { NavLink } from '../components/layout/NavLink'
import { UserMenu } from '../components/layout/UserMenu'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { t } = useTranslation()
  const { mode, toggleTheme } = useThemeMode()
  const cart = useCart()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isAuthPage) return <Outlet />

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="transparent">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 1 }}>
            <StorefrontIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                fontWeight: 800,
                mr: 4,
                letterSpacing: '-0.02em',
              }}
            >
              {t('appName')}
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
              <NavLink to="/" label={t('home')} />
              <NavLink to="/books" label={t('books')} />
              <NavLink to="/orders" label={t('orders')} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CartButton totalItems={cart.totalItems} />
              <ThemeToggle mode={mode} onToggle={toggleTheme} />
              <LanguageSwitcher />
              <UserMenu />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {t('appName')} &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  )
}
