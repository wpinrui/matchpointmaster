/**
 * MUI Theme Adapter
 * Creates a MUI theme from our custom theme for MUI components
 */

import { createTheme } from '@mui/material/styles'
import { theme as customTheme } from './theme'

export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: customTheme.colors.primary.main,
      light: customTheme.colors.primary.light,
      dark: customTheme.colors.primary.dark,
      contrastText: customTheme.colors.primary.contrast
    },
    secondary: {
      main: customTheme.colors.secondary.main,
      light: customTheme.colors.secondary.light,
      dark: customTheme.colors.secondary.dark,
      contrastText: customTheme.colors.secondary.contrast
    },
    error: {
      main: customTheme.colors.error.main,
      light: customTheme.colors.error.light,
      dark: customTheme.colors.error.dark,
      contrastText: customTheme.colors.error.contrast
    },
    warning: {
      main: customTheme.colors.warning.main,
      light: customTheme.colors.warning.light,
      dark: customTheme.colors.warning.dark,
      contrastText: customTheme.colors.warning.contrast
    },
    success: {
      main: customTheme.colors.success.main,
      light: customTheme.colors.success.light,
      dark: customTheme.colors.success.dark,
      contrastText: customTheme.colors.success.contrast
    },
    background: {
      default: customTheme.colors.background.primary,
      paper: customTheme.colors.background.secondary
    },
    text: {
      primary: customTheme.colors.text.primary,
      secondary: customTheme.colors.text.secondary
    }
  },
  typography: {
    fontFamily: customTheme.typography.fontFamily.primary,
    h1: {
      fontFamily: customTheme.typography.fontFamily.heading,
      fontSize: customTheme.typography.fontSize['5xl'],
      fontWeight: customTheme.typography.fontWeight.bold
    },
    h2: {
      fontFamily: customTheme.typography.fontFamily.heading,
      fontSize: customTheme.typography.fontSize['4xl'],
      fontWeight: customTheme.typography.fontWeight.bold
    },
    h3: {
      fontFamily: customTheme.typography.fontFamily.heading,
      fontSize: customTheme.typography.fontSize['3xl'],
      fontWeight: customTheme.typography.fontWeight.bold
    },
    h4: {
      fontFamily: customTheme.typography.fontFamily.heading,
      fontSize: customTheme.typography.fontSize['2xl'],
      fontWeight: customTheme.typography.fontWeight.bold
    },
    h5: {
      fontFamily: customTheme.typography.fontFamily.heading,
      fontSize: customTheme.typography.fontSize.xl,
      fontWeight: customTheme.typography.fontWeight.bold
    },
    h6: {
      fontFamily: customTheme.typography.fontFamily.heading,
      fontSize: customTheme.typography.fontSize.lg,
      fontWeight: customTheme.typography.fontWeight.bold
    },
    body1: {
      fontSize: customTheme.typography.fontSize.base,
      lineHeight: customTheme.typography.lineHeight.normal
    },
    body2: {
      fontSize: customTheme.typography.fontSize.sm,
      lineHeight: customTheme.typography.lineHeight.normal
    }
  },
  shape: {
    borderRadius: parseInt(customTheme.borderRadius.md.replace('rem', '')) * 16 // Convert rem to px
  },
  spacing: (factor: number) => {
    // Map MUI spacing to our theme spacing
    // MUI spacing is in px, convert our rem values
    const spacingMap: Record<number, number> = {
      1: 4, // xs: 0.25rem = 4px
      2: 8, // sm: 0.5rem = 8px
      4: 16, // md: 1rem = 16px
      6: 24, // lg: 1.5rem = 24px
      8: 32 // xl: 2rem = 32px
    }
    return spacingMap[factor] || factor * 8
  }
})
