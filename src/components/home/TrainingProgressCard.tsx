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
  calculateTeamAverageImprovement,
  calculateTeamTotalImprovement
} from '../../utils/trainingInsights'
import { SkillSnapshot } from '../../services/savegame/types'
import {
  getImprovementChartData,
  getYearToDateSnapshots
} from '../../utils/trainingAnalytics'
import { ImprovementBarChart } from './ImprovementBarChart'
import { ViewModeToggle } from './ViewModeToggle'
import { TeamImprovementSummary } from './TeamImprovementSummary'
import { TopImproversList } from './TopImproversList'

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
  const { players, teamRoster, trainingPlan } = useSaveDataContext()
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
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
          flexShrink: 0
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

        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Team Overall Improvement */}
        <TeamImprovementSummary
          teamTotalImprovement={teamTotalImprovement}
          teamAvgImprovement={teamAvgImprovement}
          trainingPlan={trainingPlan}
        />

        {/* Top Improvers */}
        <TopImproversList topImprovers={topImprovers} oldSnapshots={oldSnapshots} />

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
      </div>
    </GameCard>
  )
}
