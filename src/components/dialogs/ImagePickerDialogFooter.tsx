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
        borderTop: `1px solid ${theme.colors.neutral.gray300}`,
        borderRadius: `0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg}`
      }}
    >
      <button
        onClick={onCancel}
        style={{
          padding: `${theme.spacing.md} ${theme.spacing.xl}`,
          background: theme.colors.neutral.gray300,
          color: theme.colors.text.primary,
          border: 'none',
          borderRadius: theme.borderRadius.md,
          cursor: 'pointer',
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.medium,
          marginRight: theme.spacing.md
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
            : theme.colors.neutral.gray300,
          color: selectedFaceUrl
            ? theme.colors.text.inverse
            : theme.colors.text.secondary,
          border: 'none',
          borderRadius: theme.borderRadius.md,
          cursor: selectedFaceUrl ? 'pointer' : 'not-allowed',
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.medium,
          opacity: selectedFaceUrl ? 1 : 0.6
        }}
      >
        Confirm
      </button>
    </Modal.Footer>
  )
}

