/**
 * Training Progress Card
 * Shows progress history for training months after February
 */
import React, { useMemo, useState } from 'react'
import GameCard from '../cards/GameCard'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { theme } from '../../theme/theme'
import {
  getTopImprovers,
  getMostImprovedSkill,
  calculateTeamAverageImprovement,
  calculateTeamTotalImprovement
} from '../../utils/trainingInsights'
import {
  getImprovementInsights,
  getImprovementChartData,
  getYearToDateSnapshots
} from '../../utils/trainingAnalytics'
import { ImprovementBarChart } from './ImprovementBarChart'
import { Player, SkillSnapshot } from '../../services/savegame/types'

interface TrainingProgressCardProps {
  oldSnapshots: SkillSnapshot[] // Previous month's snapshots (for "Past Month" view)
  allSnapshots?: SkillSnapshot[] // All snapshots (for "Year-to-Date" view)
  currentYear: number
  currentMonth: number
}

export const TrainingProgressCard: React.FC<TrainingProgressCardProps> = ({
  oldSnapshots,
  allSnapshots = [],
  currentYear,
  currentMonth
}) => {
  const { players, teamRoster, manager, school, trainingPlan } = useSaveDataContext()
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month')

  // Get team players
  const teamPlayers = useMemo(() => {
    return players.filter((p) => teamRoster.includes(p.id))
  }, [players, teamRoster])

  // Determine which snapshots to use based on view mode
  const comparisonSnapshots = useMemo(() => {
    if (viewMode === 'year') {
      // Year-to-date: get earliest snapshot from training phases this year
      const yearToDateSnapshots = getYearToDateSnapshots(
        allSnapshots.length > 0 ? allSnapshots : oldSnapshots,
        currentYear
      )
      if (yearToDateSnapshots.length === 0) return oldSnapshots
      // Find earliest snapshot for each player
      const earliestSnapshots: SkillSnapshot[] = []
      teamPlayers.forEach((player) => {
        const playerSnapshots = yearToDateSnapshots.filter(
          (s) => s.playerId === player.id
        )
        if (playerSnapshots.length > 0) {
          const earliest = playerSnapshots.reduce((earliest, current) =>
            current.month < earliest.month ||
            (current.month === earliest.month && current.year < earliest.year)
              ? current
              : earliest
          )
          earliestSnapshots.push(earliest)
        }
      })
      return earliestSnapshots
    } else {
      // Past month: use oldSnapshots directly
      return oldSnapshots
    }
  }, [viewMode, oldSnapshots, allSnapshots, currentYear, teamPlayers])

  // Get top improvers
  const topImprovers = useMemo(() => {
    return getTopImprovers(comparisonSnapshots, teamPlayers, 3)
  }, [comparisonSnapshots, teamPlayers])

  // Get team average improvement
  const teamAvgImprovement = useMemo(() => {
    return calculateTeamAverageImprovement(comparisonSnapshots, teamPlayers)
  }, [comparisonSnapshots, teamPlayers])

  // Get total team improvement
  const teamTotalImprovement = useMemo(() => {
    return calculateTeamTotalImprovement(comparisonSnapshots, teamPlayers)
  }, [comparisonSnapshots, teamPlayers])

  // Get chart data
  const chartData = useMemo(() => {
    return getImprovementChartData(comparisonSnapshots, teamPlayers)
  }, [comparisonSnapshots, teamPlayers])

  // Get improvement insights
  const insights = useMemo(() => {
    if (!trainingPlan) return []

    const playerTrainings = trainingPlan.playerAssignments.map((assignment) => ({
      playerId: assignment.playerId,
      focus: assignment.focus,
      isIndividualCoaching: assignment.isIndividualCoaching
    }))

    return getImprovementInsights(
      comparisonSnapshots,
      teamPlayers,
      manager.playStyle,
      manager.stats.coachingEffectiveness,
      school.funding,
      trainingPlan.teamFocus,
      playerTrainings,
      8 // Max 8 insights
    )
  }, [
    comparisonSnapshots,
    teamPlayers,
    manager.playStyle,
    manager.stats.coachingEffectiveness,
    school.funding,
    trainingPlan
  ])

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
          Training Progress
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
          Training Progress
        </h2>

        {/* Toggle for view mode */}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.xs,
            background: theme.colors.border.default + '40',
            padding: theme.spacing.xs,
            borderRadius: theme.borderRadius.sm
          }}
        >
          <button
            onClick={() => setViewMode('month')}
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color:
                viewMode === 'month'
                  ? theme.colors.primary.main
                  : theme.colors.text.secondary,
              background:
                viewMode === 'month' ? theme.colors.background.primary : 'transparent',
              border: `1px solid ${
                viewMode === 'month'
                  ? theme.colors.primary.main
                  : theme.colors.border.default
              }`,
              borderRadius: theme.borderRadius.sm,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Past Month
          </button>
          <button
            onClick={() => setViewMode('year')}
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color:
                viewMode === 'year'
                  ? theme.colors.primary.main
                  : theme.colors.text.secondary,
              background:
                viewMode === 'year' ? theme.colors.background.primary : 'transparent',
              border: `1px solid ${
                viewMode === 'year'
                  ? theme.colors.primary.main
                  : theme.colors.border.default
              }`,
              borderRadius: theme.borderRadius.sm,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Year-to-Date
          </button>
        </div>
      </div>

      {/* Team Overall Improvement */}
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
            alignItems: 'center'
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
      </div>

      {/* Top Improvers */}
      {topImprovers.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm
          }}
        >
          <h3
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: 0,
              marginBottom: theme.spacing.xs
            }}
          >
            Top Improvers:
          </h3>
          {topImprovers.map(({ player, totalImprovement }) => {
            const oldSnapshot = oldSnapshots.find((s) => s.playerId === player.id)
            const mostImproved =
              oldSnapshot && getMostImprovedSkill(oldSnapshot.skills, player.skills)

            return (
              <div
                key={player.id}
                style={{
                  padding: theme.spacing.sm,
                  background: theme.colors.border.default + '40',
                  borderRadius: theme.borderRadius.sm,
                  border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`
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
                    {player.firstName} {player.lastName}
                  </strong>
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.success.main
                    }}
                  >
                    +{totalImprovement} total
                  </span>
                </div>
                {mostImproved && (
                  <p
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.text.secondary,
                      margin: 0
                    }}
                  >
                    Most improved: {mostImproved.label} (+{mostImproved.improvement})
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {topImprovers.length === 0 && (
        <p
          style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.text.secondary,
            margin: 0
          }}
        >
          No progress data available yet.
        </p>
      )}

      {/* Improvement Bar Chart */}
      {chartData.length > 0 && (
        <div
          style={{
            marginTop: theme.spacing.lg,
            padding: theme.spacing.md,
            background: theme.colors.border.default + '20',
            borderRadius: theme.borderRadius.sm
          }}
        >
          <ImprovementBarChart data={chartData} maxBars={10} />
        </div>
      )}

      {/* Improvement Insights */}
      {insights.length > 0 && (
        <div
          style={{
            marginTop: theme.spacing.lg,
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm
          }}
        >
          <h3
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: 0,
              marginBottom: theme.spacing.xs
            }}
          >
            Improvement Insights:
          </h3>
          {insights.map((insight, index) => (
            <div
              key={`${insight.player.id}-${insight.skill}-${index}`}
              style={{
                padding: theme.spacing.sm,
                background: insight.isMax
                  ? theme.colors.success.main + '20'
                  : theme.colors.error.main + '20',
                borderRadius: theme.borderRadius.sm,
                border: `1px solid ${
                  insight.isMax ? theme.colors.success.main : theme.colors.error.main
                }`
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: theme.spacing.xs
                }}
              >
                <div>
                  <strong
                    style={{
                      color: theme.colors.text.primary,
                      fontSize: theme.typography.fontSize.sm
                    }}
                  >
                    {insight.player.firstName} {insight.player.lastName}
                  </strong>
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.text.secondary,
                      marginLeft: theme.spacing.xs
                    }}
                  >
                    — {insight.skillLabel}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: insight.isMax
                      ? theme.colors.success.main
                      : theme.colors.error.main
                  }}
                >
                  {insight.improvement > 0 ? '+' : ''}
                  {Math.floor(insight.improvement)}
                </span>
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.secondary,
                  lineHeight: 1.5
                }}
              >
                {insight.isMax ? (
                  <span style={{ color: theme.colors.success.main }}>
                    <strong>Strong Improvement:</strong>
                  </span>
                ) : (
                  <span style={{ color: theme.colors.error.main }}>
                    <strong>Limited Improvement:</strong>
                  </span>
                )}
                <ul
                  style={{
                    margin: `${theme.spacing.xs} 0 0 ${theme.spacing.md}`,
                    padding: 0,
                    listStyle: 'disc'
                  }}
                >
                  {insight.reasons.map((reason, reasonIndex) => (
                    <li key={reasonIndex} style={{ marginBottom: theme.spacing.xs }}>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </GameCard>
  )
}
