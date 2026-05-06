import { createRootRoute, Outlet, useRouterState, useNavigate } from '@tanstack/react-router'
import { Box, Toolbar } from '@mui/material'
import { useEffect } from 'react'
import { useAuth } from '@bookshop/shared/auth'
import { AdminTopBar } from '../components/layout/AdminTopBar'
import { AdminSidebar } from '../components/layout/AdminSidebar'

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
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminTopBar />
      <AdminSidebar user={user ?? null} onLogout={handleLogout} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          py: { xs: 2, md: 3 },
          px: { xs: 2, md: 3 },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
