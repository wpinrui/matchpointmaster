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
import { StyledHeading, StyledText, StyledFlex } from '../../styles'

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
        <StyledHeading size="h5" margin={`0 0 ${theme.spacing.md} 0`}>
          Training Progress
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
      <StyledFlex
        justify="space-between"
        align="center"
        style={{ marginBottom: theme.spacing.md, flexShrink: 0 }}
      >
        <StyledHeading size="h5" margin="0">
          Training Progress
        </StyledHeading>
        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </StyledFlex>

      <StyledFlex
        direction="column"
        style={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0
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
      </StyledFlex>
    </GameCard>
  )
}
