import React from 'react'
import { StyledLabel, StyledSelect } from '../../styles'

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
      <StyledLabel>School</StyledLabel>
      <StyledSelect
        value={selectedSchoolId}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          onSelectSchool(e.target.value)
        }
      >
        {schools.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </StyledSelect>
    </div>
  )
}
