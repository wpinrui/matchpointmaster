/**
 * Player Insights Card
 * Shows per-player improvement insights (why each player improved a lot or not much)
 * Displays all insights without truncation, with scrollable/paginated view
 */
import React, { useMemo, useState, useEffect } from 'react'
import GameCard from '../cards/GameCard'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { theme } from '../../theme/theme'
import {
  getImprovementInsights,
  getYearToDateSnapshots
} from '../../utils/trainingAnalytics'
import { SkillSnapshot } from '../../services/savegame/types'
import { ViewModeToggle } from './ViewModeToggle'
import { InsightsList } from './InsightsList'
import { PaginationControls } from './PaginationControls'

interface PlayerInsightsCardProps {
  oldSnapshots: SkillSnapshot[] // Previous month's snapshots (for "Past Month" view)
  allSnapshots?: SkillSnapshot[] // All snapshots (for "Year-to-Date" view)
  currentYear: number
  currentMonth: number
}

const ITEMS_PER_PAGE = 5

export const PlayerInsightsCard: React.FC<PlayerInsightsCardProps> = ({
  oldSnapshots,
  allSnapshots = [],
  currentYear,
  currentMonth
}) => {
  const { players, teamRoster, manager, school, trainingPlan } = useSaveDataContext()
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month')
  const [currentPage, setCurrentPage] = useState(1)

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

  // Get improvement insights - NO MAX LIMIT
  const insights = useMemo(() => {
    if (!trainingPlan) return []

    const playerTrainings = trainingPlan.playerAssignments.map((assignment) => ({
      playerId: assignment.playerId,
      focus: assignment.focus,
      isIndividualCoaching: assignment.isIndividualCoaching
    }))

    // Get all insights without limit (pass a very large number or remove limit entirely)
    // Since the function expects maxInsights, we'll pass a large number to get all
    return getImprovementInsights(
      comparisonSnapshots,
      teamPlayers,
      manager.playStyle,
      manager.stats.coachingEffectiveness,
      school.funding,
      trainingPlan.teamFocus,
      playerTrainings,
      9999 // Very large number to get all insights
    )
  }, [
    comparisonSnapshots,
    teamPlayers,
    manager.playStyle,
    manager.stats.coachingEffectiveness,
    school.funding,
    trainingPlan
  ])

  // Reset to page 1 when view mode changes
  useEffect(() => {
    setCurrentPage(1)
  }, [viewMode])

  // Pagination calculations
  const totalPages = Math.ceil(insights.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPageInsights = insights.slice(startIndex, endIndex)

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
          Player Insights
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
          Player Insights
          {insights.length > 0 && (
            <span
              style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.normal,
                color: theme.colors.text.secondary,
                marginLeft: theme.spacing.xs
              }}
            >
              ({insights.length})
            </span>
          )}
        </h2>

        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Insights List - Scrollable */}
      <InsightsList insights={currentPageInsights} />

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      />
    </GameCard>
  )
}
