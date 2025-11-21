import React from 'react'
import { theme } from '../../theme/theme'

interface RandomizeButtonProps {
  onClick: () => void
}

export const RandomizeButton: React.FC<RandomizeButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: `${theme.spacing.md} ${theme.spacing.xl}`,
        background: theme.gradients.primary,
        color: theme.colors.text.inverse,
        border: 'none',
        borderRadius: theme.borderRadius.lg,
        cursor: 'pointer',
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semibold,
        boxShadow: theme.shadows.md,
        transition: `all ${theme.transitions.normal}`,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.boxShadow = theme.shadows.lg
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = theme.shadows.md
      }}
    >
      Randomize Faces
    </button>
  )
}
