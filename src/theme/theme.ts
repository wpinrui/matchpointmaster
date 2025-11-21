/**
 * Game Theme Configuration
 * Centralized theme system for consistent styling across the application
 */

export const theme = {
  colors: {
    // Primary game colors - energetic and sporty
    primary: {
      main: '#FF6B35', // Vibrant orange-red
      light: '#FF8C61',
      dark: '#E55A2B',
      contrast: '#FFFFFF'
    },
    secondary: {
      main: '#004E89', // Deep blue
      light: '#1A6BA3',
      dark: '#003A66',
      contrast: '#FFFFFF'
    },
    accent: {
      main: '#FFD23F', // Golden yellow
      light: '#FFDC6B',
      dark: '#E6BD2A',
      contrast: '#000000'
    },
    // Background colors
    background: {
      primary: '#F5F7FA',
      secondary: '#E8ECF1',
      dark: '#1A1D29',
      overlay: 'rgba(0, 0, 0, 0.6)'
    },
    // Text colors
    text: {
      primary: '#1A1D29',
      secondary: '#4A5568',
      light: '#718096',
      inverse: '#FFFFFF'
    },
    // Status colors
    success: {
      main: '#48BB78',
      light: '#68D391',
      dark: '#38A169',
      contrast: '#FFFFFF'
    },
    error: {
      main: '#F56565',
      light: '#FC8181',
      dark: '#E53E3E',
      contrast: '#FFFFFF'
    },
    warning: {
      main: '#ED8936',
      light: '#F6AD55',
      dark: '#DD6B20',
      contrast: '#FFFFFF'
    },
    // Neutral colors
    neutral: {
      white: '#FFFFFF',
      gray50: '#F7FAFC',
      gray100: '#EDF2F7',
      gray200: '#E2E8F0',
      gray300: '#CBD5E0',
      gray400: '#A0AEC0',
      gray500: '#718096',
      gray600: '#4A5568',
      gray700: '#2D3748',
      gray800: '#1A202C',
      gray900: '#171923',
      black: '#000000'
    }
  },
  typography: {
    fontFamily: {
      primary: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
      heading: "'Poppins', 'Inter', sans-serif",
      mono: "'Fira Code', 'Courier New', monospace"
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
      '6xl': '3.75rem' // 60px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2
    }
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
    '4xl': '6rem' // 96px
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem', // 4px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(255, 107, 53, 0.4)',
    glowStrong: '0 0 30px rgba(255, 107, 53, 0.6)'
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  zIndex: {
    base: 1,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070
  },
  gradients: {
    primary: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
    secondary: 'linear-gradient(135deg, #004E89 0%, #0066CC 100%)',
    accent: 'linear-gradient(135deg, #FFD23F 0%, #FFC107 100%)',
    overlay: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%)',
    card: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
  }
} as const

export type Theme = typeof theme

