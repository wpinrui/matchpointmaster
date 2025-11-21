import React, { useEffect, useMemo, useRef, useState } from 'react'
import GameButton from '../../components/buttons/GameButton'
import GameCard from '../../components/cards/GameCard'
import { ConfirmDialog } from '../../components/dialogs/ConfirmDialog'
import { PlayerCard } from '../../components/players/PlayerCard'
import { ScreenProps, Screens } from '../../screen_manager/screens'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { theme } from '../../theme/theme'
import {
  generatePlayer,
  generateWorstPlayer,
  IntakeQuality
} from '../../utils/playerGeneration'
import {
  attractivenessToIntakeQuality,
  calculateSchoolAttractiveness,
  calculateSchoolReputation
} from '../../utils/schoolReputation'

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
  const lastGeneratedCountRef = useRef<number>(0)

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

  // Get players not on the team (available for draft)
  const availablePlayers = useMemo(() => {
    return players.filter((p) => !teamRoster.includes(p.id))
  }, [players, teamRoster])

  // Calculate school reputation from history
  const calculatedSchoolReputation = useMemo(() => {
    return calculateSchoolReputation(school.reputationHistory || [])
  }, [school.reputationHistory])

  // Calculate school attractiveness (combines reputation, funding, and coach)
  const schoolAttractiveness = useMemo(() => {
    if (!manager.stats) return 50 // Default
    return calculateSchoolAttractiveness(
      calculatedSchoolReputation,
      school.funding || 50,
      manager.stats.reputation
    )
  }, [calculatedSchoolReputation, school.funding, manager.stats])

  // Get intake quality and pool size based on attractiveness
  const intakeInfo = useMemo(() => {
    return attractivenessToIntakeQuality(schoolAttractiveness)
  }, [schoolAttractiveness])

  // Auto-generate players when screen opens if there are no available players (only during draft phase)
  useEffect(() => {
    if (season.phase === 'draft' && !draftCompleted) {
      const availableCount = availablePlayers.length
      if (availableCount === 0 && manager.stats) {
        const poolSize = intakeInfo.poolSize
        const intakeQualityMap: Record<string, IntakeQuality> = {
          poor: IntakeQuality.POOR,
          below_average: IntakeQuality.BELOW_AVERAGE,
          average: IntakeQuality.AVERAGE,
          above_average: IntakeQuality.ABOVE_AVERAGE,
          excellent: IntakeQuality.EXCELLENT
        }
        const playerQuality =
          intakeQualityMap[intakeInfo.quality] || IntakeQuality.AVERAGE

        const newPlayers = Array.from({ length: poolSize }, () =>
          generatePlayer(playerQuality, 1)
        )
        updatePlayers.set([...players, ...newPlayers])
        lastGeneratedCountRef.current = poolSize
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Calculate max team size based on funding
  // Minimum: 14 players (low rank schools can only afford either boys or girls)
  // Better funding = more slots for development
  const maxTeamSize = useMemo(() => {
    const baseSize = 14 // Minimum required (can only afford one gender)
    const funding = school.funding || 50
    // Lower funding rank = better funding = more slots
    // Scale from 14 (worst funding) to 48 (best funding)
    const additionalSlots = Math.round(((50 - funding) / 50) * 34) // Up to 34 extra slots
    return baseSize + additionalSlots
  }, [school.funding])

  // Auto-generate one worst player when available players run out (only during draft phase)
  useEffect(() => {
    if (season.phase === 'draft' && !draftCompleted) {
      const availableCount = availablePlayers.length
      const currentTeamSize = teamRoster.length

      // Only generate if:
      // 1. We have 0 available players
      // 2. We haven't just generated one
      // 3. Team hasn't reached funding limit
      if (
        availableCount === 0 &&
        lastGeneratedCountRef.current === 0 &&
        currentTeamSize < maxTeamSize
      ) {
        // Generate worst possible player
        const newPlayer = generateWorstPlayer(1)
        updatePlayers.set([...players, newPlayer])
        lastGeneratedCountRef.current = 1
      } else if (availableCount > 0 && lastGeneratedCountRef.current === 1) {
        // Reset the ref when we have players available again (after generating 1)
        lastGeneratedCountRef.current = 0
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    availablePlayers.length,
    season.phase,
    draftCompleted,
    teamRoster.length,
    maxTeamSize
  ])

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
              <PlayerCard
                key={player.id}
                player={player}
                actionButton={
                  <GameButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveFromTeam(player.id)}
                    type="button"
                    style={{
                      width: '100%'
                    }}
                  >
                    Remove
                  </GameButton>
                }
              />
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
