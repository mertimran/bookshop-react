import { IconButton, Menu, MenuItem, Typography } from '@mui/material'
import LanguageIcon from '@mui/icons-material/Language'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchor(e.currentTarget)}>
        <LanguageIcon />
        <Typography variant="body2" sx={{ ml: 0.5 }}>
          {i18n.language?.toUpperCase().slice(0, 2)}
        </Typography>
      </IconButton>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={i18n.language?.startsWith(lang.code)}
            onClick={() => {
              i18n.changeLanguage(lang.code)
              setAnchor(null)
            }}
          >
            {lang.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
