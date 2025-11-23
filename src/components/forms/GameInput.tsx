import React, { CSSProperties } from 'react'
import { Form } from 'react-bootstrap'
import { StyledInput, StyledLabel, StyledErrorText, StyledHelperText } from '../../styles'
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
  return (
    <Form.Group
      className={`game-input ${className}`}
      style={{ marginBottom: theme.spacing.lg }}
    >
      {label && <StyledLabel>{label}</StyledLabel>}
      <Form.Control
        as={StyledInput}
        type={props.type || 'text'}
        size={size}
        error={!!error}
        style={style}
        {...props}
      />
      {error && <StyledErrorText>{error}</StyledErrorText>}
      {helperText && !error && <StyledHelperText>{helperText}</StyledHelperText>}
    </Form.Group>
  )
}

export default GameInput
