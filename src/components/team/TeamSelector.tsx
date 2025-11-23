import React from 'react'
import { StyledLabel, StyledSelect } from '../../styles'

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
      <StyledLabel>Team</StyledLabel>
      <StyledSelect
        value={selectedTeam}
        onChange={(e) => onSelectTeam(e.target.value as TeamType)}
      >
        {availableTeams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </StyledSelect>
    </div>
  )
}
