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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: theme.spacing.lg
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: 0,
              marginBottom: theme.spacing.sm
            }}
          >
            Training Plan
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.xs
            }}
          >
            <div>
              <strong style={{ color: theme.colors.text.primary }}>Team Focus:</strong>{' '}
              {trainingPlan.teamFocus ? (
                <span style={{ color: theme.colors.text.secondary }}>
                  {getTrainingFocusDisplayName(trainingPlan.teamFocus)}
                </span>
              ) : (
                <span style={{ color: theme.colors.text.secondary, fontStyle: 'italic' }}>
                  Not set
                </span>
              )}
            </div>
            <div>
              <strong style={{ color: theme.colors.text.primary }}>
                Individual Coaching:
              </strong>{' '}
              <span style={{ color: theme.colors.text.secondary }}>
                {trainingPlan.coachingSlotsUsed} / {maxCoachingSlots} slots used
              </span>
            </div>
            <div>
              <strong style={{ color: theme.colors.text.primary }}>
                Players with Individual Plans:
              </strong>{' '}
              <span style={{ color: theme.colors.text.secondary }}>
                {trainingPlan.playerAssignments.length}
              </span>
            </div>
            {trainingPlan.teamFocus && expectedSummary.totalExpectedImprovement > 0 && (
              <div
                style={{
                  marginTop: theme.spacing.xs,
                  padding: theme.spacing.sm,
                  background: theme.colors.primary.main + '20',
                  borderRadius: theme.borderRadius.sm,
                  border: `${theme.borderWidth.default} solid ${theme.colors.primary.main}`
                }}
              >
                <strong style={{ color: theme.colors.text.primary }}>
                  Expected Improvement:
                </strong>{' '}
                <span style={{ color: theme.colors.success.main }}>
                  +{expectedSummary.totalExpectedImprovement} total points
                </span>{' '}
                (~{expectedSummary.averagePerPlayer} per player)
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
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
        </div>
      </div>
    </GameCard>
  )
}
