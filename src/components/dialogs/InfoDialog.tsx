import React from 'react'
import { Modal } from 'react-bootstrap'
import { theme } from '../../theme/theme'
import GameButton from '../buttons/GameButton'
import { StyledHeading, StyledText, StyledFlex } from '../../styles'

interface InfoDialogProps {
  isOpen: boolean
  title: string
  message: string
  onClose: () => void
  variant?: 'primary' | 'success' | 'info'
}

export const InfoDialog: React.FC<InfoDialogProps> = ({
  isOpen,
  title,
  message,
  onClose,
  variant = 'info'
}) => {
  // Reuse ConfirmDialog styling patterns
  const getHeaderBackground = () => {
    switch (variant) {
      case 'success':
        return theme.colors.success.main
      case 'primary':
        return theme.gradients.primary
      default:
        return theme.gradients.primary // Same as ConfirmDialog default
    }
  }

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
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
          background: getHeaderBackground(),
          color: theme.colors.text.inverse,
          borderBottom: 'none',
          borderRadius: `${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0`,
          padding: theme.spacing.lg
        }}
      >
        <Modal.Title as={StyledHeading} size="h5">
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          background: theme.colors.background.primary,
          padding: theme.spacing.xl
        }}
      >
        <StyledText size="base" color="primary" style={{ lineHeight: 1.6 }}>
          {message}
        </StyledText>
      </Modal.Body>
      <Modal.Footer
        style={{
          background: theme.colors.background.primary,
          borderTop: `1px solid ${theme.colors.neutral.gray300}`,
          borderRadius: `0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg}`,
          padding: theme.spacing.lg
        }}
      >
        <StyledFlex gap="md" justify="flex-end">
          <GameButton variant="primary" onClick={onClose} type="button">
            OK
          </GameButton>
        </StyledFlex>
      </Modal.Footer>
    </Modal>
  )
}
