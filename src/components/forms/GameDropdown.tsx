import React, { useState } from 'react'
import { Form } from 'react-bootstrap'
import InfoIcon from '@mui/icons-material/Info'
import {
  StyledSelect,
  StyledLabel,
  StyledHelperText,
  StyledTooltip,
  StyledFlex,
  StyledText
} from '../../styles'
import { theme } from '../../theme/theme'

interface GameDropdownProps {
  label: string
  options: Record<string, string>
  selectedValue: string
  onChange: (value: string) => void
  helperText?: string
  description?: string
}

const GameDropdown: React.FC<GameDropdownProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  helperText,
  description
}) => {
  const [showDescription, setShowDescription] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  return (
    <Form.Group style={{ marginBottom: theme.spacing.lg }}>
      <StyledFlex align="center" gap="sm" style={{ marginBottom: theme.spacing.sm }}>
        <StyledLabel style={{ margin: 0 }}>{label}</StyledLabel>
        {description && (
          <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setShowDescription(true)}
            onMouseLeave={() => setShowDescription(false)}
          >
            <InfoIcon
              style={{
                fontSize: '16px',
                color: theme.colors.text.secondary,
                cursor: 'help',
                verticalAlign: 'middle'
              }}
            />
            {showDescription && <StyledTooltip>{description}</StyledTooltip>}
          </div>
        )}
      </StyledFlex>
      <Form.Select
        as={StyledSelect}
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        focused={isFocused}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <option disabled value="">
          Select {label}
        </option>
        {Object.entries(options).map(([key, description]) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </Form.Select>
      {helperText && (
        <StyledHelperText style={{ lineHeight: theme.typography.lineHeight.relaxed }}>
          {helperText}
        </StyledHelperText>
      )}
      {selectedValue && options[selectedValue] && (
        <StyledText
          size="sm"
          color="primary"
          style={{
            marginTop: theme.spacing.xs,
            fontStyle: 'italic',
            lineHeight: theme.typography.lineHeight.relaxed
          }}
        >
          {options[selectedValue]}
        </StyledText>
      )}
    </Form.Group>
  )
}

export default GameDropdown
