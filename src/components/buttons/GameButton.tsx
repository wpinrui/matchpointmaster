import React, { CSSProperties } from 'react'
import { theme } from '../../theme/theme'

type GameButtonVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'danger'
type GameButtonSize = 'sm' | 'md' | 'lg'

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GameButtonVariant
  size?: GameButtonSize
  children: React.ReactNode
  icon?: React.ReactNode
  fullWidth?: boolean
  glow?: boolean
}

const GameButton: React.FC<GameButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  fullWidth = false,
  glow = false,
  className = '',
  style,
  ...props
}) => {
  const getVariantStyles = (): CSSProperties => {
    const colorMap: Record<GameButtonVariant, { main: string; light: string; dark: string }> = {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      accent: theme.colors.accent,
      success: theme.colors.success,
      danger: theme.colors.error
    }

    const colors = colorMap[variant]
    const gradientMap: Record<GameButtonVariant, string> = {
      primary: theme.gradients.primary,
      secondary: theme.gradients.secondary,
      accent: theme.gradients.accent,
      success: `linear-gradient(135deg, ${colors.main} 0%, ${colors.light} 100%)`,
      danger: `linear-gradient(135deg, ${colors.main} 0%, ${colors.light} 100%)`
    }

    return {
      background: gradientMap[variant],
      color: variant === 'accent' ? theme.colors.text.primary : theme.colors.text.inverse,
      border: 'none',
      borderRadius: theme.borderRadius.lg,
      padding: size === 'sm' ? `${theme.spacing.sm} ${theme.spacing.md}` : size === 'lg' ? `${theme.spacing.lg} ${theme.spacing['2xl']}` : `${theme.spacing.md} ${theme.spacing.xl}`,
      fontSize: size === 'sm' ? theme.typography.fontSize.sm : size === 'lg' ? theme.typography.fontSize.lg : theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      boxShadow: glow ? theme.shadows.glow : theme.shadows.md,
      transition: `all ${theme.transitions.normal}`,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      position: 'relative',
      overflow: 'hidden',
      width: fullWidth ? '100%' : 'auto',
      opacity: props.disabled ? 0.6 : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm
    }
  }

  const buttonStyle: CSSProperties = {
    ...getVariantStyles(),
    ...style
  }

  return (
    <button
      className={`game-button game-button--${variant} game-button--${size} ${className}`}
      style={buttonStyle}
      onMouseEnter={(e) => {
        if (!props.disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = glow ? theme.shadows.glowStrong : theme.shadows.lg
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = glow ? theme.shadows.glow : theme.shadows.md
      }}
      onMouseDown={(e) => {
        if (!props.disabled) {
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
      {...props}
    >
      {icon && <span className="game-button__icon">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}

export default GameButton

