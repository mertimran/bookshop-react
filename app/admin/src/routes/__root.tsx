import { createRootRoute, Link, Outlet, useRouterState, useNavigate } from '@tanstack/react-router'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  alpha,
  useTheme,
} from '@mui/material'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import LogoutIcon from '@mui/icons-material/Logout'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { LanguageSwitcher, ThemeToggle } from '@bookshop/shared/components'
import { useThemeMode } from '@bookshop/shared/hooks'
import { useAuth } from '@bookshop/shared/auth'

const DRAWER_WIDTH = 260

export const Route = createRootRoute({
  component: AdminRoot,
})

function AdminRoot() {
  const { isAuthenticated, user } = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  const isAdmin = isAuthenticated && user?.role === 'admin'

  useEffect(() => {
    if (!isAdmin && pathname !== '/login') {
      navigate({ to: '/login' })
    }
  }, [isAdmin, pathname, navigate])

  if (pathname === '/login') return <Outlet />
  if (!isAdmin) return null
  return <AdminLayout />
}

function AdminLayout() {
  const { t } = useTranslation()
  const { mode, toggleTheme } = useThemeMode()
  const { user, logout } = useAuth()
  const theme = useTheme()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()

  const navItems = [
    { to: '/' as const, icon: <DashboardOutlinedIcon />, label: t('dashboard') },
    { to: '/books' as const, icon: <MenuBookIcon />, label: t('books') },
    { to: '/orders' as const, icon: <LocalShippingOutlinedIcon />, label: t('orders') },
    { to: '/authors' as const, icon: <PeopleOutlinedIcon />, label: t('authors') },
    { to: '/genres' as const, icon: <CategoryOutlinedIcon />, label: t('genres') },
    { to: '/publishers' as const, icon: <BusinessOutlinedIcon />, label: t('publishers') },
  ]

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="transparent"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <AdminPanelSettingsIcon sx={{ mr: 1.5, color: 'secondary.main', fontSize: 28 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {t('appName')}
          </Typography>
          <ThemeToggle mode={mode} onToggle={toggleTheme} />
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: 'none',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ px: 1.5, pt: 2, flex: 1, overflowY: 'auto' }}>
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {navItems.map((item) => {
              const isActive = item.to === '/'
                ? pathname === '/'
                : pathname.startsWith(item.to)

              return (
                <ListItemButton
                  key={item.to}
                  component={Link}
                  to={item.to}
                  sx={{
                    borderRadius: 2.5,
                    py: 1.2,
                    px: 2,
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    color: isActive ? 'primary.main' : 'text.secondary',
                    '&:hover': {
                      bgcolor: isActive
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: { fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' },
                    }}
                  />
                </ListItemButton>
              )
            })}
          </List>
        </Box>

        <Box sx={{ p: 1.5 }}>
          <Divider sx={{ mb: 1.5 }} />
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1, mb: 1 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                  fontWeight: 700,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} noWrap>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {user.email}
                </Typography>
              </Box>
            </Box>
          )}
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2.5,
              py: 1.2,
              px: 2,
              color: 'error.main',
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('signOut')}
              slotProps={{ primary: { fontWeight: 600, fontSize: '0.9rem' } }}
            />
          </ListItemButton>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          ml: `${DRAWER_WIDTH}px`,
          maxWidth: `calc(100% - ${DRAWER_WIDTH}px)`,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
