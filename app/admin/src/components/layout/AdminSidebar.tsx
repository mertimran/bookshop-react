import { Link, useRouterState } from '@tanstack/react-router'
import {
  Box,
  Drawer,
  Toolbar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import { useTranslation } from 'react-i18next'

export const ADMIN_DRAWER_WIDTH = 260

interface AdminUser {
  name: string
  email: string
}

export function AdminSidebar({
  user,
  onLogout,
}: {
  user: AdminUser | null
  onLogout: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const navItems = [
    { to: '/' as const, icon: <DashboardOutlinedIcon />, label: t('dashboard') },
    { to: '/statistics' as const, icon: <InsightsOutlinedIcon />, label: t('statistics') },
    { to: '/books' as const, icon: <MenuBookIcon />, label: t('books') },
    { to: '/orders' as const, icon: <LocalShippingOutlinedIcon />, label: t('orders') },
    { to: '/shipments' as const, icon: <MapOutlinedIcon />, label: t('liveShipments') },
    { to: '/authors' as const, icon: <PeopleOutlinedIcon />, label: t('authors') },
    { to: '/genres' as const, icon: <CategoryOutlinedIcon />, label: t('genres') },
    { to: '/publishers' as const, icon: <BusinessOutlinedIcon />, label: t('publishers') },
  ]

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: ADMIN_DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: ADMIN_DRAWER_WIDTH,
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
            const isActive =
              item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
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
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ display: 'block' }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 2.5,
            py: 1.2,
            px: 2,
            color: 'error.main',
            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
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
  )
}
