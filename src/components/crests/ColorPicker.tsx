import React from 'react'
import { HexColorPicker } from 'react-colorful'
import { Form } from 'react-bootstrap'
import { theme } from '../../theme/theme'
import { StyledLabel, StyledInput, StyledFlex } from '../../styles'

interface ColorPickerProps {
  label: string
  color: string
  onChange: (color: string) => void
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange }) => {
  return (
    <Form.Group style={{ marginBottom: theme.spacing.lg }}>
      <StyledLabel>{label}</StyledLabel>
      <StyledFlex direction="column" gap="md" align="center">
        <HexColorPicker color={color} onChange={onChange} />
        <StyledFlex align="center" gap="sm" style={{ width: '100%', maxWidth: '200px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: theme.borderRadius.md,
              backgroundColor: color,
              border: `2px solid ${theme.colors.neutral.gray300}`,
              boxShadow: theme.shadows.sm
            }}
          />
          <StyledInput
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            style={{
              flex: 1,
              fontFamily: 'monospace',
              textAlign: 'center'
            }}
            placeholder="#000000"
          />
        </StyledFlex>
      </StyledFlex>
    </Form.Group>
  )
}
