import React, { useMemo } from 'react'
import GameButton from '../components/buttons/GameButton'
import GameCard from '../components/cards/GameCard'
import { EmailCard } from '../components/emails/EmailCard'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { Email } from '../services/savegame/types'
import { theme } from '../theme/theme'
import { GamePhase, getPhaseDisplayName } from '../utils/gamePhases'

const HomeScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { season, draftCompleted, emails, markEmailAsRead } = useSaveDataContext()

  const phaseDisplayName = getPhaseDisplayName(season.phase as GamePhase, season.month)

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const isDraftPhase = season.phase === GamePhase.DRAFT && !draftCompleted

  const unreadEmails = useMemo(() => {
    return emails.filter((e) => !e.read).sort((a, b) => b.timestamp - a.timestamp)
  }, [emails])

  const handleEmailClick = (email: Email) => {
    if (!email.read) {
      markEmailAsRead(email.id)
    }
    changeScreen(Screens.EMAIL)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Season Header - Full Width */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: theme.spacing.xl
        }}
      >
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
            marginBottom: theme.spacing.sm
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
          {monthNames[season.month - 1]} {season.year}
        </p>
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
        {/* Left Column - Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.lg,
            overflow: 'auto',
            paddingRight: theme.spacing.md
          }}
        >
          {/* Timeline/Agenda Block */}
          <GameCard
            style={{
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg
            }}
          >
            <h2
              style={{
                fontFamily: theme.typography.fontFamily.heading,
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.md
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

          {/* Phase-Specific Content */}
          {isDraftPhase && (
            <GameCard
              style={{
                padding: theme.spacing.lg,
                background: theme.colors.primary.light + '20',
                border: `2px solid ${theme.colors.primary.main}`
              }}
            >
              <h2
                style={{
                  fontFamily: theme.typography.fontFamily.heading,
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.md
                }}
              >
                Draft Phase
              </h2>
              <p
                style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.lg
                }}
              >
                Select your team for the upcoming season. Once you leave the draft screen,
                you cannot add more players for the rest of the season.
              </p>
              <GameButton
                variant="primary"
                onClick={() => changeScreen(Screens.DRAFT)}
                type="button"
                size="lg"
                glow
              >
                Go to Draft
              </GameButton>
            </GameCard>
          )}

          {/* Quick Links */}
          <GameCard
            style={{
              padding: theme.spacing.lg
            }}
          >
            <h2
              style={{
                fontFamily: theme.typography.fontFamily.heading,
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.md
              }}
            >
              Quick Links
            </h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.sm
              }}
            >
              <GameButton
                variant="secondary"
                onClick={() => changeScreen(Screens.TEAM_OVERVIEW)}
                type="button"
              >
                Team Overview
              </GameButton>
              <GameButton
                variant="secondary"
                onClick={() => changeScreen(Screens.PROFILE)}
                type="button"
              >
                Profile
              </GameButton>
              <GameButton
                variant="secondary"
                onClick={() => changeScreen(Screens.SETTINGS)}
                type="button"
              >
                Settings
              </GameButton>
            </div>
          </GameCard>
        </div>

        {/* Right Column - Email Preview */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.lg,
            overflow: 'hidden',
            borderLeft: `1px solid ${theme.colors.neutral.gray300}`,
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
                justifyContent: 'center',
                background: theme.colors.neutral.gray100
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

          {/* Prominent callout for new players */}
          {unreadEmails.length > 0 && (
            <GameCard
              style={{
                padding: theme.spacing.md,
                background: theme.colors.primary.light + '20',
                border: `2px solid ${theme.colors.primary.main}`
              }}
            >
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.primary,
                  margin: 0,
                  fontWeight: theme.typography.fontWeight.medium
                }}
              >
                💡 <strong>Tip:</strong> Check your inbox regularly for important
                information about the game world, including rules, news, and updates!
              </p>
            </GameCard>
          )}
        </div>
      </div>
    </div>
  )
}

interface TimelineItemProps {
  month: number
  label: string
  currentMonth: number
  completed?: boolean
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  month,
  label,
  currentMonth,
  completed = false
}) => {
  const isCurrent = month === currentMonth
  const isPast = month < currentMonth || completed

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        background: isCurrent
          ? theme.colors.primary.light + '20'
          : isPast
            ? theme.colors.neutral.gray100
            : 'transparent',
        border: isCurrent ? `2px solid ${theme.colors.primary.main}` : 'none'
      }}
    >
      <div
        style={{
          minWidth: '80px',
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold,
          color: isCurrent
            ? theme.colors.primary.main
            : isPast
              ? theme.colors.text.secondary
              : theme.colors.text.primary
        }}
      >
        Month {month}
      </div>
      <div
        style={{
          flex: 1,
          fontSize: theme.typography.fontSize.base,
          color: isCurrent
            ? theme.colors.text.primary
            : isPast
              ? theme.colors.text.secondary
              : theme.colors.text.primary,
          textDecoration: isPast && !isCurrent ? 'line-through' : 'none',
          opacity: isPast && !isCurrent ? 0.6 : 1
        }}
      >
        {label}
      </div>
      {isCurrent && (
        <span
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.primary.main,
            fontWeight: theme.typography.fontWeight.bold
          }}
        >
          Current
        </span>
      )}
      {completed && month === currentMonth && (
        <span
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.success.main,
            fontWeight: theme.typography.fontWeight.bold
          }}
        >
          ✓ Completed
        </span>
      )}
    </div>
  )
}

export default HomeScreen
