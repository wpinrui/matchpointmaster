import React from 'react'
import { Form } from 'react-bootstrap'
import { theme } from '../../theme/theme'
import GameButton from '../buttons/GameButton'

interface ProfileImagePickerProps {
  imagePath?: string
  onPickImage: () => void
  error?: string
  label?: string
  buttonText?: string
  changeButtonText?: string
}

export const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({
  imagePath,
  onPickImage,
  error,
  label = 'Profile Image',
  buttonText = 'Pick Profile Image',
  changeButtonText = 'Change Profile Image'
}) => {
  return (
    <Form.Group style={{ marginBottom: theme.spacing.lg }}>
      {imagePath && (
        <div
          style={{
            marginBottom: theme.spacing.md,
            textAlign: 'center'
          }}
        >
          <img
            src={imagePath}
            alt={label}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: theme.borderRadius.full,
              border: `3px solid ${theme.colors.primary.main}`,
              objectFit: 'cover',
              boxShadow: theme.shadows.lg
            }}
          />
        </div>
      )}
      <GameButton
        variant="secondary"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onPickImage()
        }}
        fullWidth
        type="button"
        style={
          error
            ? {
                border: `2px solid ${theme.colors.error.main}`,
                boxShadow: `0 0 0 0.2rem ${theme.colors.error.light}40`
              }
            : {}
        }
      >
        {imagePath ? changeButtonText : buttonText}
      </GameButton>
      {error && (
        <Form.Text
          style={{
            color: theme.colors.error.main,
            fontSize: theme.typography.fontSize.sm,
            marginTop: theme.spacing.xs,
            display: 'block'
          }}
        >
          {error}
        </Form.Text>
      )}
    </Form.Group>
  )
}
