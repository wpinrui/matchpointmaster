import React from 'react'
import GameCard from '../cards/GameCard'
import GameButton from '../buttons/GameButton'
import { PlayerCard } from '../players/PlayerCard'
import { theme } from '../../theme/theme'
import { Player, TrainingPlan, TrainingFocus } from '../../services/savegame/types'
import { getTrainingFocusDisplayName } from '../../utils/trainingPlans'
import { StyledHeading, StyledText, StyledFlex, StyledGrid } from '../../styles'

interface TrainingPlayerListProps {
  teamPlayers: Player[]
  trainingPlan: TrainingPlan
  getPlayerFocus: (playerId: string) => TrainingFocus | null
  getPlayerTraining: (
    playerId: string
  ) => { focus: TrainingFocus | null; isIndividualCoaching: boolean } | null
  hasIndividualCoaching: (playerId: string) => boolean
  onSelectPlayer: (playerId: string) => void
}

export const TrainingPlayerList: React.FC<TrainingPlayerListProps> = ({
  teamPlayers,
  trainingPlan,
  getPlayerFocus,
  getPlayerTraining,
  hasIndividualCoaching,
  onSelectPlayer
}) => {
  return (
    <div>
      <StyledHeading size="h2" margin={`0 0 ${theme.spacing.lg} 0`}>
        Team Roster ({teamPlayers.length})
      </StyledHeading>
      {teamPlayers.length === 0 ? (
        <GameCard style={{ padding: theme.spacing.xl, textAlign: 'center' }}>
          <StyledText size="base" color="secondary">
            No players on the team yet.
          </StyledText>
        </GameCard>
      ) : (
        <StyledGrid columns="repeat(auto-fill, minmax(280px, 1fr))" gap="md">
          {teamPlayers.map((player) => {
            const playerFocus = getPlayerFocus(player.id)
            const playerAssignment = getPlayerTraining(player.id)
            const hasCoaching = hasIndividualCoaching(player.id)

            return (
              <div key={player.id} style={{ position: 'relative' }}>
                <PlayerCard
                  player={player}
                  actionButton={
                    <StyledFlex direction="column" gap="xs">
                      {playerFocus && (
                        <StyledText
                          size="sm"
                          color="secondary"
                          style={{
                            padding: theme.spacing.xs,
                            background: hasCoaching
                              ? theme.colors.primary.light + '40'
                              : theme.colors.border.default + '40',
                            borderRadius: theme.borderRadius.sm,
                            textAlign: 'center'
                          }}
                        >
                          {hasCoaching ? '🎯' : '👥'}{' '}
                          {getTrainingFocusDisplayName(playerFocus)}
                        </StyledText>
                      )}
                      <GameButton
                        variant="primary"
                        size="sm"
                        onClick={() => onSelectPlayer(player.id)}
                        fullWidth
                      >
                        {playerAssignment ? 'Change Training' : 'Set Training'}
                      </GameButton>
                    </StyledFlex>
                  }
                />
              </div>
            )
          })}
        </StyledGrid>
      )}
    </div>
  )
}
