/**
 * Training Goals Card
 * Shows and manages training objectives
 */
import React, { useMemo, useState } from 'react'
import GameCard from '../cards/GameCard'
import GameButton from '../buttons/GameButton'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { theme } from '../../theme/theme'
import { TrainingGoal } from '../../services/savegame/types'
import { getSuggestedGoals, updateGoalProgress } from '../../utils/trainingGoals'
import { MONTH_NAMES } from '../../utils/constants'

interface TrainingGoalsCardProps {
  changeScreen?: (screen: any) => void
}

export const TrainingGoalsCard: React.FC<TrainingGoalsCardProps> = ({ changeScreen }) => {
  const { players, teamRoster, season, trainingGoals, skillSnapshots } =
    useSaveDataContext()
  const [showAddGoal, setShowAddGoal] = useState(false)

  // Get active goals for current period
  const activeGoals = useMemo(() => {
    return trainingGoals.filter(
      (goal) => !goal.completed && goal.year === season.year && goal.month >= season.month
    )
  }, [trainingGoals, season])

  // Update goal progress
  const goalsWithProgress = useMemo(() => {
    const previousMonthSnapshots = skillSnapshots.filter(
      (s) => s.month === season.month - 1 && s.year === season.year
    )
    return activeGoals.map((goal) =>
      updateGoalProgress(goal, players, teamRoster, previousMonthSnapshots)
    )
  }, [activeGoals, players, teamRoster, skillSnapshots, season])

  // Get suggested goals
  const suggestions = useMemo(() => {
    return getSuggestedGoals(players, teamRoster, season.month, season.year)
  }, [players, teamRoster, season])

  if (goalsWithProgress.length === 0 && !showAddGoal) {
    return (
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
          Training Goals
        </h2>
        <p
          style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.md
          }}
        >
          Set training objectives to track your team&apos;s progress and stay motivated.
        </p>
        <GameButton
          variant="primary"
          size="sm"
          onClick={() => setShowAddGoal(true)}
          style={{ width: '100%' }}
        >
          Set Training Goals
        </GameButton>
      </GameCard>
    )
  }

  return (
    <GameCard
      style={{
        padding: theme.spacing.lg,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md
        }}
      >
        <h2
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            margin: 0
          }}
        >
          Training Goals
        </h2>
        <GameButton
          variant="secondary"
          size="sm"
          onClick={() => setShowAddGoal(!showAddGoal)}
        >
          {showAddGoal ? 'Cancel' : 'Add Goal'}
        </GameButton>
      </div>

      {/* Active Goals */}
      {goalsWithProgress.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.md
          }}
        >
          {goalsWithProgress.map((goal) => (
            <div
              key={goal.id}
              style={{
                padding: theme.spacing.sm,
                background: goal.completed
                  ? theme.colors.success.main + '20'
                  : theme.colors.border.default + '40',
                borderRadius: theme.borderRadius.sm,
                border: `${theme.borderWidth.default} solid ${
                  goal.completed ? theme.colors.success.main : theme.colors.border.default
                }`
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: theme.spacing.xs
                }}
              >
                <strong
                  style={{
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm
                  }}
                >
                  {getGoalDescription(goal)}
                </strong>
                {goal.completed && (
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.success.main,
                      fontWeight: theme.typography.fontWeight.bold
                    }}
                  >
                    ✓ Achieved
                  </span>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary
                  }}
                >
                  Progress: {goal.current} / {goal.target}
                </span>
                <div
                  style={{
                    width: '100px',
                    height: '8px',
                    background: theme.colors.border.default,
                    borderRadius: theme.borderRadius.sm,
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, (goal.current / goal.target) * 100)}%`,
                      height: '100%',
                      background: goal.completed
                        ? theme.colors.success.main
                        : theme.colors.primary.main,
                      transition: 'width 0.3s'
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.secondary,
                  marginTop: theme.spacing.xs
                }}
              >
                Target: {MONTH_NAMES[goal.month - 1]} {goal.year}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Goal Form */}
      {showAddGoal && (
        <div
          style={{
            padding: theme.spacing.md,
            background: theme.colors.border.default + '20',
            borderRadius: theme.borderRadius.sm,
            marginTop: theme.spacing.md
          }}
        >
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.sm
            }}
          >
            Suggested Goals:
          </p>
          {suggestions.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.xs
              }}
            >
              {suggestions.map((goal) => (
                <div
                  key={goal.id}
                  style={{
                    padding: theme.spacing.sm,
                    background: theme.colors.background.primary,
                    borderRadius: theme.borderRadius.sm,
                    border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`
                  }}
                >
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing.xs
                    }}
                  >
                    {getGoalDescription(goal)}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.text.secondary
                    }}
                  >
                    Target: {goal.target} by {MONTH_NAMES[goal.month - 1]} {goal.year}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                fontStyle: 'italic'
              }}
            >
              No suggestions available. Set custom goals based on your team&apos;s needs.
            </p>
          )}
        </div>
      )}
    </GameCard>
  )
}

function getGoalDescription(goal: TrainingGoal): string {
  switch (goal.type) {
    case 'team_average':
      return `Team Average Skill: ${goal.target}`
    case 'player_skill':
      return `Player Skill: ${goal.skill || 'Unknown'} to ${goal.target}`
    case 'team_improvement':
      return `Team Total Improvement: +${goal.target} points`
    case 'player_improvement':
      return `Player Improvement: +${goal.target} points`
    default:
      return 'Training Goal'
  }
}
