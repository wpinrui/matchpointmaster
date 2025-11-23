/**
 * Training Goals Card
 * Shows and manages training objectives
 */
import React, { useState } from 'react'
import GameCard from '../cards/GameCard'
import GameButton from '../buttons/GameButton'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { theme } from '../../theme/theme'
import { TrainingGoal } from '../../services/savegame/types'
import { MONTH_NAMES } from '../../utils/constants'
import { useTrainingGoals } from '../../hooks/useTrainingGoals'
import {
  StyledHeading,
  StyledText,
  StyledFlex,
  StyledProgressBarContainer,
  StyledProgressBarFill
} from '../../styles'

interface TrainingGoalsCardProps {
  changeScreen?: (screen: any) => void
}

export const TrainingGoalsCard: React.FC<TrainingGoalsCardProps> = ({ changeScreen }) => {
  const { players, teamRoster, season, trainingGoals, skillSnapshots } =
    useSaveDataContext()
  const [showAddGoal, setShowAddGoal] = useState(false)

  const { goalsWithProgress, suggestions } = useTrainingGoals({
    trainingGoals,
    season,
    players,
    teamRoster,
    skillSnapshots
  })

  if (goalsWithProgress.length === 0 && !showAddGoal) {
    return (
      <GameCard
        style={{ padding: theme.spacing.lg, display: 'flex', flexDirection: 'column' }}
      >
        <StyledHeading size="h5" margin={`0 0 ${theme.spacing.md} 0`}>
          Training Goals
        </StyledHeading>
        <StyledText
          color="secondary"
          size="base"
          style={{ marginBottom: theme.spacing.md }}
        >
          Set training objectives to track your team&apos;s progress and stay motivated.
        </StyledText>
        <GameButton
          variant="primary"
          size="sm"
          onClick={() => setShowAddGoal(true)}
          fullWidth
        >
          Set Training Goals
        </GameButton>
      </GameCard>
    )
  }

  return (
    <GameCard
      style={{ padding: theme.spacing.lg, display: 'flex', flexDirection: 'column' }}
    >
      <StyledFlex
        justify="space-between"
        align="center"
        style={{ marginBottom: theme.spacing.md }}
      >
        <StyledHeading size="h5" margin="0">
          Training Goals
        </StyledHeading>
        <GameButton
          variant="secondary"
          size="sm"
          onClick={() => setShowAddGoal(!showAddGoal)}
        >
          {showAddGoal ? 'Cancel' : 'Add Goal'}
        </GameButton>
      </StyledFlex>

      {/* Active Goals */}
      {goalsWithProgress.length > 0 && (
        <StyledFlex
          direction="column"
          gap="sm"
          style={{ marginBottom: theme.spacing.md }}
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
              <StyledFlex
                justify="space-between"
                align="center"
                style={{ marginBottom: theme.spacing.xs }}
              >
                <StyledText size="sm" weight="bold" color="primary">
                  {getGoalDescription(goal)}
                </StyledText>
                {goal.completed && (
                  <StyledText
                    size="xs"
                    weight="bold"
                    color="primary"
                    style={{ color: theme.colors.success.main }}
                  >
                    ✓ Achieved
                  </StyledText>
                )}
              </StyledFlex>
              <StyledFlex justify="space-between" align="center">
                <StyledText size="sm" color="secondary">
                  Progress: {goal.current} / {goal.target}
                </StyledText>
                <StyledProgressBarContainer>
                  <StyledProgressBarFill
                    percentage={(goal.current / goal.target) * 100}
                    completed={goal.completed}
                  />
                </StyledProgressBarContainer>
              </StyledFlex>
              <StyledText
                size="xs"
                color="secondary"
                style={{ marginTop: theme.spacing.xs }}
              >
                Target: {MONTH_NAMES[goal.month - 1]} {goal.year}
              </StyledText>
            </div>
          ))}
        </StyledFlex>
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
          <StyledText
            size="sm"
            color="secondary"
            style={{ marginBottom: theme.spacing.sm }}
          >
            Suggested Goals:
          </StyledText>
          {suggestions.length > 0 ? (
            <StyledFlex direction="column" gap="xs">
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
                  <StyledText
                    size="sm"
                    color="primary"
                    style={{ marginBottom: theme.spacing.xs }}
                  >
                    {getGoalDescription(goal)}
                  </StyledText>
                  <StyledText size="xs" color="secondary">
                    Target: {goal.target} by {MONTH_NAMES[goal.month - 1]} {goal.year}
                  </StyledText>
                </div>
              ))}
            </StyledFlex>
          ) : (
            <StyledText size="sm" color="secondary" style={{ fontStyle: 'italic' }}>
              No suggestions available. Set custom goals based on your team&apos;s needs.
            </StyledText>
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
