import React from 'react'
import { theme } from '../../theme/theme'

interface CrestGridProps {
  crestOptions: string[]
  selectedCrestUrl: string
  onCrestSelect: (crestUrl: string) => void
}

export const CrestGrid: React.FC<CrestGridProps> = ({
  crestOptions,
  selectedCrestUrl,
  onCrestSelect
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
      {crestOptions.map((crestUrl, index) => {
        const isSelected = crestUrl === selectedCrestUrl
        return (
          <div
            key={index}
            onClick={() => onCrestSelect(crestUrl)}
            style={{
              cursor: 'pointer',
              borderRadius: theme.borderRadius.md,
              border: `3px solid ${
                isSelected ? theme.colors.primary.main : theme.colors.neutral.gray300
              }`,
              padding: theme.spacing.sm,
              background: theme.colors.neutral.white,
              transition: `all ${theme.transitions.normal}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isSelected ? theme.shadows.lg : 'none'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = theme.colors.primary.light
                e.currentTarget.style.boxShadow = theme.shadows.md
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = theme.colors.neutral.gray300
                e.currentTarget.style.boxShadow = 'none'
              } else {
                e.currentTarget.style.borderColor = theme.colors.primary.main
                e.currentTarget.style.boxShadow = theme.shadows.lg
              }
            }}
          >
            <img
              src={crestUrl}
              alt={`Crest option ${index + 1}`}
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
