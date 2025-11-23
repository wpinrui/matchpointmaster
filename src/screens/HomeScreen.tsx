import React, { useMemo, useState } from 'react'
import GameButton from '../components/buttons/GameButton'
import GameCard from '../components/cards/GameCard'
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog'
import { DraftInfoDialog } from '../components/dialogs/DraftInfoDialog'
import { EmailPreviewSection } from '../components/home/EmailPreviewSection'
import { SeasonTimelineSection } from '../components/home/SeasonTimelineSection'
import { PlayerInsightsCard } from '../components/home/PlayerInsightsCard'
import { TopProspectsCard } from '../components/home/TopProspectsCard'
import { TrainingInsightsCard } from '../components/home/TrainingInsightsCard'
import { TrainingProgressCard } from '../components/home/TrainingProgressCard'
import { RoundRobinResultsCard } from '../components/home/RoundRobinResultsCard'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { Email } from '../services/savegame/types'
import { theme } from '../theme/theme'
import { isTrainingPhase as checkIsTrainingPhase } from '../utils/actionButtonHelpers'
import { MONTH_NAMES } from '../utils/constants'
import { GamePhase, getPhaseDisplayName } from '../utils/gamePhases'
import { isFirstTrainingMonth } from '../utils/phaseProgression'
import { useHomeDraftPool } from '../hooks/useHomeDraftPool'
import { useHomeActionButton } from '../hooks/useHomeActionButton'

const HomeScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const {
    season,
    draftCompleted,
    emails,
    markEmailAsRead,
    updateSeason,
    players,
    teamRoster,
    trainingPlan,
    manager,
    school,
    aiSchools,
    updatePlayers,
    updateTrainingPlan,
    skillSnapshots,
    updateSkillSnapshots,
    updateAISchools,
    addEmail,
    roundRobinData
  } = useSaveDataContext()
  const [showDraftDialog, setShowDraftDialog] = useState(false)
  const [showTimeProgressionDialog, setShowTimeProgressionDialog] = useState(false)
  const [pendingTimeProgression, setPendingTimeProgression] = useState<
    (() => void) | null
  >(null)

  const phaseDisplayName = getPhaseDisplayName(season.phase as GamePhase, season.month)

  const isDraftPhase = season.phase === GamePhase.DRAFT && !draftCompleted

  // Check if we're in training phase
  const isTrainingPhase = checkIsTrainingPhase(season.phase)

  // Check if this is the first training month of either training phase
  const isFirstTrainingMonthValue = isTrainingPhase && isFirstTrainingMonth(season.month)

  // Get previous month's snapshots for progress comparison
  // Only compare within the same training phase (Feb-Apr or Aug-Oct)
  const previousMonthSnapshots = useMemo(() => {
    if (!isTrainingPhase) return []

    // Only show progress if we're past the first training month
    if (isFirstTrainingMonth(season.month)) return []

    // Get snapshots from the previous month within the same training phase
    const prevMonth = season.month - 1
    return skillSnapshots.filter((s) => s.month === prevMonth && s.year === season.year)
  }, [skillSnapshots, season.month, season.year, isTrainingPhase])

  const unreadEmails = useMemo(() => {
    return emails.filter((e) => !e.read).sort((a, b) => b.timestamp - a.timestamp)
  }, [emails])

  // Initialize draft pool
  useHomeDraftPool({
    season,
    draftCompleted,
    players,
    manager,
    school,
    updatePlayers
  })

  const handleEmailClick = (email: Email) => {
    // Store the email ID in sessionStorage so EmailScreen can open it directly
    // EmailScreen will handle marking it as read when it's actually viewed
    sessionStorage.setItem('selectedEmailId', email.id)
    changeScreen(Screens.EMAIL)
  }

  // Get action button
  const actionButton = useHomeActionButton({
    season,
    draftCompleted,
    unreadEmails,
    players,
    teamRoster,
    trainingPlan,
    skillSnapshots,
    aiSchools,
    manager,
    school,
    updateSeason,
    updatePlayers,
    updateTrainingPlan,
    updateSkillSnapshots,
    updateAISchools,
    addEmail,
    changeScreen,
    setShowTimeProgressionDialog,
    setPendingTimeProgression,
    roundRobinData
  })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Season Header with Action Button */}
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
              fontSize: theme.typography.fontSize['4xl'],
              fontWeight: theme.typography.fontWeight.extrabold,
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              marginBottom: theme.spacing.sm,
              textAlign: 'left'
            }}
          >
            {season.year} {phaseDisplayName}
          </h1>
          <p
            style={{
              fontSize: theme.typography.fontSize.lg,
              color: theme.colors.text.secondary,
              margin: 0
            }}
          >
            {MONTH_NAMES[season.month - 1]} {season.year}
          </p>
        </div>
        <GameButton
          variant="success"
          onClick={actionButton.action}
          type="button"
          size="lg"
          glow
          disabled={actionButton.disabled}
          style={{ flexShrink: 0 }}
        >
          {actionButton.text}
          {actionButton.disabled && ' (Not Yet Implemented)'}
        </GameButton>
      </div>

      {/* Content - Two Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '500px 1fr',
          gap: theme.spacing.xl,
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {/* Left Column - Email Preview (moved to left, widened) */}
        <EmailPreviewSection
          allEmails={emails}
          currentSeasonYear={season.year}
          currentSeasonMonth={season.month}
          onEmailClick={handleEmailClick}
          onChangeScreen={changeScreen}
        />

        {/* Right Column - Main Content Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.lg,
            overflow: 'hidden',
            paddingLeft: theme.spacing.md,
            height: '100%'
          }}
        >
          {/* Three Card Layout - Responsive */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                isDraftPhase || isTrainingPhase
                  ? 'repeat(auto-fit, minmax(280px, 1fr))'
                  : '1fr',
              gap: theme.spacing.lg,
              alignItems: 'stretch',
              height: '100%',
              overflow: 'hidden'
            }}
          >
            {/* Draft Info Card - Only during draft phase */}
            {isDraftPhase && (
              <GameCard
                style={{
                  padding: theme.spacing.lg,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  maxHeight: '100%',
                  overflow: 'hidden'
                }}
              >
                <h2
                  style={{
                    fontFamily: theme.typography.fontFamily.heading,
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.md,
                    marginTop: 0
                  }}
                >
                  Draft Info
                </h2>
                <p
                  style={{
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.md
                  }}
                >
                  Select your team for the upcoming season. Once you leave the draft
                  screen, you cannot add more players for the rest of the season.
                </p>
                <GameButton
                  variant="secondary"
                  onClick={() => setShowDraftDialog(true)}
                  type="button"
                  size="sm"
                >
                  More Info
                </GameButton>
              </GameCard>
            )}

            {/* Top Prospects Card - Only during draft phase */}
            {isDraftPhase && <TopProspectsCard />}

            {/* Training Insights Card - February (first training month) */}
            {isFirstTrainingMonthValue && (
              <TrainingInsightsCard changeScreen={changeScreen} />
            )}

            {/* Training Progress Card - Training months after first month (Mar-Apr, Sep-Oct) */}
            {isTrainingPhase && !isFirstTrainingMonthValue && (
              <>
                <TrainingProgressCard
                  oldSnapshots={previousMonthSnapshots}
                  allSnapshots={skillSnapshots}
                  currentYear={season.year}
                  currentMonth={season.month}
                />
                <PlayerInsightsCard
                  oldSnapshots={previousMonthSnapshots}
                  allSnapshots={skillSnapshots}
                  currentYear={season.year}
                  currentMonth={season.month}
                />
              </>
            )}

            {/* Round-Robin Results Card - After tournament completion */}
            {roundRobinData &&
              Object.values(roundRobinData.teamResults).some(
                (r) => r !== null && r !== undefined && r.completed === true
              ) && <RoundRobinResultsCard changeScreen={changeScreen} />}

            {/* Season Timeline Card - Always visible, narrower */}
            <SeasonTimelineSection
              currentMonth={season.month}
              draftCompleted={draftCompleted}
              isDraftPhase={isDraftPhase}
              isTrainingPhase={isTrainingPhase}
            />
          </div>
        </div>
      </div>

      {/* Draft Info Dialog */}
      <DraftInfoDialog
        isOpen={showDraftDialog}
        onClose={() => setShowDraftDialog(false)}
      />

      {/* Time Progression Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showTimeProgressionDialog}
        title="Advance to Next Phase"
        message={`Are you sure you want to advance to the next phase? This will progress the game forward and cannot be undone.`}
        confirmText="Continue"
        cancelText="Cancel"
        onConfirm={() => {
          if (pendingTimeProgression) {
            pendingTimeProgression()
          }
          setShowTimeProgressionDialog(false)
          setPendingTimeProgression(null)
        }}
        onCancel={() => {
          setShowTimeProgressionDialog(false)
          setPendingTimeProgression(null)
        }}
      />
    </div>
  )
}

export default HomeScreen
