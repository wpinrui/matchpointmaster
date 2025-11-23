import React, { CSSProperties } from 'react'
import { StyledCard, StyledHeading } from '../../styles'

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
  return (
    <StyledCard
      glow={glow}
      clickable={!!onClick}
      onClick={onClick}
      className={className}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {title && <StyledHeading size="h4">{title}</StyledHeading>}
      {children}
    </StyledCard>
  )
}

export default GameCard
