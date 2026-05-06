import { Link, useRouterState } from '@tanstack/react-router'
import { Button, alpha, useTheme } from '@mui/material'

export function NavLink({ to, label }: { to: string; label: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const theme = useTheme()
  const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)

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
