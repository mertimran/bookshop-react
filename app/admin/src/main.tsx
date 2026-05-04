import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { initI18n } from '@bookshop/shared/i18n'
import { useThemeMode } from '@bookshop/shared/hooks'
import { routeTree } from './routeTree.gen'

initI18n(['common'])

const basepath = import.meta.env.BASE_URL?.replace(/\/$/, '') || '/'
const router = createRouter({ routeTree, basepath })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  const { theme } = useThemeMode()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
