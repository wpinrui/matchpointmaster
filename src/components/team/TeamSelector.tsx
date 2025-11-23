import React from 'react'
import { theme } from '../../theme/theme'

type TeamType = 'C boys' | 'C girls' | 'B boys' | 'B girls'

interface TeamSelectorProps {
  availableTeams: TeamType[]
  selectedTeam: TeamType
  onSelectTeam: (team: TeamType) => void
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  availableTeams,
  selectedTeam,
  onSelectTeam
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
        Team
      </label>
      <select
        value={selectedTeam}
        onChange={(e) => onSelectTeam(e.target.value as TeamType)}
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
        {availableTeams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>
    </div>
  )
}
