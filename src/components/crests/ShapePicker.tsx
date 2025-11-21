import React from 'react'
import { theme } from '../../theme/theme'

interface ShapePickerProps {
  label: string
  shapes: string[]
  selectedShape: string
  onSelectShape: (shape: string) => void
}

export const ShapePicker: React.FC<ShapePickerProps> = ({
  label,
  shapes,
  selectedShape,
  onSelectShape
}) => {
  return (
    <div style={{ marginBottom: theme.spacing.lg }}>
      <label
        style={{
          display: 'block',
          marginBottom: theme.spacing.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
          fontSize: theme.typography.fontSize.sm
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: theme.spacing.sm,
          width: '100%'
        }}
      >
        {shapes.map((shape) => {
          const isSelected = shape === selectedShape
          return (
            <button
              key={shape}
              type="button"
              onClick={() => onSelectShape(shape)}
              style={{
                padding: theme.spacing.md,
                border: `2px solid ${
                  isSelected ? theme.colors.primary.main : theme.colors.neutral.gray300
                }`,
                borderRadius: theme.borderRadius.md,
                background: isSelected
                  ? theme.colors.primary.light + '20'
                  : theme.colors.neutral.white,
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: isSelected
                  ? theme.typography.fontWeight.medium
                  : theme.typography.fontWeight.normal,
                cursor: 'pointer',
                transition: `all ${theme.transitions.normal}`,
                textTransform: 'capitalize',
                boxShadow: isSelected ? theme.shadows.md : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = theme.colors.primary.light
                  e.currentTarget.style.boxShadow = theme.shadows.sm
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = theme.colors.neutral.gray300
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {shape}
            </button>
          )
        })}
      </div>
    </div>
  )
}

