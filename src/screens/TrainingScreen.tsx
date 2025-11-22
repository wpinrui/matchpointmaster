import React, { useEffect, useMemo, useState } from 'react'
import GameButton from '../components/buttons/GameButton'
import GameCard from '../components/cards/GameCard'
import { PlayerCard } from '../components/players/PlayerCard'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import {
  TrainingFocus,
  PlayerTraining,
  TrainingPlan,
  Gender
} from '../services/savegame/types'

import { theme } from '../theme/theme'
import { MONTH_NAMES } from '../utils/constants'
import { GamePhase, getNextPhase } from '../utils/gamePhases'
import {
  getAllTrainingFocuses,
  getTrainingFocusDisplayName,
  getTrainingFocusDescription,
  initializeTrainingPlan,
  getMaxCoachingSlots,
  getRecommendedTrainingFocus,
  isTournamentPrepPhase
} from '../utils/trainingPlans'
import { processPlayerProgression, createSkillSnapshots } from '../utils/applyProgression'

const TrainingScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const {
    players,
    teamRoster,
    season,
    manager,
    school,
    trainingPlan,
    updateTrainingPlan,
    updateSeason,
    updatePlayers,
    updateSkillSnapshots
  } = useSaveDataContext()

  const [selectedPlayerForTraining, setSelectedPlayerForTraining] = useState<
    string | null
  >(null)
  const [showSetTeamFocus, setShowSetTeamFocus] = useState(false)

  // Initialize training plan if we're in training phase and don't have one yet
  useEffect(() => {
    const isTrainingPhase =
      season.phase === GamePhase.TRAINING || season.phase === GamePhase.TRAINING_2

    if (isTrainingPhase && !trainingPlan) {
      const newPlan = initializeTrainingPlan(season.year, season.month)
      updateTrainingPlan.set(newPlan)
    }
  }, [season, trainingPlan, updateTrainingPlan])

  // Get players currently on the team
  const teamPlayers = useMemo(() => {
    const allTeamPlayers = players.filter((p) => teamRoster.includes(p.id))
    // Filter by team type if needed (same logic as draft screen)
    return allTeamPlayers
  }, [players, teamRoster])

  // Get max coaching slots
  const maxCoachingSlots = useMemo(() => {
    if (!manager.stats) return 5
    return getMaxCoachingSlots(manager.stats.coachingEffectiveness)
  }, [manager.stats])

  // Get recommended focus for current phase
  const recommendedFocus = useMemo(() => {
    return getRecommendedTrainingFocus(season.phase, season.month)
  }, [season.phase, season.month])

  // Check if we're in tournament prep phase
  const isTournamentPrep = useMemo(() => {
    return isTournamentPrepPhase(season.phase, season.month)
  }, [season.phase, season.month])

  // Get player training assignment
  const getPlayerTraining = (playerId: string): PlayerTraining | null => {
    if (!trainingPlan) return null
    return trainingPlan.playerAssignments.find((a) => a.playerId === playerId) || null
  }

  // Check if player has individual coaching
  const hasIndividualCoaching = (playerId: string): boolean => {
    const assignment = getPlayerTraining(playerId)
    return assignment?.isIndividualCoaching ?? false
  }

  // Get training focus for a player (individual or team)
  const getPlayerFocus = (playerId: string): TrainingFocus | null => {
    if (!trainingPlan) return null
    const assignment = getPlayerTraining(playerId)
    if (assignment?.focus) return assignment.focus
    return trainingPlan.teamFocus
  }

  // Handle setting team focus
  const handleSetTeamFocus = (focus: TrainingFocus | null) => {
    if (!trainingPlan) return
    updateTrainingPlan.setTeamFocus(focus)
    setShowSetTeamFocus(false)
  }

  // Handle setting individual player training
  const handleSetPlayerTraining = (
    playerId: string,
    focus: TrainingFocus | null,
    isIndividualCoaching: boolean
  ) => {
    if (!trainingPlan) return

    // Check coaching slots
    const currentSlotsUsed = trainingPlan.coachingSlotsUsed
    const hasCoaching = hasIndividualCoaching(playerId)

    // If adding coaching and no slots available, don't allow
    if (isIndividualCoaching && !hasCoaching && currentSlotsUsed >= maxCoachingSlots) {
      alert(`No coaching slots available. Maximum: ${maxCoachingSlots}`)
      return
    }

    if (focus === null) {
      // Remove individual assignment, player follows team training
      updateTrainingPlan.removePlayerAssignment(playerId)
    } else {
      // Add or update individual assignment
      const assignment: PlayerTraining = {
        playerId,
        focus,
        isIndividualCoaching
      }
      updateTrainingPlan.addPlayerAssignment(assignment)
    }
    setSelectedPlayerForTraining(null)
  }

  // Handle removing individual training (player follows team)
  const handleRemovePlayerTraining = (playerId: string) => {
    updateTrainingPlan.removePlayerAssignment(playerId)
  }

  if (!trainingPlan) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: theme.spacing.lg
        }}
      >
        <p
          style={{
            fontSize: theme.typography.fontSize.lg,
            color: theme.colors.text.secondary
          }}
        >
          Not in training phase
        </p>
        <GameButton variant="primary" onClick={() => changeScreen(Screens.HOME)}>
          Return to Home
        </GameButton>
      </div>
    )
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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.xl,
          gap: theme.spacing.lg
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.extrabold,
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              marginBottom: theme.spacing.xs
            }}
          >
            Training
          </h1>
          <p
            style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.secondary,
              margin: 0
            }}
          >
            {MONTH_NAMES[season.month - 1]} {season.year}
            {isTournamentPrep && ' • Tournament Preparation'}
          </p>
        </div>
        <GameButton
          variant="success"
          onClick={() => {
            const currentPhase = season.phase as GamePhase
            const nextPhase = getNextPhase(currentPhase, season.month)

            // Process player progression before advancing phase
            // Always process progression during training phase, regardless of completed flag
            // This ensures players improve every month during training phase
            if (
              (currentPhase === GamePhase.TRAINING ||
                currentPhase === GamePhase.TRAINING_2) &&
              trainingPlan
            ) {
              // Create skill snapshots before progression (snapshot of current month before advancing)
              const snapshots = createSkillSnapshots(
                players,
                teamRoster,
                season.month,
                season.year
              )
              updateSkillSnapshots.addMany(snapshots)

              // Process progression
              const updatedPlayers = processPlayerProgression(
                players,
                teamRoster,
                trainingPlan,
                manager,
                school,
                season.phase,
                season.month
              )
              updatePlayers.set(updatedPlayers)

              // Mark training plan as completed for this month
              updateTrainingPlan.setCompleted(true)
            }

            // Update season to next month/phase
            updateSeason.setMonth(nextPhase.month)
            updateSeason.setPhase(nextPhase.phase)

            // If entering a new training month, reset completed flag and update month/year
            if (
              (nextPhase.phase === GamePhase.TRAINING ||
                nextPhase.phase === GamePhase.TRAINING_2) &&
              trainingPlan
            ) {
              // Check if training plan month/year doesn't match next month (new training month)
              const newYear = nextPhase.month === 1 ? season.year + 1 : season.year
              if (
                trainingPlan.month !== nextPhase.month ||
                trainingPlan.year !== newYear
              ) {
                // Update training plan to reflect new month/year and reset completed flag
                updateTrainingPlan.setMonthAndYear(nextPhase.month, newYear)
                updateTrainingPlan.setCompleted(false)
              }
            }

            // Reset draft if it's a new year
            if (nextPhase.month === 1) {
              updateSeason.setDraftCompleted(false)
            }

            // Navigate back to home screen
            changeScreen(Screens.HOME)
          }}
          type="button"
          size="lg"
          glow
          style={{ flexShrink: 0 }}
        >
          Continue to Next Month
        </GameButton>
      </div>

      {/* Training Plan Overview */}
      <GameCard
        style={{
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.lg
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: theme.spacing.lg
          }}
        >
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontFamily: theme.typography.fontFamily.heading,
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                margin: 0,
                marginBottom: theme.spacing.sm
              }}
            >
              Training Plan
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.xs
              }}
            >
              <div>
                <strong style={{ color: theme.colors.text.primary }}>Team Focus:</strong>{' '}
                {trainingPlan.teamFocus ? (
                  <span style={{ color: theme.colors.text.secondary }}>
                    {getTrainingFocusDisplayName(trainingPlan.teamFocus)}
                  </span>
                ) : (
                  <span
                    style={{ color: theme.colors.text.secondary, fontStyle: 'italic' }}
                  >
                    Not set
                  </span>
                )}
              </div>
              <div>
                <strong style={{ color: theme.colors.text.primary }}>
                  Individual Coaching:
                </strong>{' '}
                <span style={{ color: theme.colors.text.secondary }}>
                  {trainingPlan.coachingSlotsUsed} / {maxCoachingSlots} slots used
                </span>
              </div>
              <div>
                <strong style={{ color: theme.colors.text.primary }}>
                  Players with Individual Plans:
                </strong>{' '}
                <span style={{ color: theme.colors.text.secondary }}>
                  {trainingPlan.playerAssignments.length}
                </span>
              </div>
            </div>
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}
          >
            <GameButton
              variant="primary"
              size="sm"
              onClick={() => setShowSetTeamFocus(true)}
            >
              {trainingPlan.teamFocus ? 'Change Team Focus' : 'Set Team Focus'}
            </GameButton>
            {recommendedFocus && !trainingPlan.teamFocus && (
              <GameButton
                variant="secondary"
                size="sm"
                onClick={() => handleSetTeamFocus(recommendedFocus)}
              >
                Use Recommended ({getTrainingFocusDisplayName(recommendedFocus)})
              </GameButton>
            )}
          </div>
        </div>
      </GameCard>

      {/* Set Team Focus Dialog */}
      {showSetTeamFocus && (
        <GameCard
          style={{
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            border: `${theme.borderWidth.default} solid ${theme.colors.primary.main}`
          }}
        >
          <h3
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: 0,
              marginBottom: theme.spacing.md
            }}
          >
            Set Team Training Focus
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.md
            }}
          >
            {getAllTrainingFocuses().map((focus) => (
              <GameButton
                key={focus}
                variant={trainingPlan.teamFocus === focus ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleSetTeamFocus(focus)}
                style={{ textAlign: 'left' }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing.xs
                  }}
                >
                  <strong>{getTrainingFocusDisplayName(focus)}</strong>
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      opacity: 0.8
                    }}
                  >
                    {getTrainingFocusDescription(focus)}
                  </span>
                </div>
              </GameButton>
            ))}
          </div>
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <GameButton
              variant="secondary"
              size="sm"
              onClick={() => {
                handleSetTeamFocus(null)
                setShowSetTeamFocus(false)
              }}
            >
              Clear Team Focus
            </GameButton>
            <GameButton
              variant="secondary"
              size="sm"
              onClick={() => setShowSetTeamFocus(false)}
            >
              Cancel
            </GameButton>
          </div>
        </GameCard>
      )}

      {/* Individual Player Training Assignment */}
      {selectedPlayerForTraining && (
        <PlayerTrainingDialog
          playerId={selectedPlayerForTraining}
          currentAssignment={getPlayerTraining(selectedPlayerForTraining)}
          teamFocus={trainingPlan.teamFocus}
          coachingSlotsUsed={trainingPlan.coachingSlotsUsed}
          maxCoachingSlots={maxCoachingSlots}
          hasCoaching={hasIndividualCoaching(selectedPlayerForTraining)}
          onSet={(focus, isIndividualCoaching) =>
            handleSetPlayerTraining(
              selectedPlayerForTraining,
              focus,
              isIndividualCoaching
            )
          }
          onRemove={() => {
            handleRemovePlayerTraining(selectedPlayerForTraining)
            setSelectedPlayerForTraining(null)
          }}
          onClose={() => setSelectedPlayerForTraining(null)}
        />
      )}

      {/* Players List */}
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
                          onClick={() => setSelectedPlayerForTraining(player.id)}
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
    </div>
  )
}

