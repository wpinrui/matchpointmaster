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
        maxHeight: '600px',
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

      {/* Insights List - Scrollable */}
      {insights.length > 0 ? (
        <>
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.md,
              minHeight: 0
            }}
          >
            {currentPageInsights.map((insight, index) => (
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
                  }`,
                  flexShrink: 0
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: theme.spacing.md,
                borderTop: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
                flexShrink: 0
              }}
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color:
                    currentPage === 1
                      ? theme.colors.text.secondary
                      : theme.colors.primary.main,
                  background:
                    currentPage === 1
                      ? theme.colors.border.default + '40'
                      : theme.colors.primary.main + '20',
                  border: `1px solid ${
                    currentPage === 1
                      ? theme.colors.border.default
                      : theme.colors.primary.main
                  }`,
                  borderRadius: theme.borderRadius.sm,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Previous
              </button>
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary
                }}
              >
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color:
                    currentPage === totalPages
                      ? theme.colors.text.secondary
                      : theme.colors.primary.main,
                  background:
                    currentPage === totalPages
                      ? theme.colors.border.default + '40'
                      : theme.colors.primary.main + '20',
                  border: `1px solid ${
                    currentPage === totalPages
                      ? theme.colors.border.default
                      : theme.colors.primary.main
                  }`,
                  borderRadius: theme.borderRadius.sm,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <p
          style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.text.secondary,
            margin: 0,
            textAlign: 'center',
            padding: theme.spacing.lg
          }}
        >
          No insights available yet.
        </p>
      )}
    </GameCard>
  )
}
