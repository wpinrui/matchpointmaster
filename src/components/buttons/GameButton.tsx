import React, { CSSProperties } from 'react'
import { StyledButton } from '../../styles'

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
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      glow={glow}
      className={`game-button game-button--${variant} game-button--${size} ${className}`}
      style={style}
      {...props}
    >
      {icon && <span className="game-button__icon">{icon}</span>}
      <span>{children}</span>
    </StyledButton>
  )
}

export default GameButton
