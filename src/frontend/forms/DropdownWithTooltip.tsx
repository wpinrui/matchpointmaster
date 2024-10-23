import React from 'react'
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap'

const DropdownWithTooltip: React.FC<{
  label: string
  options: Record<string, string>
  selectedValue: string
  onChange: (value: string) => void
}> = ({ label, options, selectedValue, onChange }) => (
  <Form.Group controlId={label}>
    <OverlayTrigger
      placement="right"
      overlay={<Tooltip>{options[selectedValue] || `Select ${label}`}</Tooltip>}
    >
      <Form.Select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        className="mb-2"
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
