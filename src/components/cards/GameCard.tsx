import React, { CSSProperties } from 'react'
import { theme } from '../../theme/theme'

interface GameCardProps {
  children: React.ReactNode
  title?: string
  glow?: boolean
  className?: string
  style?: CSSProperties
}

const GameCard: React.FC<GameCardProps> = ({
  children,
  title,
  glow = false,
  className = '',
  style
}) => {
  const cardStyle: CSSProperties = {
    background: theme.gradients.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    boxShadow: glow ? theme.shadows.glow : theme.shadows.xl,
    backdropFilter: 'blur(20px)',
    border: `1px solid rgba(255, 255, 255, 0.3)`,
    transition: `all ${theme.transitions.normal}`,
    ...style
  }

  return (
    <div className={`game-card ${className}`} style={cardStyle}>
      {title && (
        <h3
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.lg,
            textAlign: 'center'
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

