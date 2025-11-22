import React from 'react'
import { Form } from 'react-bootstrap'
import { theme } from '../../theme/theme'
import { Gender } from '../../services/savegame/types'
import { GENDER_OPTIONS } from '../../utils/constants'

interface GenderSelectProps {
  value: Gender
  onChange: (value: Gender) => void
}

export const GenderSelect: React.FC<GenderSelectProps> = ({ value, onChange }) => {
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
        Gender
      </Form.Label>
      <Form.Select
        value={value}
        onChange={(e) => onChange(e.target.value as Gender)}
        style={{
          background: theme.colors.background.secondary,
          border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
          borderRadius: theme.borderRadius.md,
          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.text.primary,
          transition: `all ${theme.transitions.fast}`,
          width: '100%'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = theme.colors.border.selection
        }}
        onBlur={(e) => {
          e.target.style.borderColor = theme.colors.border.default
        }}
      >
        {GENDER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  )
}
