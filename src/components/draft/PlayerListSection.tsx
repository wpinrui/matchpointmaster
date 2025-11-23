import React from 'react'
import { Player } from '../../services/savegame/types'
import { PlayerCard } from '../players/PlayerCard'
import GameButton from '../buttons/GameButton'
import { theme } from '../../theme/theme'

interface PlayerListSectionProps {
  title: string
  players: Player[]
  actionButtonLabel: string
  actionButtonVariant: 'primary' | 'danger' | 'secondary' | 'success'
  onPlayerAction: (playerId: string) => void
  emptyMessage?: string
}

export const PlayerListSection: React.FC<PlayerListSectionProps> = ({
  title,
  players,
  actionButtonLabel,
  actionButtonVariant,
  onPlayerAction,
  emptyMessage = 'No players available.'
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
        {title} ({players.length})
      </h2>
      {players.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: theme.spacing.xl,
            color: theme.colors.text.secondary
          }}
        >
          <p style={{ fontSize: theme.typography.fontSize.lg }}>{emptyMessage}</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: theme.spacing.md
          }}
        >
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              actionButton={
                <GameButton
                  variant={actionButtonVariant}
                  size="sm"
                  onClick={() => onPlayerAction(player.id)}
                  type="button"
                  style={{
                    width: '100%'
                  }}
                >
                  {actionButtonLabel}
                </GameButton>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

