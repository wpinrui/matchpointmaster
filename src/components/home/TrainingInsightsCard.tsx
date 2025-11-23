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
import { StyledHeading, StyledText, StyledFlex } from '../../styles'

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
          flexDirection: 'column',
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden'
        }}
      >
        <StyledHeading size="h5" margin={`0 0 ${theme.spacing.md} 0`}>
          Training Insights
        </StyledHeading>
        <StyledText size="base" color="secondary">
          No players on the team yet.
        </StyledText>
      </GameCard>
    )
  }

  return (
    <GameCard
      style={{
        padding: theme.spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden'
      }}
    >
      <StyledHeading
        size="h5"
        margin={`0 0 ${theme.spacing.md} 0`}
        style={{ flexShrink: 0 }}
      >
        Training Insights
      </StyledHeading>

      <StyledFlex
        direction="column"
        style={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0
        }}
      >
        {/* Team Overview */}
        <div
          style={{
            marginBottom: theme.spacing.md,
            paddingBottom: theme.spacing.md,
            borderBottom: `${theme.borderWidth.default} solid ${theme.colors.border.default}`
          }}
        >
          <StyledFlex
            justify="space-between"
            align="center"
            style={{ marginBottom: theme.spacing.xs }}
          >
            <StyledText size="base" color="secondary">
              Team Average Skill:
            </StyledText>
            <StyledText size="lg" weight="bold" color="primary">
              {teamAverage}
            </StyledText>
          </StyledFlex>
          {teamWeakest && (
            <StyledFlex justify="space-between" align="center">
              <StyledText size="base" color="secondary">
                Weakest Area:
              </StyledText>
              <StyledText size="base" weight="medium" color="primary">
                {teamWeakest.label} ({teamWeakest.average})
              </StyledText>
            </StyledFlex>
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <StyledFlex
            direction="column"
            gap="sm"
            style={{ marginBottom: theme.spacing.md }}
          >
            <StyledHeading size="h6" margin="0">
              Recommendations:
            </StyledHeading>
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
                <StyledFlex
                  justify="space-between"
                  align="center"
                  style={{ marginBottom: theme.spacing.xs }}
                >
                  <StyledText size="sm" weight="bold" color="primary">
                    {getTrainingFocusDisplayName(rec.focus)}
                  </StyledText>
                  <StyledText
                    size="xs"
                    color="secondary"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {rec.priority}
                  </StyledText>
                </StyledFlex>
                <StyledText
                  size="sm"
                  color="secondary"
                  style={{ margin: `0 0 ${theme.spacing.xs} 0` }}
                >
                  {rec.reason}
                </StyledText>
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
          </StyledFlex>
        )}

        <GameButton
          variant="primary"
          size="sm"
          onClick={() => changeScreen(Screens.TRAINING)}
          fullWidth
          style={{ flexShrink: 0 }}
        >
          Open Training
        </GameButton>
      </StyledFlex>
    </GameCard>
  )
}
