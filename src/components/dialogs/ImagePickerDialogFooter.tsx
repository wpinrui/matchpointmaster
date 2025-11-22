import React from 'react'
import { Modal } from 'react-bootstrap'
import { theme } from '../../theme/theme'

interface ImagePickerDialogFooterProps {
  selectedFaceUrl: string
  onConfirm: () => void
  onCancel: () => void
}

export const ImagePickerDialogFooter: React.FC<ImagePickerDialogFooterProps> = ({
  selectedFaceUrl,
  onConfirm,
  onCancel
}) => {
  return (
    <Modal.Footer
      style={{
        background: theme.colors.background.primary,
        borderTop: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
        borderRadius: `0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg}`,
        padding: theme.spacing.lg
      }}
    >
      <button
        onClick={onCancel}
        style={{
          padding: `${theme.spacing.md} ${theme.spacing.xl}`,
          background: theme.colors.background.secondary,
          color: theme.colors.text.primary,
          border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
          borderRadius: theme.borderRadius.md,
          cursor: 'pointer',
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.medium,
          marginRight: theme.spacing.md,
          transition: `all ${theme.transitions.fast}`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border.light
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border.default
        }}
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={!selectedFaceUrl}
        style={{
          padding: `${theme.spacing.md} ${theme.spacing.xl}`,
          background: selectedFaceUrl
            ? theme.gradients.primary
            : theme.colors.background.secondary,
          color: selectedFaceUrl
            ? theme.colors.text.inverse
            : theme.colors.text.secondary,
          border: `${theme.borderWidth.default} solid ${
            selectedFaceUrl ? theme.colors.primary.main : theme.colors.border.default
          }`,
          borderRadius: theme.borderRadius.md,
          cursor: selectedFaceUrl ? 'pointer' : 'not-allowed',
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.medium,
          opacity: selectedFaceUrl ? 1 : 0.6,
          transition: `all ${theme.transitions.fast}`
        }}
        onMouseEnter={(e) => {
          if (selectedFaceUrl) {
            e.currentTarget.style.borderColor = theme.colors.neon.primary
          }
        }}
        onMouseLeave={(e) => {
          if (selectedFaceUrl) {
            e.currentTarget.style.borderColor = theme.colors.primary.main
          }
        }}
      >
        Confirm
      </button>
    </Modal.Footer>
  )
}
