'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  useMediaQuery,
  GlobalStyles
} from '@mui/material'
import { deepPurple, blue, grey, amber } from '@mui/material/colors'

// Context for theme management
interface ThemeContextType {
  mode: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useThemeMode = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeMode must be used within MaterialThemeProvider')
  }
  return context
}

interface MaterialThemeProviderProps {
  children: React.ReactNode
}

export function MaterialThemeProvider({ children }: MaterialThemeProviderProps) {
  const mode = 'dark' // Always dark mode
  
  // Initialize dark theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  const toggleTheme = () => {
    // No-op since we're always dark mode
  }

  // Create theme based on mode
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? blue[400] : blue[600],
        light: mode === 'dark' ? blue[300] : blue[400],
        dark: mode === 'dark' ? blue[600] : blue[800],
      },
      secondary: {
        main: mode === 'dark' ? deepPurple[300] : deepPurple[500],
        light: mode === 'dark' ? deepPurple[200] : deepPurple[300],
        dark: mode === 'dark' ? deepPurple[500] : deepPurple[700],
      },
      background: {
        default: mode === 'dark' ? '#0a0a0a' : '#f8fafc',
        paper: mode === 'dark' ? '#1a1a1a' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : '#0f172a',
        secondary: mode === 'dark' ? grey[400] : grey[700],
      },
      divider: mode === 'dark' ? grey[800] : grey[200],
      action: {
        hover: mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
        selected: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      },
      success: {
        main: mode === 'dark' ? '#22c55e' : '#059669',
        light: mode === 'dark' ? '#4ade80' : '#10b981',
        dark: mode === 'dark' ? '#16a34a' : '#047857',
      },
      info: {
        main: mode === 'dark' ? '#3b82f6' : '#0ea5e9',
        light: mode === 'dark' ? '#60a5fa' : '#38bdf8',
        dark: mode === 'dark' ? '#2563eb' : '#0284c7',
      },
      warning: {
        main: mode === 'dark' ? '#f59e0b' : '#d97706',
        light: mode === 'dark' ? '#fbbf24' : '#f59e0b',
        dark: mode === 'dark' ? '#d97706' : '#b45309',
      },
      error: {
        main: mode === 'dark' ? '#ef4444' : '#dc2626',
        light: mode === 'dark' ? '#f87171' : '#ef4444',
        dark: mode === 'dark' ? '#dc2626' : '#b91c1c',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 500,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12,
    },
    spacing: 8,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: mode === 'dark' ? '#6b6b6b #2b2b2b' : '#cbd5e1 #f8fafc',
            backgroundColor: mode === 'dark' ? '#0a0a0a' : '#f8fafc',
            color: mode === 'dark' ? '#ffffff' : '#0f172a',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'dark' ? '#2b2b2b' : '#f8fafc',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'dark' ? '#6b6b6b' : '#cbd5e1',
              borderRadius: '3px',
              transition: 'background 0.2s ease',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: mode === 'dark' ? '#8b8b8b' : '#94a3b8',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            boxShadow: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                : '0 2px 8px rgba(0, 0, 0, 0.08)',
              transform: 'translateY(-1px)',
            },
          },
          contained: {
            boxShadow: mode === 'dark' 
              ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
              : '0 1px 3px rgba(0, 0, 0, 0.08)',
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                : '0 4px 12px rgba(0, 0, 0, 0.12)',
              transform: 'translateY(-2px)',
            },
          },
          outlined: {
            borderColor: mode === 'dark' ? grey[600] : grey[300],
            '&:hover': {
              borderColor: mode === 'dark' ? grey[500] : grey[400],
              backgroundColor: mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.04)' 
                : 'rgba(0, 0, 0, 0.02)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'dark' 
              ? '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)' 
              : '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03)',
            border: `1px solid ${mode === 'dark' ? grey[800] : grey[200]}`,
            backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)' 
                : '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 12,
            backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
            boxShadow: mode === 'dark' 
              ? '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)' 
              : '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03)',
            border: `1px solid ${mode === 'dark' ? grey[800] : grey[200]}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${mode === 'dark' ? grey[800] : grey[200]}`,
            backgroundImage: 'none',
            backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
            boxShadow: mode === 'dark' 
              ? '0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 16px rgba(0, 0, 0, 0.3)'
              : '0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 16px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              backgroundColor: mode === 'dark' 
                ? `${blue[600]}20`
                : `${blue[50]}`,
              color: mode === 'dark' ? blue[300] : blue[700],
              borderLeft: `3px solid ${blue[600]}`,
              '&:hover': {
                backgroundColor: mode === 'dark' 
                  ? `${blue[600]}30`
                  : `${blue[100]}`,
              },
            },
            '&:hover': {
              backgroundColor: mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.04)' 
                : 'rgba(0, 0, 0, 0.02)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
            transition: 'all 0.2s ease',
          },
          outlined: {
            borderColor: mode === 'dark' ? grey[700] : grey[300],
            '&:hover': {
              backgroundColor: mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.04)' 
                : 'rgba(0, 0, 0, 0.02)',
            },
          },
          filled: {
            '&:hover': {
              filter: 'brightness(1.1)',
            },
          },
        },
      },
    },
  })

  const globalStyles = (
    <GlobalStyles
      styles={{
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          height: '100%',
          fontSize: '16px',
          backgroundColor: mode === 'dark' ? '#0a0a0a' : '#f8fafc',
        },
        body: {
          height: '100%',
          margin: 0,
          fontFamily: theme.typography.fontFamily,
          backgroundColor: mode === 'dark' ? '#0a0a0a' : '#f8fafc',
          color: mode === 'dark' ? '#ffffff' : '#0f172a',
        },
        '#__next': {
          height: '100%',
          backgroundColor: mode === 'dark' ? '#0a0a0a' : '#f8fafc',
        },
        '#root': {
          height: '100%',
          backgroundColor: mode === 'dark' ? '#0a0a0a' : '#f8fafc',
        },
        // Custom animations
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        '.animate-pulse': {
          animation: 'pulse 2s infinite',
        },
      }}
    />
  )

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {globalStyles}
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
} 