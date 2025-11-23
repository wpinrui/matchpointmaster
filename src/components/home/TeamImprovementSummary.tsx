import React from 'react'
import { theme } from '../../theme/theme'
import { TrainingPlan } from '../../services/savegame/types'
import { getTrainingFocusDisplayName } from '../../utils/trainingPlans'

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
    <div
      style={{
        marginBottom: theme.spacing.md,
        padding: theme.spacing.md,
        background: theme.colors.primary.main + '20',
        borderRadius: theme.borderRadius.sm,
        border: `${theme.borderWidth.default} solid ${theme.colors.primary.main}`
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
        <span
          style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.text.secondary
          }}
        >
          Team Total Improvement:
        </span>
        <span
          style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.success.main
          }}
        >
          +{teamTotalImprovement}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.xs
        }}
      >
        <span
          style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.text.secondary
          }}
        >
          Average per Player:
        </span>
        <span
          style={{
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary
          }}
        >
          +{teamAvgImprovement} per skill
        </span>
      </div>
      {/* Training Feedback */}
      {trainingPlan?.teamFocus && (
        <div
          style={{
            marginTop: theme.spacing.sm,
            paddingTop: theme.spacing.sm,
            borderTop: `${theme.borderWidth.default} solid ${theme.colors.border.default}`
          }}
        >
          <div
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs
            }}
          >
            <strong style={{ color: theme.colors.text.primary }}>Training Focus:</strong>{' '}
            {getTrainingFocusDisplayName(trainingPlan.teamFocus)}
          </div>
          {teamTotalImprovement > 50 ? (
            <div
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.success.main
              }}
            >
              ✓ Excellent results! The training focus is working well.
            </div>
          ) : teamTotalImprovement > 30 ? (
            <div
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary
              }}
            >
              ✓ Good progress. Consider adjusting focus if needed.
            </div>
          ) : (
            <div
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary
              }}
            >
              ⚠ Lower than expected. Review training plan effectiveness.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