// Player Training Dialog Component
interface PlayerTrainingDialogProps {
  playerId: string
  currentAssignment: PlayerTraining | null
  teamFocus: TrainingFocus | null
  coachingSlotsUsed: number
  maxCoachingSlots: number
  hasCoaching: boolean
  onSet: (focus: TrainingFocus | null, isIndividualCoaching: boolean) => void
  onRemove: () => void
  onClose: () => void
}

const PlayerTrainingDialog: React.FC<PlayerTrainingDialogProps> = ({
  playerId,
  currentAssignment,
  teamFocus,
  coachingSlotsUsed,
  maxCoachingSlots,
  hasCoaching,
  onSet,
  onRemove,
  onClose
}) => {
  const { players } = useSaveDataContext()
  const [selectedFocus, setSelectedFocus] = useState<TrainingFocus | null>(
    currentAssignment?.focus ?? teamFocus ?? null
  )
  const [useIndividualCoaching, setUseIndividualCoaching] = useState<boolean>(hasCoaching)

  const player = players.find((p) => p.id === playerId)
  if (!player) return null

  const canUseCoaching =
    useIndividualCoaching && hasCoaching
      ? true // Already has coaching slot
      : coachingSlotsUsed < maxCoachingSlots // Has available slot

  const handleConfirm = () => {
    if (selectedFocus === null) {
      onRemove()
    } else {
      onSet(selectedFocus, useIndividualCoaching && canUseCoaching)
    }
  }

  return (
    <GameCard
      style={{
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        border: `${theme.borderWidth.default} solid ${theme.colors.primary.main}`
      }}
    >
      <h3
        style={{
          fontFamily: theme.typography.fontFamily.heading,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          margin: 0,
          marginBottom: theme.spacing.sm
        }}
      >
        Set Training for {player.firstName} {player.lastName}
      </h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.md
        }}
      >
        {/* Training Focus Selection */}
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: theme.spacing.xs,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary
            }}
          >
            Training Focus
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: theme.spacing.sm
            }}
          >
            {getAllTrainingFocuses().map((focus) => (
              <GameButton
                key={focus}
                variant={selectedFocus === focus ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedFocus(focus)}
              >
                {getTrainingFocusDisplayName(focus)}
              </GameButton>
            ))}
          </div>
        </div>

        {/* Individual Coaching Toggle */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={useIndividualCoaching}
              onChange={(e) => setUseIndividualCoaching(e.target.checked)}
              disabled={!canUseCoaching && !hasCoaching}
              style={{
                width: '20px',
                height: '20px',
                cursor: canUseCoaching || hasCoaching ? 'pointer' : 'not-allowed'
              }}
            />
            <span style={{ color: theme.colors.text.primary }}>
              Individual Coaching (Uses coaching slot)
            </span>
          </label>
          {!canUseCoaching && !hasCoaching && (
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.error.main,
                marginTop: theme.spacing.xs,
                marginBottom: 0
              }}
            >
              No coaching slots available ({coachingSlotsUsed} / {maxCoachingSlots} used)
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: theme.spacing.sm }}>
        <GameButton variant="primary" size="sm" onClick={handleConfirm}>
          {currentAssignment ? 'Update Training' : 'Set Training'}
        </GameButton>
        {currentAssignment && (
          <GameButton variant="danger" size="sm" onClick={onRemove}>
            Remove Individual Training
          </GameButton>
        )}
        <GameButton variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </GameButton>
      </div>
    </GameCard>
  )
}

export default TrainingScreen
