import React from 'react'
import { theme } from '../../theme/theme'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPreviousPage: () => void
  onNextPage: () => void
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage
}) => {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: theme.spacing.md,
        borderTop: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
        flexShrink: 0
      }}
    >
      <button
        onClick={onPreviousPage}
        disabled={currentPage === 1}
        style={{
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color:
            currentPage === 1 ? theme.colors.text.secondary : theme.colors.primary.main,
          background:
            currentPage === 1
              ? theme.colors.border.default + '40'
              : theme.colors.primary.main + '20',
          border: `1px solid ${
            currentPage === 1 ? theme.colors.border.default : theme.colors.primary.main
          }`,
          borderRadius: theme.borderRadius.sm,
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
      >
        Previous
      </button>
      <span
        style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary
        }}
      >
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        style={{
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color:
            currentPage === totalPages
              ? theme.colors.text.secondary
              : theme.colors.primary.main,
          background:
            currentPage === totalPages
              ? theme.colors.border.default + '40'
              : theme.colors.primary.main + '20',
          border: `1px solid ${
            currentPage === totalPages
              ? theme.colors.border.default
              : theme.colors.primary.main
          }`,
          borderRadius: theme.borderRadius.sm,
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
      >
        Next
      </button>
    </div>
  )
}
