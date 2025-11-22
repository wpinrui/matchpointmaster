import React from 'react'
import { Modal } from 'react-bootstrap'
import { theme } from '../../theme/theme'
import GameButton from '../buttons/GameButton'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string | null
  onConfirm: () => void
  onCancel: () => void
  variant?: 'primary' | 'danger'
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'primary'
}) => {
  return (
    <Modal
      show={isOpen}
      onHide={onCancel}
      backdrop
      keyboard
      centered
      style={{
        zIndex: theme.zIndex.modal
      }}
    >
      <Modal.Header
        closeButton
        style={{
          background:
            variant === 'danger' ? theme.colors.error.main : theme.gradients.primary,
          color: theme.colors.text.inverse,
          borderBottom: 'none',
          borderRadius: `${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0`,
          padding: theme.spacing.lg
        }}
      >
        <Modal.Title
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontWeight: theme.typography.fontWeight.bold,
            fontSize: theme.typography.fontSize.xl
          }}
        >
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          background: theme.colors.background.primary,
          padding: theme.spacing.xl,
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.text.primary,
          lineHeight: 1.6
        }}
      >
        {message}
      </Modal.Body>
      <Modal.Footer
        style={{
          background: theme.colors.background.primary,
          borderTop: `1px solid ${theme.colors.neutral.gray300}`,
          borderRadius: `0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg}`,
          padding: theme.spacing.lg,
          display: 'flex',
          gap: theme.spacing.md,
          justifyContent: 'flex-end'
        }}
      >
        {cancelText !== null && (
          <GameButton variant="secondary" onClick={onCancel} type="button">
            {cancelText}
          </GameButton>
        )}
        <GameButton
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          type="button"
        >
          {confirmText}
        </GameButton>
      </Modal.Footer>
    </Modal>
  )
}
