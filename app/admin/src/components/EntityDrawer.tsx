import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  type DrawerProps,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface EntityDrawerProps extends Omit<DrawerProps, 'anchor' | 'title'> {
  title: React.ReactNode
  subtitle?: React.ReactNode
  onClose: () => void
  actions?: React.ReactNode
  width?: number | string
}

export function EntityDrawer({
  title,
  subtitle,
  onClose,
  actions,
  width = 480,
  children,
  open,
  ...rest
}: EntityDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: (theme) => theme.zIndex.modal }}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: width },
            maxWidth: '100vw',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
      {...rest}
    >
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700} noWrap>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>{children}</Box>

      {actions && (
        <>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {actions}
          </Box>
        </>
      )}
    </Drawer>
  )
}
