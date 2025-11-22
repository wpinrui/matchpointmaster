import React, { useMemo, useState } from 'react'
import GameButton from '../components/buttons/GameButton'
import GameCard from '../components/cards/GameCard'
import { DraftInfoDialog } from '../components/dialogs/DraftInfoDialog'
import { EmailCard } from '../components/emails/EmailCard'
import { TimelineItem } from '../components/home/TimelineItem'
import { TopProspectsCard } from '../components/home/TopProspectsCard'
import { TrainingInsightsCard } from '../components/home/TrainingInsightsCard'
import { TrainingProgressCard } from '../components/home/TrainingProgressCard'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { Email } from '../services/savegame/types'
import { theme } from '../theme/theme'
import { createSkillSnapshots, processPlayerProgression } from '../utils/applyProgression'
import { MONTH_NAMES } from '../utils/constants'
import { GamePhase, getNextPhase, getPhaseDisplayName } from '../utils/gamePhases'

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
    updateSkillSnapshots
  } = useSaveDataContext()
  const [showDraftDialog, setShowDraftDialog] = useState(false)

  const phaseDisplayName = getPhaseDisplayName(season.phase as GamePhase, season.month)

  const isDraftPhase = season.phase === GamePhase.DRAFT && !draftCompleted

  // Check if we're in training phase
  const isTrainingPhase =
    season.phase === GamePhase.TRAINING || season.phase === GamePhase.TRAINING_2

  // Check if this is February (first training month) or later
  const isFirstTrainingMonth = isTrainingPhase && season.month === 2

  // Get previous month's snapshots for progress comparison
  // Only compare within the same training phase (Feb-May or Aug-Oct)
  const previousMonthSnapshots = useMemo(() => {
    if (!isTrainingPhase) return []

    // Only show progress if we're past the first training month
    if (season.month === 2 || season.month === 8) return []

    // Get snapshots from the previous month within the same training phase
    const prevMonth = season.month - 1
    return skillSnapshots.filter(
      (s) => s.month === prevMonth && s.year === season.year
    )
  }, [skillSnapshots, season.month, season.year, isTrainingPhase])

  const unreadEmails = useMemo(() => {
    return emails.filter((e) => !e.read).sort((a, b) => b.timestamp - a.timestamp)
  }, [emails])

  const handleEmailClick = (email: Email) => {
    if (!email.read) {
      markEmailAsRead(email.id)
    }
    changeScreen(Screens.EMAIL)
  }

  // Get action button text and action based on phase
  const getActionButton = () => {
    const currentPhase = season.phase as GamePhase
    // Store the phase string before type narrowing for progression check
    const currentPhaseString = season.phase

    if (currentPhase === GamePhase.DRAFT && !draftCompleted) {
      return {
        text: 'Go to Draft',
        action: () => changeScreen(Screens.DRAFT)
      }
    }

    // During training phase, show training button
    if (currentPhase === GamePhase.TRAINING || currentPhase === GamePhase.TRAINING_2) {
      return {
        text: 'Open Training',
        action: () => changeScreen(Screens.TRAINING)
      }
    }

    // For other phases, progress to next month/phase
    const nextPhase = getNextPhase(currentPhase, season.month)

    return {
      text: 'Continue',
      action: () => {
        // Process player progression if leaving training phase
        // Check the string phase to avoid type narrowing issues
        // This handles cases where we're advancing from a training phase
        // (though this path typically won't be hit since training phase shows "Open Training" button)
        if (
          currentPhaseString === GamePhase.TRAINING ||
          currentPhaseString === GamePhase.TRAINING_2
        ) {
          if (trainingPlan && !trainingPlan.completed) {
            // Create skill snapshots before progression
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
            // Mark training plan as completed
            updateTrainingPlan.setCompleted(true)
          }
        }

        // Advance phase
        updateSeason.setMonth(nextPhase.month)
        updateSeason.setPhase(nextPhase.phase)
        if (nextPhase.month === 1) {
          // New year - reset draft
          updateSeason.setDraftCompleted(false)
        }
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
          style={{ flexShrink: 0 }}
        >
          {actionButton.text}
        </GameButton>
      </div>

      {/* Content - Two Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: theme.spacing.xl,
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {/* Left Column - Main Content Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.lg,
            overflow: 'auto',
            paddingRight: theme.spacing.md
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
            {isFirstTrainingMonth && (
              <TrainingInsightsCard changeScreen={changeScreen} />
            )}

            {/* Training Progress Card - Training months after February */}
            {isTrainingPhase && !isFirstTrainingMonth && previousMonthSnapshots.length > 0 && (
              <TrainingProgressCard
                oldSnapshots={previousMonthSnapshots}
                allSnapshots={skillSnapshots}
                currentYear={season.year}
                currentMonth={season.month}
              />
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

        {/* Right Column - Email Preview */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.lg,
            overflow: 'hidden',
            borderLeft: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
            paddingLeft: theme.spacing.lg
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
                flex: 1,
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
      </div>

      {/* Draft Info Dialog */}
      <DraftInfoDialog
        isOpen={showDraftDialog}
        onClose={() => setShowDraftDialog(false)}
      />
    </div>
  )
}

export default HomeScreen
