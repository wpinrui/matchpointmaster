import React from 'react'
import GameCard from '../cards/GameCard'
import { theme } from '../../theme/theme'
import { StyledHeading, StyledText } from '../../styles'

interface TeamStatusCardProps {
  teamSize: number
}

export const TeamStatusCard: React.FC<TeamStatusCardProps> = ({ teamSize }) => {
  return (
    <GameCard style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.xl }}>
      <div>
        <StyledHeading size="h5" margin={`0 0 ${theme.spacing.xs} 0`}>
          Team Status
        </StyledHeading>
        <StyledText size="base" color="secondary" style={{ margin: 0 }}>
          {teamSize} player{teamSize !== 1 ? 's' : ''} selected
        </StyledText>
      </div>
    </GameCard>
  )
}
