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
    const colorMap: Record<
      GameButtonVariant,
      { main: string; light: string; dark: string }
    > = {
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
      color: theme.colors.neutral.white, // All buttons have white text
      border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
      borderRadius: theme.borderRadius.lg,
      padding:
        size === 'sm'
          ? `${theme.spacing.sm} ${theme.spacing.md}`
          : size === 'lg'
            ? `${theme.spacing.lg} ${theme.spacing['2xl']}`
            : `${theme.spacing.md} ${theme.spacing.xl}`,
      fontSize:
        size === 'sm'
          ? theme.typography.fontSize.sm
          : size === 'lg'
            ? theme.typography.fontSize.lg
            : theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: props.disabled ? 'not-allowed' : 'pointer',
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
          const neonColorMap: Record<GameButtonVariant, string> = {
            primary: theme.colors.neon.primary,
            secondary: theme.colors.neon.secondary,
            accent: theme.colors.neon.accent,
            success: theme.colors.neon.success,
            danger: theme.colors.neon.danger
          }
          e.currentTarget.style.borderColor = neonColorMap[variant]
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.colors.border.default
      }}
      {...props}
    >
      {icon && <span className="game-button__icon">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}

export default GameButton
