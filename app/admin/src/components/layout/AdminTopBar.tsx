import { AppBar, Toolbar, Typography } from '@mui/material'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher, ThemeToggle } from '@bookshop/shared/components'
import { useThemeMode } from '@bookshop/shared/hooks'

export function AdminTopBar() {
  const { t } = useTranslation()
  const { mode, toggleTheme } = useThemeMode()

  return (
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
  )
}
