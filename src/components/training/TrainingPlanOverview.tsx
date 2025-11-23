import React from 'react'
import GameCard from '../cards/GameCard'
import GameButton from '../buttons/GameButton'
import { theme } from '../../theme/theme'
import { TrainingPlan, TrainingFocus } from '../../services/savegame/types'
import {
  getTrainingFocusDisplayName,
  getRecommendedTrainingFocus
} from '../../utils/trainingPlans'
import { GamePhase } from '../../utils/gamePhases'
import { StyledHeading, StyledText, StyledFlex, StyledCard } from '../../styles'

interface TrainingPlanOverviewProps {
  trainingPlan: TrainingPlan
  maxCoachingSlots: number
  recommendedFocus: TrainingFocus | null
  expectedSummary: {
    totalExpectedImprovement: number
    averagePerPlayer: number
  }
  onSetTeamFocus: () => void
  onUseRecommended: (focus: TrainingFocus) => void
  onTogglePreview: () => void
  showPreview: boolean
}

export const TrainingPlanOverview: React.FC<TrainingPlanOverviewProps> = ({
  trainingPlan,
  maxCoachingSlots,
  recommendedFocus,
  expectedSummary,
  onSetTeamFocus,
  onUseRecommended,
  onTogglePreview,
  showPreview
}) => {
  return (
    <GameCard
      style={{
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg
      }}
    >
      <StyledFlex justify="space-between" align="flex-start" gap="lg">
        <div style={{ flex: 1 }}>
          <StyledHeading size="h5" margin={`0 0 ${theme.spacing.sm} 0`}>
            Training Plan
          </StyledHeading>
          <StyledFlex direction="column" gap="xs">
            <StyledText size="base" color="primary">
              <strong>Team Focus:</strong>{' '}
              {trainingPlan.teamFocus ? (
                <span style={{ color: theme.colors.text.secondary }}>
                  {getTrainingFocusDisplayName(trainingPlan.teamFocus)}
                </span>
              ) : (
                <span style={{ color: theme.colors.text.secondary, fontStyle: 'italic' }}>
                  Not set
                </span>
              )}
            </StyledText>
            <StyledText size="base" color="primary">
              <strong>Individual Coaching:</strong>{' '}
              <span style={{ color: theme.colors.text.secondary }}>
                {trainingPlan.coachingSlotsUsed} / {maxCoachingSlots} slots used
              </span>
            </StyledText>
            <StyledText size="base" color="primary">
              <strong>Players with Individual Plans:</strong>{' '}
              <span style={{ color: theme.colors.text.secondary }}>
                {trainingPlan.playerAssignments.length}
              </span>
            </StyledText>
            {trainingPlan.teamFocus && expectedSummary.totalExpectedImprovement > 0 && (
              <StyledCard
                style={{
                  marginTop: theme.spacing.xs,
                  padding: theme.spacing.sm,
                  background: theme.colors.primary.main + '20',
                  border: `${theme.borderWidth.default} solid ${theme.colors.primary.main}`
                }}
              >
                <StyledText size="base" color="primary">
                  <strong>Expected Improvement:</strong>{' '}
                  <span style={{ color: theme.colors.success.main }}>
                    +{expectedSummary.totalExpectedImprovement} total points
                  </span>{' '}
                  (~{expectedSummary.averagePerPlayer} per player)
                </StyledText>
              </StyledCard>
            )}
          </StyledFlex>
        </div>
        <StyledFlex direction="column" gap="sm">
          <GameButton variant="primary" size="sm" onClick={onSetTeamFocus}>
            {trainingPlan.teamFocus ? 'Change Team Focus' : 'Set Team Focus'}
          </GameButton>
          {recommendedFocus && !trainingPlan.teamFocus && (
            <GameButton
              variant="secondary"
              size="sm"
              onClick={() => onUseRecommended(recommendedFocus)}
            >
              Use Recommended ({getTrainingFocusDisplayName(recommendedFocus)})
            </GameButton>
          )}
          {trainingPlan.teamFocus && (
            <GameButton variant="secondary" size="sm" onClick={onTogglePreview}>
              {showPreview ? 'Hide Preview' : 'Show Expected Improvements'}
            </GameButton>
          )}
        </StyledFlex>
      </StyledFlex>
    </GameCard>
  )
}
