import React, { useEffect, useMemo, useRef, useState } from 'react'
import GameButton from '../../components/buttons/GameButton'
import GameCard from '../../components/cards/GameCard'
import { ConfirmDialog } from '../../components/dialogs/ConfirmDialog'
import { PlayerCard } from '../../components/players/PlayerCard'
import { ScreenProps, Screens } from '../../screen_manager/screens'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { Gender } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import { GamePhase, getNextPhase } from '../../utils/gamePhases'
import { generatePhaseProgressionEmail } from '../../utils/emailGenerator'
import { generatePlayer, IntakeQuality } from '../../utils/playerGeneration'
import {
  attractivenessToIntakeQuality,
  calculateMaxTeamSize,
  calculatePlayerPoolSize,
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
    updateSeason,
    addEmail
  } = useSaveDataContext()

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const hasGeneratedInitialPoolRef = useRef<boolean>(false)

  // Helper to pick a random element from an array
  const randomFromArray = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
  }

  // Check if we should show confirmation when leaving
  const handleBackClick = () => {
    if (!draftCompleted && season.phase === 'draft') {
      setShowLeaveConfirm(true)
    } else {
      changeScreen(Screens.HOME)
    }
  }

  const handleConfirmLeave = () => {
    // Check if team is empty
    if (teamRoster.length === 0) {
      alert('You cannot leave the draft with an empty team. Please add at least one player before leaving.')
      setShowLeaveConfirm(false)
      return
    }

    const currentMonth = season.month
    const currentYear = season.year
    const currentPhase = GamePhase.DRAFT

    // Mark draft as completed
    updateSeason.setDraftCompleted(true)

    // Progress to February training phase (if still in January/DRAFT)
    if (season.phase === 'draft' && season.month === 1) {
      const nextPhase = getNextPhase(GamePhase.DRAFT, currentMonth)
      updateSeason.setMonth(nextPhase.month)
      updateSeason.setPhase(nextPhase.phase)

      // Generate and add phase progression email
      const phaseProgressionEmail = generatePhaseProgressionEmail(
        manager.fullName || 'Coach',
        school.name || 'the school',
        players,
        teamRoster,
        currentMonth,
        currentYear,
        currentPhase,
        nextPhase.month,
        currentYear,
        nextPhase.phase as GamePhase,
        [] // No previous snapshots for draft phase
      )
      addEmail(phaseProgressionEmail)
    }

    setShowLeaveConfirm(false)
    changeScreen(Screens.HOME)
  }

  const handleEndDraft = () => {
    // Check if team is empty
    if (teamRoster.length === 0) {
      alert('You cannot end the draft with an empty team. Please add at least one player before ending.')
      return
    }

    const currentMonth = season.month
    const currentYear = season.year
    const currentPhase = GamePhase.DRAFT

    // Mark draft as completed
    updateSeason.setDraftCompleted(true)

    // Progress to February training phase
    const nextPhase = getNextPhase(GamePhase.DRAFT, currentMonth)
    updateSeason.setMonth(nextPhase.month)
    updateSeason.setPhase(nextPhase.phase)

    // Generate and add phase progression email
    const phaseProgressionEmail = generatePhaseProgressionEmail(
      manager.fullName || 'Coach',
      school.name || 'the school',
      players,
      teamRoster,
      currentMonth,
      currentYear,
      currentPhase,
      nextPhase.month,
      currentYear,
      nextPhase.phase as GamePhase,
      [] // No previous snapshots for draft phase
    )
    addEmail(phaseProgressionEmail)

    // Navigate to home
    changeScreen(Screens.HOME)
  }

  const handleCancelLeave = () => {
    setShowLeaveConfirm(false)
  }

  // Get players not on the team (available for draft)
  // Filter by school team type: boys-only shows only boys, girls-only shows only girls, both shows all
  const availablePlayers = useMemo(() => {
    const allAvailable = players.filter((p) => !teamRoster.includes(p.id))

    // Filter by team type
    if (school.teamType === 'boys') {
      return allAvailable.filter((p) => p.gender === Gender.MALE)
    } else if (school.teamType === 'girls') {
      return allAvailable.filter((p) => p.gender === Gender.FEMALE)
    }
    // 'both' shows all players
    return allAvailable
  }, [players, teamRoster, school.teamType])

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

  // Get intake quality based on attractiveness
  const intakeInfo = useMemo(() => {
    return attractivenessToIntakeQuality(schoolAttractiveness)
  }, [schoolAttractiveness])

  // Calculate max team size based on funding
  const maxTeamSize = useMemo(() => {
    return calculateMaxTeamSize(school.funding)
  }, [school.funding])

  // Generate initial player pool ONCE when draft screen first loads
  // Only if there are no players yet and we haven't already generated
  useEffect(() => {
    // Only run during draft phase
    if (season.phase !== 'draft' || draftCompleted) {
      return
    }

    // Only generate if we haven't already generated and there are no players
    if (hasGeneratedInitialPoolRef.current || players.length > 0) {
      return
    }

    // Only generate if we have manager stats
    if (!manager.stats) {
      return
    }

    // Calculate pool size (7-15) based on school attractiveness
    const poolSize = calculatePlayerPoolSize(schoolAttractiveness)

    // Get player quality based on attractiveness
    const intakeQualityMap: Record<string, IntakeQuality> = {
      poor: IntakeQuality.POOR,
      below_average: IntakeQuality.BELOW_AVERAGE,
      average: IntakeQuality.AVERAGE,
      above_average: IntakeQuality.ABOVE_AVERAGE,
      excellent: IntakeQuality.EXCELLENT
    }
    const playerQuality = intakeQualityMap[intakeInfo.quality] || IntakeQuality.AVERAGE

    // Determine which gender(s) to generate based on team type
    const gendersToGenerate: Gender[] =
      school.teamType === 'boys'
        ? [Gender.MALE]
        : school.teamType === 'girls'
          ? [Gender.FEMALE]
          : [Gender.MALE, Gender.FEMALE]

    // Generate all players at once
    const newPlayers = Array.from({ length: poolSize }, () => {
      const gender = randomFromArray(gendersToGenerate)
      return generatePlayer(playerQuality, 1, gender)
    })

    // Mark as generated BEFORE updating to prevent double generation
    hasGeneratedInitialPoolRef.current = true

    // Update players - this is the ONLY time we generate players
    updatePlayers.set([...players, ...newPlayers])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount - never again

  // Get players currently on the team
  // Filter by school team type: boys-only shows only boys, girls-only shows only girls, both shows all
  const teamPlayers = useMemo(() => {
    const allTeamPlayers = players.filter((p) => teamRoster.includes(p.id))

    // Filter by team type
    if (school.teamType === 'boys') {
      return allTeamPlayers.filter((p) => p.gender === Gender.MALE)
    } else if (school.teamType === 'girls') {
      return allTeamPlayers.filter((p) => p.gender === Gender.FEMALE)
    }
    // 'both' shows all players
    return allTeamPlayers
  }, [players, teamRoster, school.teamType])

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
          <GameButton variant="success" onClick={handleEndDraft} type="button">
            End Draft
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
            <p style={{ fontSize: theme.typography.fontSize.lg }}>No more players.</p>
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
