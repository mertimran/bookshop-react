import { IconButton } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

interface ThemeToggleProps {
  mode: 'light' | 'dark'
  onToggle: () => void
}

export function ThemeToggle({ mode, onToggle }: ThemeToggleProps) {
  return (
    <IconButton color="inherit" onClick={onToggle}>
      {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  )
}
