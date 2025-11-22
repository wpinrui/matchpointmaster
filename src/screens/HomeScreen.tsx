import React, { useMemo, useState } from 'react'
import GameButton from '../components/buttons/GameButton'
import GameCard from '../components/cards/GameCard'
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog'
import { DraftInfoDialog } from '../components/dialogs/DraftInfoDialog'
import { EmailCard } from '../components/emails/EmailCard'
import { PlayerInsightsCard } from '../components/home/PlayerInsightsCard'
import { TimelineItem } from '../components/home/TimelineItem'
import { TopProspectsCard } from '../components/home/TopProspectsCard'
import { TrainingInsightsCard } from '../components/home/TrainingInsightsCard'
import { TrainingProgressCard } from '../components/home/TrainingProgressCard'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { Email } from '../services/savegame/types'
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
    updatePlayers,
    updateTrainingPlan,
    skillSnapshots,
    updateSkillSnapshots,
    addEmail
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
            skillSnapshots
          }

          const callbacks: PhaseProgressionCallbacks = {
            updateSeason,
            updatePlayers,
            updateTrainingPlan,
            updateSkillSnapshots,
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.lg,
            overflow: 'hidden',
            borderRight: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
            paddingRight: theme.spacing.lg
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h2
              style={{
                fontFamily: theme.typography.fontFamily.heading,
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                margin: 0
              }}
            >
              Inbox
              {unreadEmails.length > 0 && (
                <span
                  style={{
                    marginLeft: theme.spacing.sm,
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.primary.main,
                    fontWeight: theme.typography.fontWeight.bold
                  }}
                >
                  ({unreadEmails.length})
                </span>
              )}
            </h2>
            <GameButton
              variant="secondary"
              size="sm"
              onClick={() => changeScreen(Screens.EMAIL)}
              type="button"
            >
              View All
            </GameButton>
          </div>

          {unreadEmails.length > 0 ? (
            <div
              style={{
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.sm
              }}
            >
              {unreadEmails.slice(0, 5).map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onClick={() => handleEmailClick(email)}
                  currentSeasonYear={season.year}
                  currentSeasonMonth={season.month}
                />
              ))}
              {unreadEmails.length > 5 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: theme.spacing.md,
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.sm
                  }}
                >
                  +{unreadEmails.length - 5} more unread email
                  {unreadEmails.length - 5 !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          ) : (
            <GameCard
              style={{
                padding: theme.spacing.xl,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <p
                style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.secondary,
                  margin: 0,
                  marginBottom: theme.spacing.md
                }}
              >
                No unread emails
              </p>
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  margin: 0,
                  marginBottom: theme.spacing.lg
                }}
              >
                Check your inbox for updates about the game world, tournaments, and
                important announcements.
              </p>
              <GameButton
                variant="primary"
                size="sm"
                onClick={() => changeScreen(Screens.EMAIL)}
                type="button"
              >
                Open Inbox
              </GameButton>
            </GameCard>
          )}
        </div>

        {/* Right Column - Main Content Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.lg,
            overflow: 'auto',
            paddingLeft: theme.spacing.md
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
              alignItems: 'start'
            }}
          >
            {/* Draft Info Card - Only during draft phase */}
            {isDraftPhase && (
              <GameCard
                style={{
                  padding: theme.spacing.lg,
                  display: 'flex',
                  flexDirection: 'column'
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
            <GameCard
              style={{
                padding: theme.spacing.lg,
                display: 'flex',
                flexDirection: 'column',
                maxWidth: isDraftPhase || isTrainingPhase ? 'none' : '400px'
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
                Season Timeline
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.spacing.sm
                }}
              >
                <TimelineItem
                  month={1}
                  label="Player Draft"
                  currentMonth={season.month}
                  completed={draftCompleted}
                />
                <TimelineItem
                  month={2}
                  label="Training Phase"
                  currentMonth={season.month}
                />
                <TimelineItem
                  month={3}
                  label="Training Phase"
                  currentMonth={season.month}
                />
                <TimelineItem
                  month={4}
                  label="Training Phase"
                  currentMonth={season.month}
                />
                <TimelineItem
                  month={5}
                  label="Intra-Club Round-Robin"
                  currentMonth={season.month}
                />
                <TimelineItem
                  month={6}
                  label="Zonal School Tournament"
                  currentMonth={season.month}
                />
                <TimelineItem
                  month={7}
                  label="National Championships"
                  currentMonth={season.month}
                />
                <TimelineItem
                  month={8}
                  label="Training Phase"
                  currentMonth={season.month}
                />
                <TimelineItem
                  month={9}
                  label="Training Phase"
                  currentMonth={season.month}
                />
                <TimelineItem
                  month={10}
                  label="Training Phase"
                  currentMonth={season.month}
                />
                <TimelineItem
                  month={11}
                  label="National Singles Tournament"
                  currentMonth={season.month}
                />
                <TimelineItem
                  month={12}
                  label="Graduation & Celebrations"
                  currentMonth={season.month}
                />
              </div>
            </GameCard>
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
