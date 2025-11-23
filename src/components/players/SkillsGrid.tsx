import React from 'react'
import { PlayerSkills } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import { EditableSkillBar } from './EditableSkillBar'

interface SkillsGridProps {
  skills: PlayerSkills
  onSkillChange: (skillName: keyof PlayerSkills, value: number) => void
}

export const SkillsGrid: React.FC<SkillsGridProps> = ({ skills, onSkillChange }) => {
  const skillEntries: Array<{ key: keyof PlayerSkills; label: string }> = [
    { key: 'forehand', label: 'Forehand' },
    { key: 'backhand', label: 'Backhand' },
    { key: 'footwork', label: 'Footwork' },
    { key: 'serve', label: 'Serve' },
    { key: 'receive', label: 'Receive' },
    { key: 'spin', label: 'Spin' },
    { key: 'placement', label: 'Placement' },
    { key: 'consistency', label: 'Consistency' }
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm
      }}
    >
      {skillEntries.map(({ key, label }) => (
        <EditableSkillBar
          key={key}
          label={label}
          value={skills[key]}
          onChange={(value) => onSkillChange(key, value)}
        />
      ))}
    </div>
  )
}
