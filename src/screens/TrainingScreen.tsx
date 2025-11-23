import React, { useMemo, useState } from 'react'
import GameButton from '../components/buttons/GameButton'
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog'
import { PlayerTrainingDialog } from '../components/training/PlayerTrainingDialog'
import { TrainingPlanOverview } from '../components/training/TrainingPlanOverview'
import { TrainingPreview } from '../components/training/TrainingPreview'
import { TeamFocusDialog } from '../components/training/TeamFocusDialog'
import { TrainingPlayerList } from '../components/training/TrainingPlayerList'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { TrainingFocus } from '../services/savegame/types'
import { theme } from '../theme/theme'
import { MONTH_NAMES } from '../utils/constants'
import { GamePhase } from '../utils/gamePhases'
import {
  advanceToNextPhase,
  type PhaseProgressionParams,
  type PhaseProgressionCallbacks
} from '../utils/phaseProgression'
import { useTrainingPlanInit } from '../hooks/useTrainingPlanInit'
import { useTrainingCalculations } from '../hooks/useTrainingCalculations'
import { usePlayerTrainingManagement } from '../hooks/usePlayerTrainingManagement'

const TrainingScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const {
    players,
    teamRoster,
    season,
    manager,
    school,
    trainingPlan,
    skillSnapshots,
    aiSchools,
    addEmail,
    updateTrainingPlan,
    updateSeason,
    updatePlayers,
    updateSkillSnapshots,
    updateAISchools
  } = useSaveDataContext()

  const [showSetTeamFocus, setShowSetTeamFocus] = useState(false)
  const [showAdvanceMonthDialog, setShowAdvanceMonthDialog] = useState(false)
  const [pendingAdvanceAction, setPendingAdvanceAction] = useState<(() => void) | null>(
    null
  )
  const [showCoachingSlotsDialog, setShowCoachingSlotsDialog] = useState(false)
  const [coachingSlotsMessage, setCoachingSlotsMessage] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Initialize training plan
  useTrainingPlanInit({
    season,
    trainingPlan,
    updateTrainingPlan
  })

  // Get players currently on the team
  const teamPlayers = useMemo(() => {
    const allTeamPlayers = players.filter((p) => teamRoster.includes(p.id))
    return allTeamPlayers
  }, [players, teamRoster])

  // Training calculations
  const {
    maxCoachingSlots,
    recommendedFocus,
    isTournamentPrep,
    expectedImprovements,
    expectedSummary
  } = useTrainingCalculations({
    players,
    teamRoster,
    trainingPlan,
    manager,
    school,
    season
  })

  // Player training management
  const {
    selectedPlayerForTraining,
    setSelectedPlayerForTraining,
    getPlayerTraining,
    hasIndividualCoaching,
    getPlayerFocus,
    handleSetPlayerTraining,
    handleRemovePlayerTraining
  } = usePlayerTrainingManagement({
    trainingPlan,
    maxCoachingSlots,
    updateTrainingPlan,
    setShowCoachingSlotsDialog,
    setCoachingSlotsMessage
  })

  // Handle setting team focus
  const handleSetTeamFocus = (focus: TrainingFocus | null) => {
    if (!trainingPlan) return
    updateTrainingPlan.setTeamFocus(focus)
    setShowSetTeamFocus(false)
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
        {/* Show "Continue to Next Month" button if currently in training phase */}
        {(() => {
          const currentPhase = season.phase as GamePhase
          const isCurrentlyInTrainingPhase =
            currentPhase === GamePhase.TRAINING || currentPhase === GamePhase.TRAINING_2

          // Only show button if we're currently in a training phase
          if (!isCurrentlyInTrainingPhase) {
            return null
          }

          const handleContinueClick = () => {
            // Show confirmation dialog immediately
            setShowAdvanceMonthDialog(true)

            // Store the progression action to execute when confirmed
            const advanceAction = () => {
              const params: PhaseProgressionParams = {
                currentMonth: season.month,
                currentYear: season.year,
                currentPhase: season.phase as GamePhase,
                players,
                teamRoster,
                manager,
                school,
                trainingPlan,
                skillSnapshots,
                aiSchools
              }

              const callbacks: PhaseProgressionCallbacks = {
                updateSeason,
                updatePlayers,
                updateTrainingPlan,
                updateSkillSnapshots,
                updateAISchools,
                addEmail
              }

              advanceToNextPhase(params, callbacks)

              // Navigate back to home screen
              changeScreen(Screens.HOME)
            }

            setPendingAdvanceAction(() => advanceAction)
          }

          return (
            <GameButton
              variant="success"
              onClick={handleContinueClick}
              type="button"
              size="lg"
              glow
              style={{ flexShrink: 0 }}
            >
              Continue to Next Month
            </GameButton>
          )
        })()}
      </div>

      {/* Training Plan Overview */}
      <TrainingPlanOverview
        trainingPlan={trainingPlan}
        maxCoachingSlots={maxCoachingSlots}
        recommendedFocus={recommendedFocus}
        expectedSummary={expectedSummary}
        onSetTeamFocus={() => setShowSetTeamFocus(true)}
        onUseRecommended={handleSetTeamFocus}
        onTogglePreview={() => setShowPreview(!showPreview)}
        showPreview={showPreview}
      />

      {/* Training Preview */}
      {showPreview && trainingPlan.teamFocus && expectedImprovements.length > 0 && (
        <TrainingPreview expectedSummary={expectedSummary} />
      )}

      {/* Set Team Focus Dialog */}
      {showSetTeamFocus && (
        <TeamFocusDialog
          trainingPlan={trainingPlan}
          onSetFocus={handleSetTeamFocus}
          onClose={() => setShowSetTeamFocus(false)}
        />
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
      <TrainingPlayerList
        teamPlayers={teamPlayers}
        trainingPlan={trainingPlan}
        getPlayerFocus={getPlayerFocus}
        getPlayerTraining={(playerId) => {
          const assignment = getPlayerTraining(playerId)
          return assignment
            ? {
                focus: assignment.focus,
                isIndividualCoaching: assignment.isIndividualCoaching
              }
            : null
        }}
        hasIndividualCoaching={hasIndividualCoaching}
        onSelectPlayer={setSelectedPlayerForTraining}
      />

      {/* Advance Month Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showAdvanceMonthDialog}
        title="Advance to Next Month"
        message="Are you sure you want to advance to the next month? This will progress the game forward and cannot be undone."
        confirmText="Continue"
        cancelText="Cancel"
        onConfirm={() => {
          if (pendingAdvanceAction) {
            pendingAdvanceAction()
          }
          setShowAdvanceMonthDialog(false)
          setPendingAdvanceAction(null)
        }}
        onCancel={() => {
          setShowAdvanceMonthDialog(false)
          setPendingAdvanceAction(null)
        }}
      />

      {/* Coaching Slots Dialog */}
      <ConfirmDialog
        isOpen={showCoachingSlotsDialog}
        title="Coaching Slots Unavailable"
        message={coachingSlotsMessage}
        confirmText="OK"
        cancelText={null}
        onConfirm={() => setShowCoachingSlotsDialog(false)}
        onCancel={() => setShowCoachingSlotsDialog(false)}
        variant="danger"
      />
    </div>
  )
}

export default TrainingScreen
