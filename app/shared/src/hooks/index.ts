import { useState, useMemo, useCallback, useEffect } from 'react'
import { lightTheme, darkTheme } from '../theme'
import { isInsideSapShell, getSapThemeParams, buildSapMuiTheme } from '../theme/sap-theme'

export function useThemeMode() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem('theme-mode') as 'light' | 'dark') || 'light'
  })

  const [sapThemeParams, setSapThemeParams] = useState(() => getSapThemeParams())

  useEffect(() => {
    if (!isInsideSapShell()) return

    const onThemeChanged = () => setSapThemeParams(getSapThemeParams())

    const coreReady = (window as any).sap?.ui?.getCore?.()
    if (coreReady) {
      coreReady.attachThemeChanged(onThemeChanged)
      return () => coreReady.detachThemeChanged(onThemeChanged)
    }

    const observer = new MutationObserver(() => {
      const params = getSapThemeParams()
      if (params) setSapThemeParams(params)
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
    return () => observer.disconnect()
  }, [])

  const theme = useMemo(() => {
    if (sapThemeParams) return buildSapMuiTheme(sapThemeParams)
    return mode === 'dark' ? darkTheme : lightTheme
  }, [mode, sapThemeParams])

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme-mode', next)
      return next
    })
  }, [])

  return { theme, mode, toggleTheme, isShellManaged: !!sapThemeParams }
}
