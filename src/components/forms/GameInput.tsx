import React, { CSSProperties } from 'react'
import { Form } from 'react-bootstrap'
import { theme } from '../../theme/theme'

interface GameInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'lg'
  value?: string | number | string[]
}

const GameInput: React.FC<GameInputProps> = ({
  label,
  error,
  helperText,
  className = '',
  style,
  size,
  ...props
}) => {
  const inputStyle: CSSProperties = {
    background: theme.colors.background.secondary,
    border: `${theme.borderWidth.default} solid ${
      error ? theme.colors.error.main : theme.colors.border.default
    }`,
    borderRadius: theme.borderRadius.md,
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    transition: `all ${theme.transitions.fast}`,
    width: '100%',
    ...style
  }

  return (
    <Form.Group
      className={`game-input ${className}`}
      style={{ marginBottom: theme.spacing.lg }}
    >
      {label && (
        <Form.Label
          style={{
            display: 'block',
            marginBottom: theme.spacing.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.sm
          }}
        >
          {label}
        </Form.Label>
      )}
      <Form.Control
        size={size}
        style={inputStyle}
        onFocus={(e) => {
          if (!error) {
            e.target.style.borderColor = theme.colors.border.selection
          }
          e.target.style.outline = 'none'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error
            ? theme.colors.error.main
            : theme.colors.border.default
        }}
        {...props}
      />
      {error && (
        <Form.Text
          style={{
            color: theme.colors.error.main,
            fontSize: theme.typography.fontSize.sm,
            marginTop: theme.spacing.xs
          }}
        >
          {error}
        </Form.Text>
      )}
      {helperText && !error && (
        <Form.Text
          style={{
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.sm,
            marginTop: theme.spacing.xs
          }}
        >
          {helperText}
        </Form.Text>
      )}
    </Form.Group>
  )
}

export default GameInput
