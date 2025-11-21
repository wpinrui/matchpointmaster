import React from 'react'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { theme } from '../theme/theme'
import GameCard from '../components/cards/GameCard'
import GameButton from '../components/buttons/GameButton'
import { getPhaseDisplayName, GamePhase } from '../utils/gamePhases'

const HomeScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { season, draftCompleted } = useSaveDataContext()

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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.lg,
        height: '100%'
      }}
    >
      {/* Season Header */}
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
          <TimelineItem month={2} label="Training Phase" currentMonth={season.month} />
          <TimelineItem month={3} label="Training Phase" currentMonth={season.month} />
          <TimelineItem month={4} label="Training Phase" currentMonth={season.month} />
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
          <TimelineItem month={8} label="Training Phase" currentMonth={season.month} />
          <TimelineItem month={9} label="Training Phase" currentMonth={season.month} />
          <TimelineItem month={10} label="Training Phase" currentMonth={season.month} />
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
            Select your team of 7 players for the upcoming season. Once you leave the
            draft screen, you cannot add more players for the rest of the season.
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
