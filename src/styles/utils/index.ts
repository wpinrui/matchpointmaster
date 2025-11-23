/**
 * Style Utilities
 * Helper functions and utilities for consistent styling patterns
 */

import { css, CSSObject } from '@emotion/react'
import { theme } from '../../theme/theme'

// ============================================================================
// CSS Utility Functions
// ============================================================================

/**
 * Creates a hover effect with border color change
 */
export const hoverBorder = (color: string) => css`
  &:hover {
    border-color: ${color};
  }
`

/**
 * Creates a focus effect with border color change
 */
export const focusBorder = (color: string = theme.colors.border.selection) => css`
  &:focus {
    outline: none;
    border-color: ${color};
  }
`

/**
 * Creates a glow effect on hover
 */
export const hoverGlow = (color: string = theme.colors.border.selection) => css`
  transition: all ${theme.transitions.normal};
  &:hover {
    border-color: ${color};
    box-shadow: 0 0 10px rgba(${hexToRgb(color)}, 0.3);
  }
`

/**
 * Creates a smooth transition for all properties
 */
export const transition = (duration: keyof typeof theme.transitions = 'normal') => css`
  transition: all ${theme.transitions[duration]};
`

/**
 * Creates a fade-in animation
 */
export const fadeIn = (duration: string = '0.5s') => css`
  animation: fadeIn ${duration} ease-out;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

/**
 * Creates a slide-in animation
 */
export const slideIn = (
  direction: 'left' | 'right' | 'up' | 'down' = 'left',
  duration: string = '0.4s'
) => {
  const transforms = {
    left: 'translateX(-30px)',
    right: 'translateX(30px)',
    up: 'translateY(-30px)',
    down: 'translateY(30px)'
  }

  return css`
    animation: slideIn ${direction} ${duration} ease-out;
    @keyframes slideIn${direction} {
      from {
        opacity: 0;
        transform: ${transforms[direction]};
      }
      to {
        opacity: 1;
        transform: translate(0);
      }
    }
  `
}

/**
 * Creates a pulse animation
 */
export const pulse = (duration: string = '2s') => css`
  animation: pulse ${duration} ease-in-out infinite;
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`

/**
 * Creates a glow animation
 */
export const glowAnimation = (
  color1: string,
  color2: string,
  duration: string = '2s'
) => css`
  animation: glow ${duration} ease-in-out infinite;
  @keyframes glow {
    0%,
    100% {
      border-color: ${color1};
    }
    50% {
      border-color: ${color2};
    }
  }
`

/**
 * Creates a glassmorphism effect
 */
export const glassmorphism = (opacity: number = 0.8) => css`
  background: rgba(37, 41, 50, ${opacity});
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
`

/**
 * Creates a card style with consistent styling
 */
export const cardStyle = (nested: boolean = false) => css`
  background: ${nested ? theme.gradients.nestedCard : theme.gradients.card};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  border: ${theme.borderWidth.default} solid ${theme.colors.border.default};
  transition: all ${theme.transitions.normal};
`

/**
 * Creates a button style with variant support
 */
export const buttonStyle = (
  variant: 'primary' | 'secondary' | 'accent' | 'success' | 'danger' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md'
) => {
  const gradients = {
    primary: theme.gradients.primary,
    secondary: theme.gradients.secondary,
    accent: theme.gradients.accent,
    success: `linear-gradient(135deg, ${theme.colors.success.main} 0%, ${theme.colors.success.light} 100%)`,
    danger: `linear-gradient(135deg, ${theme.colors.error.main} 0%, ${theme.colors.error.light} 100%)`
  }

  const paddingMap = {
    sm: `${theme.spacing.sm} ${theme.spacing.md}`,
    md: `${theme.spacing.md} ${theme.spacing.xl}`,
    lg: `${theme.spacing.lg} ${theme.spacing['2xl']}`
  }

  const fontSizeMap = {
    sm: theme.typography.fontSize.sm,
    md: theme.typography.fontSize.base,
    lg: theme.typography.fontSize.lg
  }

  return css`
    background: ${gradients[variant]};
    color: ${theme.colors.neutral.white};
    border: ${theme.borderWidth.default} solid ${theme.colors.border.default};
    border-radius: ${theme.borderRadius.lg};
    padding: ${paddingMap[size]};
    font-size: ${fontSizeMap[size]};
    font-weight: ${theme.typography.fontWeight.semibold};
    cursor: pointer;
    transition: all ${theme.transitions.normal};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    overflow: hidden;
  `
}

/**
 * Creates an input style
 */
export const inputStyle = (error: boolean = false) => css`
  background: ${theme.colors.background.secondary};
  border: ${theme.borderWidth.default} solid
    ${error ? theme.colors.error.main : theme.colors.border.default};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  transition: all ${theme.transitions.fast};
  width: 100%;
  font-family: ${theme.typography.fontFamily.primary};

  &:focus {
    outline: none;
    border-color: ${error ? theme.colors.error.main : theme.colors.border.selection};
  }

  &::placeholder {
    color: ${theme.colors.text.light};
  }
