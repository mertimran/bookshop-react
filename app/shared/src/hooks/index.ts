import { useState, useMemo, useEffect, useSyncExternalStore } from 'react'
import { lightTheme, darkTheme } from '../theme'
import { isInsideSapShell, getSapThemeParams, buildSapMuiTheme } from '../theme/sap-theme'

type Mode = 'light' | 'dark'

const STORAGE_KEY = 'theme-mode'

let currentMode: Mode = (() => {
  if (typeof window === 'undefined') return 'light'
  return (localStorage.getItem(STORAGE_KEY) as Mode) || 'light'
})()

const listeners = new Set<() => void>()
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb) } }
const getSnapshot = () => currentMode
const getServerSnapshot = (): Mode => 'light'

function setModeShared(next: Mode) {
  if (next === currentMode) return
  currentMode = next
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, next)
  listeners.forEach(l => l())
}

const toggleTheme = () => setModeShared(currentMode === 'light' ? 'dark' : 'light')

export function useThemeMode() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

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

  return { theme, mode, toggleTheme, isShellManaged: !!sapThemeParams }
}
