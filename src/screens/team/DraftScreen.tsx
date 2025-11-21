import React, { useEffect, useMemo, useState } from 'react'
import GameButton from '../../components/buttons/GameButton'
import GameCard from '../../components/cards/GameCard'
import { PlayerCard } from '../../components/players/PlayerCard'
import { ScreenProps, Screens } from '../../screen_manager/screens'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { theme } from '../../theme/theme'
import { generatePlayersByReputation } from '../../utils/playerGeneration'
import { ConfirmDialog } from '../../components/dialogs/ConfirmDialog'

const DraftScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const {
    players,
    teamRoster,
    updateTeamRoster,
    manager,
    school,
    updatePlayers,
    season,
    draftCompleted,
    updateSeason
  } = useSaveDataContext()

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  // Check if we should show confirmation when leaving
  const handleBackClick = () => {
    if (!draftCompleted && season.phase === 'draft') {
      setShowLeaveConfirm(true)
    } else {
      changeScreen(Screens.HOME)
    }
  }

  const handleConfirmLeave = () => {
    updateSeason.setDraftCompleted(true)
    setShowLeaveConfirm(false)
    changeScreen(Screens.HOME)
  }

  const handleCancelLeave = () => {
    setShowLeaveConfirm(false)
  }

  // Auto-generate 12 players when screen opens if there are no available players (only during draft phase)
  useEffect(() => {
    if (season.phase === 'draft' && !draftCompleted) {
      const availableCount = players.filter((p) => !teamRoster.includes(p.id)).length
      if (availableCount === 0 && manager.stats && school.reputation !== undefined) {
        const newPlayers = generatePlayersByReputation(
          12,
          manager.stats.reputation,
          school.reputation,
          1
        )
        updatePlayers.set([...players, ...newPlayers])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Get players not on the team (available for draft)
  const availablePlayers = useMemo(() => {
    return players.filter((p) => !teamRoster.includes(p.id))
  }, [players, teamRoster])

  // Get players currently on the team
  const teamPlayers = useMemo(() => {
    return players.filter((p) => teamRoster.includes(p.id))
  }, [players, teamRoster])

  const handleDraftPlayer = (playerId: string) => {
    updateTeamRoster.add(playerId)
  }

  const handleRemoveFromTeam = (playerId: string) => {
    updateTeamRoster.remove(playerId)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.lg,
        height: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.xl
        }}
      >
        <h1
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize['3xl'],
            fontWeight: theme.typography.fontWeight.extrabold,
            background: theme.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0
          }}
        >
          Player Draft
        </h1>
        <div style={{ display: 'flex', gap: theme.spacing.md }}>
          <GameButton
            variant="secondary"
            onClick={() => changeScreen(Screens.TEAM_OVERVIEW)}
            type="button"
          >
            View Team
          </GameButton>
          <GameButton variant="secondary" onClick={handleBackClick} type="button">
            Back to Home
          </GameButton>
        </div>
      </div>

      {/* Team Status */}
      <GameCard
        style={{
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.xl
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: theme.typography.fontFamily.heading,
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                margin: 0,
                marginBottom: theme.spacing.xs
              }}
            >
              Team Status
            </h3>
            <p
              style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.secondary,
                margin: 0
              }}
            >
              {teamRoster.length} player{teamRoster.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
      </GameCard>

      {/* Current Team Preview */}
      {teamPlayers.length > 0 && (
        <div style={{ marginBottom: theme.spacing.xl }}>
          <h2
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.lg
            }}
          >
            Your Team ({teamPlayers.length})
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: theme.spacing.md
            }}
          >
            {teamPlayers.map((player) => (
              <div key={player.id} style={{ position: 'relative' }}>
                <PlayerCard player={player} />
                <GameButton
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveFromTeam(player.id)}
                  type="button"
                  style={{
                    position: 'absolute',
                    top: theme.spacing.sm,
                    right: theme.spacing.sm
                  }}
                >
                  Remove
                </GameButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Players */}
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
          Available Players ({availablePlayers.length})
        </h2>
        {availablePlayers.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: theme.spacing.xl,
              color: theme.colors.text.secondary
            }}
          >
            <p style={{ fontSize: theme.typography.fontSize.lg }}>
              {season.phase === 'draft' && !draftCompleted
                ? 'No available players. A new player will be generated automatically.'
                : 'No available players.'}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: theme.spacing.md
            }}
          >
            {availablePlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                actionButton={
                  <GameButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleDraftPlayer(player.id)}
                    type="button"
                    style={{
                      width: '100%'
                    }}
                  >
                    Draft
                  </GameButton>
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showLeaveConfirm}
        title="Leave Draft?"
        message="Are you sure you want to leave the draft? You will not be able to add more players for the rest of the season."
        confirmText="Leave Draft"
        cancelText="Continue Drafting"
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        variant="primary"
      />
    </div>
  )
}

export default DraftScreen