`

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts hex color to RGB values
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '0, 0, 0'
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
}

/**
 * Creates a responsive breakpoint
 */
export const breakpoint = {
  sm: (styles: CSSObject) => css`
    @media (min-width: 640px) {
      ${styles}
    }
  `,
  md: (styles: CSSObject) => css`
    @media (min-width: 768px) {
      ${styles}
    }
  `,
  lg: (styles: CSSObject) => css`
    @media (min-width: 1024px) {
      ${styles}
    }
  `,
  xl: (styles: CSSObject) => css`
    @media (min-width: 1280px) {
      ${styles}
    }
  `
}

/**
 * Creates spacing utility
 */
export const spacing = {
  p: (size: keyof typeof theme.spacing) => css`
    padding: ${theme.spacing[size]};
  `,
  pt: (size: keyof typeof theme.spacing) => css`
    padding-top: ${theme.spacing[size]};
  `,
  pr: (size: keyof typeof theme.spacing) => css`
    padding-right: ${theme.spacing[size]};
  `,
  pb: (size: keyof typeof theme.spacing) => css`
    padding-bottom: ${theme.spacing[size]};
  `,
  pl: (size: keyof typeof theme.spacing) => css`
    padding-left: ${theme.spacing[size]};
  `,
  px: (size: keyof typeof theme.spacing) => css`
    padding-left: ${theme.spacing[size]};
    padding-right: ${theme.spacing[size]};
  `,
  py: (size: keyof typeof theme.spacing) => css`
    padding-top: ${theme.spacing[size]};
    padding-bottom: ${theme.spacing[size]};
  `,
  m: (size: keyof typeof theme.spacing) => css`
    margin: ${theme.spacing[size]};
  `,
  mt: (size: keyof typeof theme.spacing) => css`
    margin-top: ${theme.spacing[size]};
  `,
  mr: (size: keyof typeof theme.spacing) => css`
    margin-right: ${theme.spacing[size]};
  `,
  mb: (size: keyof typeof theme.spacing) => css`
    margin-bottom: ${theme.spacing[size]};
  `,
  ml: (size: keyof typeof theme.spacing) => css`
    margin-left: ${theme.spacing[size]};
  `,
  mx: (size: keyof typeof theme.spacing) => css`
    margin-left: ${theme.spacing[size]};
    margin-right: ${theme.spacing[size]};
  `,
  my: (size: keyof typeof theme.spacing) => css`
    margin-top: ${theme.spacing[size]};
    margin-bottom: ${theme.spacing[size]};
  `
}

/**
 * Creates typography utility
 */
export const typography = {
  heading: (size: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h1') => {
    const sizeMap = {
      h1: theme.typography.fontSize['5xl'],
      h2: theme.typography.fontSize['4xl'],
      h3: theme.typography.fontSize['3xl'],
      h4: theme.typography.fontSize['2xl'],
      h5: theme.typography.fontSize.xl,
      h6: theme.typography.fontSize.lg
    }
    return css`
      font-family: ${theme.typography.fontFamily.heading};
      font-size: ${sizeMap[size]};
      font-weight: ${theme.typography.fontWeight.bold};
      color: ${theme.colors.text.primary};
      line-height: ${theme.typography.lineHeight.tight};
    `
  },
  text: (
    size: keyof typeof theme.typography.fontSize = 'base',
    weight: keyof typeof theme.typography.fontWeight = 'normal',
    color: 'primary' | 'secondary' | 'light' = 'primary'
  ) => {
    const colorMap = {
      primary: theme.colors.text.primary,
      secondary: theme.colors.text.secondary,
      light: theme.colors.text.light
    }
    return css`
      font-family: ${theme.typography.fontFamily.primary};
      font-size: ${theme.typography.fontSize[size]};
      font-weight: ${theme.typography.fontWeight[weight]};
      color: ${colorMap[color]};
      line-height: ${theme.typography.lineHeight.normal};
    `
  }
}

