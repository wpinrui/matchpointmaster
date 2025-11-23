import React from 'react'
import { theme } from '../../theme/theme'

interface ViewModeToggleProps {
  viewMode: 'month' | 'year'
  onViewModeChange: (mode: 'month' | 'year') => void
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: theme.spacing.xs,
        background: theme.colors.border.default + '40',
        padding: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm
      }}
    >
      <button
        onClick={() => onViewModeChange('month')}
        style={{
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color:
            viewMode === 'month'
              ? theme.colors.primary.main
              : theme.colors.text.secondary,
          background:
            viewMode === 'month' ? theme.colors.background.primary : 'transparent',
          border: `1px solid ${
            viewMode === 'month' ? theme.colors.primary.main : theme.colors.border.default
          }`,
          borderRadius: theme.borderRadius.sm,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        Past Month
      </button>
      <button
        onClick={() => onViewModeChange('year')}
        style={{
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color:
            viewMode === 'year' ? theme.colors.primary.main : theme.colors.text.secondary,
          background:
            viewMode === 'year' ? theme.colors.background.primary : 'transparent',
          border: `1px solid ${
            viewMode === 'year' ? theme.colors.primary.main : theme.colors.border.default
          }`,
          borderRadius: theme.borderRadius.sm,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        Year-to-Date
      </button>
    </div>
  )
}
