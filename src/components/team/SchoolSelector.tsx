import React from 'react'
import { theme } from '../../theme/theme'

interface School {
  id: string
  name: string
}

interface SchoolSelectorProps {
  schools: School[]
  selectedSchoolId: string
  onSelectSchool: (schoolId: string) => void
}

export const SchoolSelector: React.FC<SchoolSelectorProps> = ({
  schools,
  selectedSchoolId,
  onSelectSchool
}) => {
  return (
    <div style={{ flex: 1, minWidth: '200px' }}>
      <label
        style={{
          display: 'block',
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.xs
        }}
      >
        School
      </label>
      <select
        value={selectedSchoolId}
        onChange={(e) => onSelectSchool(e.target.value)}
        style={{
          width: '100%',
          padding: theme.spacing.sm,
          fontSize: theme.typography.fontSize.base,
          fontFamily: theme.typography.fontFamily.primary,
          border: `1px solid ${theme.colors.neutral.gray300}`,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.background.primary,
          color: theme.colors.text.primary,
          cursor: 'pointer'
        }}
      >
        {schools.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  )
}
