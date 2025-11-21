import React from 'react'
import { theme } from '../../theme/theme'

interface FaceGridProps {
  faceOptions: string[]
  selectedFaceUrl: string
  onFaceSelect: (faceUrl: string) => void
}

export const FaceGrid: React.FC<FaceGridProps> = ({
  faceOptions,
  selectedFaceUrl,
  onFaceSelect
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: theme.spacing.lg,
        width: '100%',
        maxWidth: '600px'
      }}
    >
      {faceOptions.map((faceUrl, index) => {
        const isSelected = faceUrl === selectedFaceUrl
        return (
          <div
            key={index}
            onClick={() => onFaceSelect(faceUrl)}
            style={{
              cursor: 'pointer',
              borderRadius: theme.borderRadius.md,
              border: `3px solid ${
                isSelected
                  ? theme.colors.primary.main
                  : theme.colors.neutral.gray300
              }`,
              padding: theme.spacing.sm,
              background: theme.colors.neutral.white,
              transition: `all ${theme.transitions.normal}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isSelected ? theme.shadows.lg : 'none',
              transform: isSelected ? 'scale(1.02)' : 'scale(1)'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = theme.colors.primary.light
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = theme.shadows.md
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = theme.colors.neutral.gray300
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              } else {
                // Keep selected styling on mouse leave
                e.currentTarget.style.borderColor = theme.colors.primary.main
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = theme.shadows.lg
              }
            }}
          >
            <img
              src={faceUrl}
              alt={`Face option ${index + 1}`}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: theme.borderRadius.sm,
                display: 'block'
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

