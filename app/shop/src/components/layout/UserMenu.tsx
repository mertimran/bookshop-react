import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Box,
  Button,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  alpha,
  useTheme,
} from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '@bookshop/shared/auth'

export function UserMenu() {
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
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
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
          <Typography variant="subtitle2" fontWeight={700}>
            {user!.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user!.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            logout()
            setAnchorEl(null)
          }}
          sx={{ color: 'error.main', mt: 0.5 }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  )
}
