import React, { CSSProperties } from 'react'
import { theme } from '../../theme/theme'

interface GameCardProps {
  children: React.ReactNode
  title?: string
  glow?: boolean
  className?: string
  style?: CSSProperties
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void
}

const GameCard: React.FC<GameCardProps> = ({
  children,
  title,
  glow = false,
  className = '',
  style,
  onClick
}) => {
  const cardStyle: CSSProperties = {
    background: style?.background || theme.gradients.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
    transition: `all ${theme.transitions.normal}`,
    ...style
  }

  return (
    <div
      className={`game-card ${className}`}
      style={cardStyle}
      onMouseEnter={(e) => {
        if (glow) {
          e.currentTarget.style.borderColor = theme.colors.border.selection
        }
      }}
      onMouseLeave={(e) => {
        if (glow) {
          e.currentTarget.style.borderColor = theme.colors.border.default
        }
      }}
      onClick={(e) => {
        if (onClick) {
          onClick(e)
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {title && (
        <h3
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.lg,
            textAlign: 'left'
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

export default GameCard
