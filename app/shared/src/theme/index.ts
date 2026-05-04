import { createTheme, type ThemeOptions } from '@mui/material/styles'

const brand = {
  orange: '#E89C20',
  orangeLight: '#F5C565',
  orangeDark: '#C47F0A',
  teal: '#1A7B6E',
  tealLight: '#2A9D8F',
  tealDark: '#145F55',
  sage: '#B8D4C0',
  sageMuted: '#E8F0EB',
}

const commonOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, fontSize: '2.75rem', letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.01em' },
    h3: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.01em' },
    h4: { fontWeight: 600, fontSize: '1.25rem' },
    h5: { fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    button: { fontWeight: 600, letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '8px 20px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
        elevation1: { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderBottom: '1px solid',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, borderRadius: 8 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { border: 'none' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          '&.active': { fontWeight: 600 },
        },
      },
    },
  },
}

export const lightTheme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'light',
    primary: { main: brand.teal, light: brand.tealLight, dark: brand.tealDark },
    secondary: { main: brand.orange, light: brand.orangeLight, dark: brand.orangeDark },
    background: { default: '#F7F8FA', paper: '#FFFFFF' },
    divider: 'rgba(0,0,0,0.06)',
  },
  components: {
    ...commonOptions.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: 'none',
        },
      },
    },
    MuiAppBar: {
      ...commonOptions.components?.MuiAppBar,
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255,255,255,0.85)',
          borderColor: 'rgba(0,0,0,0.06)',
        },
      },
    },
  },
})

export const darkTheme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'dark',
    primary: { main: brand.tealLight, light: brand.sage, dark: brand.teal },
    secondary: { main: brand.orangeLight, light: '#FFD98E', dark: brand.orange },
    background: { default: '#0F1214', paper: '#1A1D21' },
    divider: 'rgba(255,255,255,0.08)',
  },
  components: {
    ...commonOptions.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'none',
        },
      },
    },
    MuiAppBar: {
      ...commonOptions.components?.MuiAppBar,
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(15,18,20,0.85)',
          borderColor: 'rgba(255,255,255,0.08)',
        },
      },
    },
  },
})
