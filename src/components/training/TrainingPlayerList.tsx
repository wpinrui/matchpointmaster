import React from 'react'
import GameCard from '../cards/GameCard'
import GameButton from '../buttons/GameButton'
import { PlayerCard } from '../players/PlayerCard'
import { theme } from '../../theme/theme'
import { Player, TrainingPlan, TrainingFocus } from '../../services/savegame/types'
import { getTrainingFocusDisplayName } from '../../utils/trainingPlans'

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
      <h2
        style={{
          fontFamily: theme.typography.fontFamily.heading,
          fontSize: theme.typography.fontSize['2xl'],
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.lg
        }}
      >
        Team Roster ({teamPlayers.length})
      </h2>
      {teamPlayers.length === 0 ? (
        <GameCard
          style={{
            padding: theme.spacing.xl,
            textAlign: 'center'
          }}
        >
          <p
            style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.secondary
            }}
          >
            No players on the team yet.
          </p>
        </GameCard>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: theme.spacing.md
          }}
        >
          {teamPlayers.map((player) => {
            const playerFocus = getPlayerFocus(player.id)
            const playerAssignment = getPlayerTraining(player.id)
            const hasCoaching = hasIndividualCoaching(player.id)

            return (
              <div key={player.id} style={{ position: 'relative' }}>
                <PlayerCard
                  player={player}
                  actionButton={
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: theme.spacing.xs
                      }}
                    >
                      {playerFocus && (
                        <div
                          style={{
                            padding: theme.spacing.xs,
                            background: hasCoaching
                              ? theme.colors.primary.light + '40'
                              : theme.colors.border.default + '40',
                            borderRadius: theme.borderRadius.sm,
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.text.secondary,
                            textAlign: 'center'
                          }}
                        >
                          {hasCoaching ? '🎯' : '👥'}{' '}
                          {getTrainingFocusDisplayName(playerFocus)}
                        </div>
                      )}
                      <GameButton
                        variant="primary"
                        size="sm"
                        onClick={() => onSelectPlayer(player.id)}
                        style={{ width: '100%' }}
                      >
                        {playerAssignment ? 'Change Training' : 'Set Training'}
                      </GameButton>
                    </div>
                  }
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
