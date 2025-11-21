import React, { CSSProperties, useState } from 'react'
import { Form } from 'react-bootstrap'
import InfoIcon from '@mui/icons-material/Info'
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

  const selectStyle: CSSProperties = {
    background: theme.colors.neutral.white,
    border: `2px solid ${isFocused ? theme.colors.primary.main : theme.colors.neutral.gray300}`,
    borderRadius: theme.borderRadius.md,
    padding: `${theme.spacing.md} ${theme.spacing.xl} ${theme.spacing.md} ${theme.spacing.lg}`,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    transition: `all ${theme.transitions.fast}`,
    width: '100%',
    boxShadow: isFocused ? theme.shadows.md : theme.shadows.sm,
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='${encodeURIComponent(isFocused ? theme.colors.primary.main : theme.colors.text.secondary)}' d='M7 10L2 5h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${theme.spacing.md} center`,
    backgroundSize: '14px 14px',
    paddingRight: theme.spacing['2xl']
  }

  return (
    <Form.Group style={{ marginBottom: theme.spacing.lg }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.sm
        }}
      >
        <Form.Label
          style={{
            display: 'block',
            margin: 0,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.sm
          }}
        >
          {label}
        </Form.Label>
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
            {showDescription && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: theme.spacing.sm,
                  background: theme.colors.text.primary,
                  color: theme.colors.text.inverse,
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.sm,
                  maxWidth: '400px',
                  minWidth: '250px',
                  zIndex: theme.zIndex.tooltip,
                  boxShadow: theme.shadows.lg,
                  whiteSpace: 'normal',
                  lineHeight: theme.typography.lineHeight.relaxed,
                  pointerEvents: 'none'
                }}
              >
                {description}
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: `6px solid ${theme.colors.text.primary}`
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <Form.Select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyle}
        onFocus={(e) => {
          setIsFocused(true)
          e.target.style.borderColor = theme.colors.primary.main
          e.target.style.boxShadow = theme.shadows.md
          e.target.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='${encodeURIComponent(theme.colors.primary.main)}' d='M7 10L2 5h10z'/%3E%3C/svg%3E")`
        }}
        onBlur={(e) => {
          setIsFocused(false)
          e.target.style.borderColor = theme.colors.neutral.gray300
          e.target.style.boxShadow = theme.shadows.sm
          e.target.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='${encodeURIComponent(theme.colors.text.secondary)}' d='M7 10L2 5h10z'/%3E%3C/svg%3E")`
        }}
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
        <Form.Text
          style={{
            display: 'block',
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.sm,
            marginTop: theme.spacing.xs,
            lineHeight: theme.typography.lineHeight.relaxed
          }}
        >
          {helperText}
        </Form.Text>
      )}
      {selectedValue && options[selectedValue] && (
        <Form.Text
          style={{
            display: 'block',
            color: theme.colors.primary.main,
            fontSize: theme.typography.fontSize.sm,
            marginTop: theme.spacing.xs,
            fontStyle: 'italic',
            lineHeight: theme.typography.lineHeight.relaxed
          }}
        >
          {options[selectedValue]}
        </Form.Text>
      )}
    </Form.Group>
  )
}

export default GameDropdown
