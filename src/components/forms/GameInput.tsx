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
    background: theme.colors.neutral.white,
    border: `2px solid ${error ? theme.colors.error.main : theme.colors.neutral.gray300}`,
    borderRadius: theme.borderRadius.md,
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    transition: `all ${theme.transitions.fast}`,
    width: '100%',
    boxShadow: theme.shadows.sm,
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
          e.target.style.borderColor = error
            ? theme.colors.error.main
            : theme.colors.primary.main
          e.target.style.boxShadow = theme.shadows.md
          e.target.style.outline = 'none'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error
            ? theme.colors.error.main
            : theme.colors.neutral.gray300
          e.target.style.boxShadow = theme.shadows.sm
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
