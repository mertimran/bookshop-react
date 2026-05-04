import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Badge,
  IconButton,
  useTheme,
  alpha,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher, ThemeToggle } from '@bookshop/shared/components'
import { useThemeMode } from '@bookshop/shared/hooks'
import { useAuth } from '@bookshop/shared/auth'
import { useCart } from '../cart'
import { useState } from 'react'

export const Route = createRootRoute({
  component: RootLayout,
})

function NavLink({ to, label }: { to: string; label: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const theme = useTheme()
  const isActive = to === '/'
    ? pathname === '/'
    : pathname.startsWith(to)

  return (
    <Button
      component={Link}
      to={to}
      sx={{
        color: isActive ? 'primary.main' : 'text.secondary',
        fontWeight: isActive ? 700 : 500,
        position: 'relative',
        px: 2,
        '&::after': isActive
          ? {
              content: '""',
              position: 'absolute',
              bottom: -1,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 24,
              height: 3,
              borderRadius: 2,
              bgcolor: theme.palette.primary.main,
            }
          : {},
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.06),
        },
      }}
    >
      {label}
    </Button>
  )
}

function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth()
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  if (!isAuthenticated) {
    return (
      <Button
        component={Link}
        to="/login"
        variant="outlined"
        size="small"
        startIcon={<PersonOutlinedIcon />}
        sx={{ borderRadius: 8 }}
      >
        Sign In
      </Button>
    )
  }

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ p: 0.5 }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          {user!.name.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { mt: 1, borderRadius: 3, minWidth: 200 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>{user!.name}</Typography>
          <Typography variant="caption" color="text.secondary">{user!.email}</Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => { logout(); setAnchorEl(null) }}
          sx={{ color: 'error.main', mt: 0.5 }}
        >
          <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  )
}

function RootLayout() {
  const { t } = useTranslation()
  const { mode, toggleTheme } = useThemeMode()
  const cart = useCart()
  const theme = useTheme()
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
              <IconButton
                component={Link}
                to="/cart"
                sx={{
                  color: 'text.secondary',
                  '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.08) },
                }}
              >
                <Badge
                  badgeContent={cart.totalItems}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: 'secondary.main',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    },
                  }}
                >
                  <ShoppingCartOutlinedIcon />
                </Badge>
              </IconButton>
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
