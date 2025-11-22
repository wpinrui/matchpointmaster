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
      main: '#1A6BA3', // Lighter blue for better visibility on dark theme
      light: '#4A9FD4',
      dark: '#004E89',
      contrast: '#FFFFFF'
    },
    accent: {
      main: '#FFD23F', // Golden yellow
      light: '#FFDC6B',
      dark: '#E6BD2A',
      contrast: '#000000'
    },
    // Background colors - Dark theme
    background: {
      primary: '#0F1115', // Very dark grey for containers
      secondary: '#252932', // Lighter grey for cards
      nested: '#323640', // Even lighter grey for nested cards (cards within cards)
      dark: '#0A0C0F',
      overlay: 'rgba(0, 0, 0, 0.8)'
    },
    // Text colors - Dark theme
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B8C4',
      light: '#6B7280',
      inverse: '#000000'
    },
    // Border colors
    border: {
      default: '#3A3F4E', // Light grey for borders
      light: '#4A4F5E',
      dark: '#2A2F3E',
      selection: '#00D9FF', // Neon blue for selection highlights
      hover: '#6B7280' // Lighter grey for hover effects
    },
    // Neon colors for hover effects
    neon: {
      primary: '#FF8C42', // Neon orange
      secondary: '#00BFFF', // Neon blue
      accent: '#FFEB3B', // Neon yellow
      success: '#00FF88', // Neon green
      danger: '#FF1744' // Neon red
    },
    // Gender colors for player cards
    gender: {
      female: '#FF6B6B', // Lighter red for female
      male: '#5B9BD5' // Lighter blue for male
    },
    // Status colors
    success: {
      main: '#16A34A', // Darker, more saturated green
      light: '#22C55E',
      dark: '#15803D',
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
      primary:
        "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
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
  // Border width for consistent styling
  borderWidth: {
    default: '1.5px',
    thick: '2px',
    thin: '1px'
  },
  // Shadows removed in favor of borders - keeping for backward compatibility but should not be used
  shadows: {
    sm: 'none',
    md: 'none',
    lg: 'none',
    xl: 'none',
    '2xl': 'none',
    inner: 'none',
    glow: 'none',
    glowStrong: 'none'
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
    overlay: 'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.8) 100%)',
    card: '#252932', // Lighter grey for cards - no gradient in dark theme
    nestedCard: '#323640', // Even lighter grey for nested cards
    glass: 'rgba(37, 41, 50, 0.8)' // Card grey with transparency
  }
} as const

export type Theme = typeof theme
