import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { Email, Gender } from '../services/savegame/types'
import { theme } from '../theme/theme'
import {
  isTrainingPhase as checkIsTrainingPhase,
  getDraftActionButton,
  getTrainingActionButton
} from '../utils/actionButtonHelpers'
import { MONTH_NAMES } from '../utils/constants'
import { GamePhase, getNextPhase, getPhaseDisplayName } from '../utils/gamePhases'
import {
  advanceToNextPhase,
  isFirstTrainingMonth,
  isPhaseImplemented,
  type PhaseProgressionCallbacks,
  type PhaseProgressionParams
} from '../utils/phaseProgression'
import { generatePlayer, IntakeQuality } from '../utils/playerGeneration'
import {
  attractivenessToIntakeQuality,
  calculatePlayerPoolSize,
  calculateSchoolAttractiveness,
  calculateSchoolReputation
} from '../utils/schoolReputation'

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
    addEmail
  } = useSaveDataContext()
  const [showDraftDialog, setShowDraftDialog] = useState(false)
  const [showTimeProgressionDialog, setShowTimeProgressionDialog] = useState(false)
  const [pendingTimeProgression, setPendingTimeProgression] = useState<
    (() => void) | null
  >(null)
  const hasInitializedDraftPoolRef = useRef<boolean>(false)

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

  // Calculate school reputation and attractiveness for draft pool initialization
  const calculatedSchoolReputation = useMemo(() => {
    return calculateSchoolReputation(school.reputationHistory || [])
  }, [school.reputationHistory])

  const schoolAttractiveness = useMemo(() => {
    if (!manager.stats) return 50 // Default
    return calculateSchoolAttractiveness(
      calculatedSchoolReputation,
      school.funding || 50,
      manager.stats.reputation
    )
  }, [calculatedSchoolReputation, school.funding, manager.stats])

  const intakeInfo = useMemo(() => {
    return attractivenessToIntakeQuality(schoolAttractiveness)
  }, [schoolAttractiveness])

  // Initialize draft player pool when entering draft phase
  useEffect(() => {
    // Only run during draft phase and if draft hasn't been completed
    if (season.phase !== GamePhase.DRAFT || draftCompleted) {
      // Reset the flag when leaving draft phase so it can initialize again next year
      if (season.phase !== GamePhase.DRAFT) {
        hasInitializedDraftPoolRef.current = false
      }
      return
    }

    // Only generate if we haven't already generated and there are no players
    if (hasInitializedDraftPoolRef.current || players.length > 0) {
      return
    }

    // Only generate if we have manager stats
    if (!manager.stats) {
      return
    }

    // Helper to pick a random element from an array
    const randomFromArray = <T,>(array: T[]): T => {
      return array[Math.floor(Math.random() * array.length)]
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
    hasInitializedDraftPoolRef.current = true

    // Update players - this initializes the draft pool
    updatePlayers.set([...players, ...newPlayers])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    season.phase,
    draftCompleted,
    schoolAttractiveness,
    intakeInfo,
    school.teamType,
    manager.stats
  ])

  const handleEmailClick = (email: Email) => {
    // Store the email ID in sessionStorage so EmailScreen can open it directly
    sessionStorage.setItem('selectedEmailId', email.id)
    if (!email.read) {
      markEmailAsRead(email.id)
    }
    changeScreen(Screens.EMAIL)
  }

  // Get action button text and action based on phase
  const getActionButton = () => {
    const currentPhase = season.phase as GamePhase
    const currentPhaseString = season.phase

    // If there are unread emails, show "Unread messages" button that goes to email screen
    if (unreadEmails.length > 0) {
      return {
        text: 'Unread messages',
        action: () => changeScreen(Screens.EMAIL)
      }
    }

    // Draft phase button
    const draftButton = getDraftActionButton(draftCompleted, changeScreen)
    if (draftButton) return draftButton

    // Training phase button
    if (checkIsTrainingPhase(currentPhaseString)) {
      return getTrainingActionButton(changeScreen)
    }

    // Continue button for other phases
    const phaseIsImplemented = isPhaseImplemented(currentPhase)
    const nextPhase = getNextPhase(currentPhase, season.month)

    return {
      text: 'Continue',
      disabled: !phaseIsImplemented,
      action: () => {
        if (!phaseIsImplemented) return

        const progressionAction = () => {
          const params: PhaseProgressionParams = {
            currentMonth: season.month,
            currentYear: season.year,
            currentPhase: currentPhaseString as GamePhase,
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
        }

        setPendingTimeProgression(progressionAction)
        setShowTimeProgressionDialog(true)
      }
    }
  }

  const actionButton = getActionButton()

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
          unreadEmails={unreadEmails}
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
