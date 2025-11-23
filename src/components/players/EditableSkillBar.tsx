import React from 'react'
import { theme } from '../../theme/theme'
import { getStatColor } from '../../utils/managerStats'

interface EditableSkillBarProps {
  label: string
  value: number
  onChange: (value: number) => void
}

export const EditableSkillBar: React.FC<EditableSkillBarProps> = ({
  label,
  value,
  onChange
}) => {
  const percentage = Math.min(100, Math.max(0, value))
  const color = getStatColor(percentage)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue)) {
      onChange(Math.max(0, Math.min(100, newValue)))
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xs
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: theme.typography.fontSize.sm
        }}
      >
        <span style={{ color: theme.colors.text.secondary }}>{label}</span>
        <input
          type="number"
          min="0"
          max="100"
          value={Math.round(value)}
          onChange={handleInputChange}
          style={{
            width: '50px',
            padding: `${theme.spacing.xs} ${theme.spacing.xs}`,
            borderRadius: theme.borderRadius.sm,
            border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
            background: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.sm,
            textAlign: 'center',
            fontWeight: theme.typography.fontWeight.medium
          }}
        />
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={handleSliderChange}
        style={{
          width: '100%',
          height: '8px',
          borderRadius: theme.borderRadius.full,
          background: theme.colors.border.dark,
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
          appearance: 'none'
        }}
      />
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: theme.colors.border.dark,
          borderRadius: theme.borderRadius.full,
          overflow: 'hidden',
          marginTop: '-12px',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: theme.borderRadius.full,
            transition: 'width 0.1s ease'
          }}
        />
      </div>
    </div>
  )
}
