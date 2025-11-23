import React, { useState, useMemo } from 'react'
import GameButton from '../../components/buttons/GameButton'
import { ConfirmDialog } from '../../components/dialogs/ConfirmDialog'
import { TeamStatusCard } from '../../components/draft/TeamStatusCard'
import { PlayerListSection } from '../../components/draft/PlayerListSection'
import { ScreenProps, Screens } from '../../screen_manager/screens'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { theme } from '../../theme/theme'
import { GamePhase } from '../../utils/gamePhases'
import { completeDraftAndProgress } from '../../utils/phaseProgression'
import { validateTeamBeforeDraft } from '../../utils/draftHelpers'
import { useDraftLogic } from '../../hooks/useDraftLogic'
import { getAvailablePlayers, getTeamPlayers } from '../../utils/draftPlayerFilters'

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
    addEmail,
    aiSchools,
    updateAISchools
  } = useSaveDataContext()

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showEndDraftConfirm, setShowEndDraftConfirm] = useState(false)
  const [showEmptyTeamDialog, setShowEmptyTeamDialog] = useState(false)

  // Use draft logic hook
  useDraftLogic({
    season,
    draftCompleted,
    players,
    manager,
    school,
    updatePlayers
  })

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
    const validation = validateTeamBeforeDraft(teamRoster)
    if (!validation.isValid) {
      setShowLeaveConfirm(false)
      setShowEmptyTeamDialog(true)
      return
    }

    // Progress to February training phase (if still in January/DRAFT)
    if (season.phase === 'draft' && season.month === 1) {
      completeDraftAndProgress(
        {
          currentMonth: season.month,
          currentYear: season.year,
          players,
          teamRoster,
          manager,
          school,
          aiSchools
        },
        {
          updateSeason: {
            setDraftCompleted: updateSeason.setDraftCompleted,
            setMonth: updateSeason.setMonth,
            setPhase: updateSeason.setPhase
          },
          addEmail,
          updatePlayers,
          updateAISchools
        }
      )
    }

    setShowLeaveConfirm(false)
    changeScreen(Screens.HOME)
  }

  const handleEndDraft = () => {
    // Check if team is empty BEFORE showing confirmation
    const validation = validateTeamBeforeDraft(teamRoster)
    if (!validation.isValid) {
      setShowEmptyTeamDialog(true)
      return
    }

    // Show confirmation dialog only if team is not empty
    setShowEndDraftConfirm(true)
  }

  const handleConfirmEndDraft = () => {
    completeDraftAndProgress(
      {
        currentMonth: season.month,
        currentYear: season.year,
        players,
        teamRoster,
        manager,
        school,
        aiSchools
      },
      {
        updateSeason: {
          setDraftCompleted: updateSeason.setDraftCompleted,
          setMonth: updateSeason.setMonth,
          setPhase: updateSeason.setPhase
        },
        addEmail,
        updatePlayers,
        updateAISchools
      }
    )

    // Navigate to home
    setShowEndDraftConfirm(false)
    changeScreen(Screens.HOME)
  }

  const handleCancelEndDraft = () => {
    setShowEndDraftConfirm(false)
  }

  const handleCancelLeave = () => {
    setShowLeaveConfirm(false)
  }

  // Get available players (not on team) filtered and sorted
  const availablePlayers = useMemo(
    () => getAvailablePlayers(players, teamRoster, school.teamType),
    [players, teamRoster, school.teamType]
  )

  // Get team players filtered and sorted
  const teamPlayers = useMemo(
    () => getTeamPlayers(players, teamRoster, school.teamType),
    [players, teamRoster, school.teamType]
  )

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
      <TeamStatusCard teamSize={teamRoster.length} />

      {/* Current Team Preview */}
      {teamPlayers.length > 0 && (
        <div style={{ marginBottom: theme.spacing.xl }}>
          <PlayerListSection
            title="Your Team"
            players={teamPlayers}
            actionButtonLabel="Remove"
            actionButtonVariant="danger"
            onPlayerAction={handleRemoveFromTeam}
          />
        </div>
      )}

      {/* Available Players */}
      <PlayerListSection
        title="Available Players"
        players={availablePlayers}
        actionButtonLabel="Draft"
        actionButtonVariant="primary"
        onPlayerAction={handleDraftPlayer}
        emptyMessage="No more players."
      />

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

      <ConfirmDialog
        isOpen={showEndDraftConfirm}
        title="End Draft?"
        message="Are you sure you want to end the draft? You will not be able to add more players for the rest of the season. This will progress the game to the training phase."
        confirmText="End Draft"
        cancelText="Continue Drafting"
        onConfirm={handleConfirmEndDraft}
        onCancel={handleCancelEndDraft}
        variant="primary"
      />

      <ConfirmDialog
        isOpen={showEmptyTeamDialog}
        title="Empty Team"
        message="You cannot leave the draft with an empty team. Please add at least one player before leaving."
        confirmText="OK"
        cancelText={null}
        onConfirm={() => setShowEmptyTeamDialog(false)}
        onCancel={() => setShowEmptyTeamDialog(false)}
        variant="danger"
      />
    </div>
  )
}

export default DraftScreen
