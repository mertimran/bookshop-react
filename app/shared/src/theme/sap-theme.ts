import { createTheme, type Theme } from '@mui/material/styles'

interface SapThemeParams {
  sapBrandColor?: string
  sapHighlightColor?: string
  sapBaseColor?: string
  sapShellColor?: string
  sapBackgroundColor?: string
  sapTextColor?: string
  sapLinkColor?: string
  sapShell_Background?: string
  sapShell_TextColor?: string
  sapContent_ForegroundColor?: string
  sapButton_Background?: string
  sapButton_BorderColor?: string
  sapField_Background?: string
  sapGroup_TitleBackground?: string
  sapGroup_ContentBackground?: string
  sapList_Background?: string
  sapList_HeaderBackground?: string
  sapErrorColor?: string
  sapWarningColor?: string
  sapSuccessColor?: string
  sapInformationColor?: string
  sapFontFamily?: string
  sapFontSize?: string
}

function getCssVar(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return val || undefined
}

function getSapParam(name: string): string | undefined {
  return getCssVar(`--${name}`) || getCssVar(`--sapTheme_${name}`)
}

export function getSapThemeParams(): SapThemeParams | null {
  const brand = getSapParam('sapBrandColor')
  if (!brand) return null

  const params: SapThemeParams = {}
  const keys: (keyof SapThemeParams)[] = [
    'sapBrandColor', 'sapHighlightColor', 'sapBaseColor', 'sapShellColor',
    'sapBackgroundColor', 'sapTextColor', 'sapLinkColor',
    'sapShell_Background', 'sapShell_TextColor',
    'sapContent_ForegroundColor', 'sapButton_Background', 'sapButton_BorderColor',
    'sapField_Background', 'sapGroup_TitleBackground', 'sapGroup_ContentBackground',
    'sapList_Background', 'sapList_HeaderBackground',
    'sapErrorColor', 'sapWarningColor', 'sapSuccessColor', 'sapInformationColor',
    'sapFontFamily', 'sapFontSize',
  ]

  for (const key of keys) {
    const val = getSapParam(key)
    if (val) params[key] = val
  }

  return params
}

function isDark(color: string): boolean {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

export function buildSapMuiTheme(params: SapThemeParams): Theme {
  const bg = params.sapBackgroundColor || '#f7f8fa'
  const dark = isDark(bg)

  return createTheme({
    palette: {
      mode: dark ? 'dark' : 'light',
      primary: { main: params.sapBrandColor || '#1A7B6E' },
      secondary: { main: params.sapHighlightColor || '#E89C20' },
      background: {
        default: bg,
        paper: params.sapGroup_ContentBackground || (dark ? '#1A1D21' : '#FFFFFF'),
      },
      error: { main: params.sapErrorColor || '#d32f2f' },
      warning: { main: params.sapWarningColor || '#ed6c02' },
      success: { main: params.sapSuccessColor || '#2e7d32' },
      info: { main: params.sapInformationColor || '#0288d1' },
      text: {
        primary: params.sapTextColor || (dark ? '#fff' : '#1a1a1a'),
      },
    },
    typography: {
      fontFamily: params.sapFontFamily || '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 10 },
          contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } },
        },
      },
      MuiCard: {
        styleOverrides: { root: { borderRadius: 16, border: '1px solid', boxShadow: 'none' } },
      },
      MuiPaper: {
        styleOverrides: { root: { borderRadius: 16 } },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderBottom: '1px solid',
            backdropFilter: 'blur(12px)',
            backgroundColor: params.sapShell_Background || undefined,
            color: params.sapShell_TextColor || undefined,
          },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 500, borderRadius: 8 } } },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em',
              backgroundColor: params.sapList_HeaderBackground || undefined,
            },
          },
        },
      },
    },
  })
}

export function isInsideSapShell(): boolean {
  if (typeof window === 'undefined') return false
  return !!(
    (window as any).sap?.ushell ||
    getSapParam('sapBrandColor') ||
    document.querySelector('[data-sap-ui-area]')
  )
}
