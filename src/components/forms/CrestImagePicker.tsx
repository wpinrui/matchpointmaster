import React from 'react'
import { Form } from 'react-bootstrap'
import { theme } from '../../theme/theme'
import GameButton from '../buttons/GameButton'

interface CrestImagePickerProps {
  crestPath?: string
  onPickCrest: () => void
  error?: string
}

export const CrestImagePicker: React.FC<CrestImagePickerProps> = ({
  crestPath,
  onPickCrest,
  error
}) => {
  return (
    <Form.Group style={{ marginBottom: theme.spacing.lg }}>
      {crestPath && (
        <div
          style={{
            marginBottom: theme.spacing.md,
            textAlign: 'center'
          }}
        >
          <img
            src={crestPath}
            alt="School Crest"
            style={{
              width: '150px',
              height: '150px',
              borderRadius: theme.borderRadius.lg,
              border: `3px solid ${theme.colors.secondary.main}`,
              objectFit: 'contain',
              background: 'transparent',
              padding: theme.spacing.sm,
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
          onPickCrest()
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
        {crestPath ? 'Change School Crest' : 'Pick School Crest'}
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
