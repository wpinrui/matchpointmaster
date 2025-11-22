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
              border: `${theme.borderWidth.thick} solid ${
                isSelected ? theme.colors.primary.main : theme.colors.border.default
              }`,
              padding: theme.spacing.sm,
              background: theme.colors.background.secondary,
              transition: `all ${theme.transitions.normal}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = theme.colors.primary.light
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = theme.colors.border.default
              } else {
                // Keep selected styling on mouse leave
                e.currentTarget.style.borderColor = theme.colors.primary.main
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
