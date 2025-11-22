/**
 * Training Insights Card
 * Shows team analysis and training recommendations for February (before training)
 */
import React, { useMemo } from 'react'
import GameCard from '../cards/GameCard'
import GameButton from '../buttons/GameButton'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { theme } from '../../theme/theme'
import { Screens } from '../../screen_manager/screens'
import {
  getTrainingRecommendations,
  getTeamWeakestSkill,
  calculateTeamAverageSkill
} from '../../utils/trainingInsights'
import { TrainingFocus } from '../../services/savegame/types'
import { getTrainingFocusDisplayName } from '../../utils/trainingPlans'

interface TrainingInsightsCardProps {
  changeScreen: (screen: Screens) => void
}

export const TrainingInsightsCard: React.FC<TrainingInsightsCardProps> = ({
  changeScreen
}) => {
  const { players, teamRoster, manager } = useSaveDataContext()

  // Get team players
  const teamPlayers = useMemo(() => {
    return players.filter((p) => teamRoster.includes(p.id))
  }, [players, teamRoster])

  // Get training recommendations
  const recommendations = useMemo(() => {
    if (!manager.playStyle) return []
    return getTrainingRecommendations(teamPlayers, manager.playStyle)
  }, [teamPlayers, manager.playStyle])

  // Get team's weakest skill
  const teamWeakest = useMemo(() => {
    return getTeamWeakestSkill(teamPlayers)
  }, [teamPlayers])

  // Calculate overall team average
  const teamAverage = useMemo(() => {
    if (teamPlayers.length === 0) return 0
    const skillKeys: Array<keyof (typeof teamPlayers)[0]['skills']> = [
      'forehand',
      'backhand',
      'footwork',
      'serve',
      'receive',
      'spin',
      'placement',
      'consistency'
    ]
    const totalAvg = skillKeys.reduce((sum, key) => {
      const avg =
        teamPlayers.reduce((acc, p) => acc + p.skills[key], 0) / teamPlayers.length
      return sum + avg
    }, 0)
    return Math.floor(totalAvg / skillKeys.length)
  }, [teamPlayers])

  if (teamPlayers.length === 0) {
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
          Training Insights
        </h2>
        <p
          style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.text.secondary
          }}
        >
          No players on the team yet.
        </p>
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
        Training Insights
      </h2>

      {/* Team Overview */}
      <div
        style={{
          marginBottom: theme.spacing.md,
          paddingBottom: theme.spacing.md,
          borderBottom: `${theme.borderWidth.default} solid ${theme.colors.border.default}`
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
            Team Average Skill:
          </span>
          <span
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary
            }}
          >
            {teamAverage}
          </span>
        </div>
        {teamWeakest && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span
              style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.secondary
              }}
            >
              Weakest Area:
            </span>
            <span
              style={{
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary
              }}
            >
              {teamWeakest.label} ({teamWeakest.average})
            </span>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.md
          }}
        >
          <h3
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: 0
            }}
          >
            Recommendations:
          </h3>
          {recommendations.slice(0, 3).map((rec, index) => (
            <div
              key={index}
              style={{
                padding: theme.spacing.sm,
                background:
                  rec.priority === 'high'
                    ? theme.colors.error.main + '20'
                    : theme.colors.primary.main + '20',
                borderRadius: theme.borderRadius.sm,
                border: `${theme.borderWidth.default} solid ${
                  rec.priority === 'high'
                    ? theme.colors.error.main
                    : theme.colors.primary.main
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
                  {getTrainingFocusDisplayName(rec.focus)}
                </strong>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.secondary,
                    textTransform: 'uppercase'
                  }}
                >
                  {rec.priority}
                </span>
              </div>
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  margin: 0,
                  marginBottom: theme.spacing.xs
                }}
              >
                {rec.reason}
              </p>
              <GameButton
                variant={rec.priority === 'high' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  changeScreen(Screens.TRAINING)
                  // Store the recommended focus in sessionStorage so TrainingScreen can apply it
                  sessionStorage.setItem('recommendedTrainingFocus', rec.focus)
                }}
                style={{ width: '100%', marginTop: theme.spacing.xs }}
              >
                Apply This Recommendation
              </GameButton>
            </div>
          ))}
        </div>
      )}

      <GameButton
        variant="primary"
        size="sm"
        onClick={() => changeScreen(Screens.TRAINING)}
        style={{ width: '100%' }}
      >
        Open Training
      </GameButton>
    </GameCard>
  )
}
