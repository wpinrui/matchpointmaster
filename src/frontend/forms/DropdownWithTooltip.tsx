import React from 'react'
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { theme } from '../../theme/theme'

const DropdownWithTooltip: React.FC<{
  label: string
  options: Record<string, string>
  selectedValue: string
  onChange: (value: string) => void
}> = ({ label, options, selectedValue, onChange }) => (
  <Form.Group controlId={label} style={{ marginBottom: theme.spacing.lg }}>
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
    <OverlayTrigger
      placement="right"
      overlay={
        <Tooltip style={{ maxWidth: '300px' }}>
          {options[selectedValue] || `Select ${label}`}
        </Tooltip>
      }
    >
      <Form.Select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: theme.colors.neutral.white,
          border: `2px solid ${theme.colors.neutral.gray300}`,
          borderRadius: theme.borderRadius.md,
          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.text.primary,
          transition: `all ${theme.transitions.fast}`,
          width: '100%',
          boxShadow: theme.shadows.sm,
          cursor: 'pointer'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = theme.colors.primary.main
          e.target.style.boxShadow = theme.shadows.md
        }}
        onBlur={(e) => {
          e.target.style.borderColor = theme.colors.neutral.gray300
          e.target.style.boxShadow = theme.shadows.sm
        }}
      >
        <option disabled value="">
          Select {label}
        </option>
        {Object.keys(options).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </Form.Select>
    </OverlayTrigger>
  </Form.Group>
)

export default DropdownWithTooltip
