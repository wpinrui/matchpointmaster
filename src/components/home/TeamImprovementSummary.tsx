import React from 'react'
import { theme } from '../../theme/theme'
import { TrainingPlan } from '../../services/savegame/types'
import { getTrainingFocusDisplayName } from '../../utils/trainingPlans'
import { StyledFlex, StyledText, StyledCard } from '../../styles'

interface TeamImprovementSummaryProps {
  teamTotalImprovement: number
  teamAvgImprovement: number
  trainingPlan: TrainingPlan | null
}

export const TeamImprovementSummary: React.FC<TeamImprovementSummaryProps> = ({
  teamTotalImprovement,
  teamAvgImprovement,
  trainingPlan
}) => {
  return (
    <StyledCard
      style={{
        marginBottom: theme.spacing.md,
        padding: theme.spacing.md,
        background: theme.colors.primary.main + '20',
        border: `${theme.borderWidth.default} solid ${theme.colors.primary.main}`
      }}
    >
      <StyledFlex
        justify="space-between"
        align="center"
        style={{ marginBottom: theme.spacing.xs }}
      >
        <StyledText size="base" color="secondary">
          Team Total Improvement:
        </StyledText>
        <StyledText size="xl" weight="bold" style={{ color: theme.colors.success.main }}>
          +{teamTotalImprovement}
        </StyledText>
      </StyledFlex>
      <StyledFlex
        justify="space-between"
        align="center"
        style={{ marginBottom: theme.spacing.xs }}
      >
        <StyledText size="base" color="secondary">
          Average per Player:
        </StyledText>
        <StyledText size="base" weight="medium" color="primary">
          +{teamAvgImprovement} per skill
        </StyledText>
      </StyledFlex>
      {/* Training Feedback */}
      {trainingPlan?.teamFocus && (
        <div
          style={{
            marginTop: theme.spacing.sm,
            paddingTop: theme.spacing.sm,
            borderTop: `${theme.borderWidth.default} solid ${theme.colors.border.default}`
          }}
        >
          <StyledText
            size="sm"
            color="secondary"
            style={{ marginBottom: theme.spacing.xs }}
          >
            <strong style={{ color: theme.colors.text.primary }}>Training Focus:</strong>{' '}
            {getTrainingFocusDisplayName(trainingPlan.teamFocus)}
          </StyledText>
          {teamTotalImprovement > 50 ? (
            <StyledText size="sm" style={{ color: theme.colors.success.main }}>
              ✓ Excellent results! The training focus is working well.
            </StyledText>
          ) : teamTotalImprovement > 30 ? (
            <StyledText size="sm" color="secondary">
              ✓ Good progress. Consider adjusting focus if needed.
            </StyledText>
          ) : (
            <StyledText size="sm" color="secondary">
              ⚠ Lower than expected. Review training plan effectiveness.
            </StyledText>
          )}
        </div>
      )}
    </StyledCard>
  )
}
