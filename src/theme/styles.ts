import React from 'react'
import { theme } from './theme'

/**
 * Reusable style utilities based on the theme
 */

export const createCardStyle = (): React.CSSProperties => ({
  background: theme.gradients.card,
  borderRadius: theme.borderRadius.xl,
  padding: theme.spacing.xl,
  boxShadow: theme.shadows.xl,
  backdropFilter: 'blur(20px)',
  border: `1px solid rgba(255, 255, 255, 0.3)`,
  transition: `all ${theme.transitions.normal}`
})

export const createButtonStyle = (
  variant: 'primary' | 'secondary' | 'accent' | 'success' = 'primary'
): React.CSSProperties => {
  const colorMap = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    success: theme.colors.success
  }

  const colors = colorMap[variant]

  return {
    background: theme.gradients[variant === 'success' ? 'primary' : variant],
    color: colors.contrast,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    boxShadow: theme.shadows.md,
    transition: `all ${theme.transitions.normal}`,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    position: 'relative',
    overflow: 'hidden'
  }
}

export const createInputStyle = (): React.CSSProperties => ({
  background: theme.colors.neutral.white,
  border: `2px solid ${theme.colors.neutral.gray300}`,
  borderRadius: theme.borderRadius.md,
  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
  fontSize: theme.typography.fontSize.base,
  color: theme.colors.text.primary,
  transition: `all ${theme.transitions.fast}`,
  width: '100%',
  boxShadow: theme.shadows.sm
})

export const createContainerStyle = (): React.CSSProperties => ({
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  padding: theme.spacing.md
})

export const createOverlayStyle = (): React.CSSProperties => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: theme.gradients.overlay,
  backdropFilter: 'blur(12px)',
  zIndex: theme.zIndex.base
})

export const createHeadingStyle = (size: 'h1' | 'h2' | 'h3' | 'h4' = 'h1'): React.CSSProperties => {
  const sizeMap = {
    h1: theme.typography.fontSize['5xl'],
    h2: theme.typography.fontSize['4xl'],
    h3: theme.typography.fontSize['3xl'],
    h4: theme.typography.fontSize['2xl']
  }

  return {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: sizeMap[size],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.tight,
    marginBottom: theme.spacing.lg,
    textShadow: `2px 2px 4px rgba(0, 0, 0, 0.1)`
  }
}

