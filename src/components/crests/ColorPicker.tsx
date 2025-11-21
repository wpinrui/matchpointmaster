import React from 'react'
import { HexColorPicker } from 'react-colorful'
import { Form } from 'react-bootstrap'
import { theme } from '../../theme/theme'

interface ColorPickerProps {
  label: string
  color: string
  onChange: (color: string) => void
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange }) => {
  return (
    <Form.Group style={{ marginBottom: theme.spacing.lg }}>
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.md,
          alignItems: 'center'
        }}
      >
        <HexColorPicker color={color} onChange={onChange} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            width: '100%',
            maxWidth: '200px'
          }}
        >
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
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            style={{
              flex: 1,
              padding: theme.spacing.sm,
              border: `2px solid ${theme.colors.neutral.gray300}`,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontFamily: 'monospace',
              textAlign: 'center'
            }}
            placeholder="#000000"
          />
        </div>
      </div>
    </Form.Group>
  )
}
