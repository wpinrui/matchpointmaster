import React, { useMemo, useState } from 'react'
import { MatchState, RallyEvent } from '../../utils/matchEngine'
import { Player } from '../../services/savegame/types'
import GameCard from '../cards/GameCard'
import { theme } from '../../theme/theme'
import { StyledHeading, StyledText, StyledFlex } from '../../styles'
import GameButton from '../buttons/GameButton'

interface MatchInsightsProps {
  matchState: MatchState
  logEvents: RallyEvent[]
  player1: Player
  player2: Player
}

type PointCategory =
  | 'won_serve_error'
  | 'won_lucky_bounce'
  | 'won_rally_placement'
  | 'won_rally_spin'
  | 'won_rally_stroke'
  | 'won_rally_serve'
  | 'won_rally_other'
  | 'lost_serve_error'
  | 'lost_error'
  | 'lost_rally_placement'
  | 'lost_rally_spin'
  | 'lost_rally_stroke'
  | 'lost_rally_serve'
  | 'lost_rally_other'

interface PointAnalysis {
  category: PointCategory
  count: number
  description: string
  isWon: boolean
}

export const MatchInsights: React.FC<MatchInsightsProps> = ({
  matchState,
  logEvents,
  player1,
  player2
}) => {
  const [perspective, setPerspective] = useState<0 | 1>(0) // 0 = player1 (left), 1 = player2 (right)

  /**
   * Extract primary skill from point description
   * Returns: 'placement', 'spin', 'stroke', 'serve', or 'other'
   */
  const extractPrimarySkill = (
    description: string
  ): 'placement' | 'spin' | 'stroke' | 'serve' | 'other' => {
    const lowerDesc = description.toLowerCase()

    // Check for serve first (most specific)
    if (lowerDesc.includes('serve')) {
      return 'serve'
    }

    // Check for placement
    if (lowerDesc.includes('placement')) {
      return 'placement'
    }

    // Check for spin
    if (lowerDesc.includes('spin')) {
      return 'spin'
    }

    // Check for stroke/forehand/backhand
    if (
      lowerDesc.includes('forehand') ||
      lowerDesc.includes('backhand') ||
      lowerDesc.includes('stroke')
    ) {
      return 'stroke'
    }

    return 'other'
  }

  // Analyze points won/lost by the perspective player
  const pointAnalysis = useMemo(() => {
    const analysis: PointAnalysis[] = [
      {
        category: 'won_serve_error',
        count: 0,
        description: 'Won: Opponent Serve Error',
        isWon: true
      },
      {
        category: 'won_lucky_bounce',
        count: 0,
        description: 'Won: Lucky Bounce',
        isWon: true
      },
      {
        category: 'won_rally_placement',
        count: 0,
        description: 'Won: Superior Placement',
        isWon: true
      },
      {
        category: 'won_rally_spin',
        count: 0,
        description: 'Won: Superior Spin',
        isWon: true
      },
      {
        category: 'won_rally_stroke',
        count: 0,
        description: 'Won: Superior Stroke',
        isWon: true
      },
      {
        category: 'won_rally_serve',
        count: 0,
        description: 'Won: Powerful Serve',
        isWon: true
      },
      {
        category: 'won_rally_other',
        count: 0,
        description: 'Won: Rally',
        isWon: true
      },
      {
        category: 'lost_serve_error',
        count: 0,
        description: 'Lost: Serve Error',
        isWon: false
      },
      {
        category: 'lost_error',
        count: 0,
        description: 'Lost: Unforced Error',
        isWon: false
      },
      {
        category: 'lost_rally_placement',
        count: 0,
        description: 'Lost: Opponent Placement',
        isWon: false
      },
      {
        category: 'lost_rally_spin',
        count: 0,
        description: 'Lost: Opponent Spin',
        isWon: false
      },
      {
        category: 'lost_rally_stroke',
        count: 0,
        description: 'Lost: Opponent Stroke',
        isWon: false
      },
      {
        category: 'lost_rally_serve',
        count: 0,
        description: 'Lost: Opponent Serve',
        isWon: false
      },
      {
        category: 'lost_rally_other',
        count: 0,
        description: 'Lost: Rally',
        isWon: false
      }
    ]

    // Find all point events and analyze the events leading up to each point
    let lastPointIndex = -1

    for (let i = 0; i < logEvents.length; i++) {
      const event = logEvents[i]

      if (event.type === 'point') {
        const pointWinner = event.player
        const isPerspectivePlayer = pointWinner === perspective

        // Get events since last point
        const rallyEvents = logEvents.slice(lastPointIndex + 1, i)

        // Check for specific event types in this rally
        const hasLuckyBounce = rallyEvents.some(
          (e) => e.type === 'lucky_bounce' && e.player === perspective
        )
        const hasServeError = rallyEvents.some(
          (e) => e.type === 'error' && e.description.toLowerCase().includes('serve')
        )
        const hasOwnError = rallyEvents.some(
          (e) => e.type === 'error' && e.player === perspective
        )
        const hasOpponentError = rallyEvents.some(
          (e) => e.type === 'error' && e.player !== perspective
        )

        // Check description first to determine if it's an error
        // Description format: "Player wins the point (reason)"
        const descLower = event.description.toLowerCase()
        const reasonMatch = event.description.match(/\((.+)\)$/)
        const reason = reasonMatch ? reasonMatch[1].toLowerCase().trim() : ''

        // Check for specific error types in the reason
        const isServeError = reason === 'serve error' || reason.includes('serve error')
        const isReceiveError = reason === 'receive error'
        const isError = reason === 'error' || isReceiveError
        const isLuckyBounce = hasLuckyBounce

        if (isPerspectivePlayer) {
          // Point won by perspective player
          if (isLuckyBounce) {
            analysis.find((a) => a.category === 'won_lucky_bounce')!.count++
          } else if (isServeError) {
            analysis.find((a) => a.category === 'won_serve_error')!.count++
          } else if (isError) {
            // Won due to opponent error - categorize as other
            analysis.find((a) => a.category === 'won_rally_other')!.count++
          } else {
            // Won rally - extract primary skill from description
            const skill = extractPrimarySkill(event.description)
            const category = `won_rally_${skill}` as PointCategory
            const item = analysis.find((a) => a.category === category)
            if (item) {
              item.count++
            } else {
              // Fallback to other if category not found
              analysis.find((a) => a.category === 'won_rally_other')!.count++
            }
          }
        } else {
          // Point lost by perspective player
          if (isServeError) {
            analysis.find((a) => a.category === 'lost_serve_error')!.count++
          } else if (isError || hasOwnError) {
            analysis.find((a) => a.category === 'lost_error')!.count++
          } else {
            // Lost rally - extract primary skill from description
            // Description might say "lost to opponent's placement" or "overwhelming advantage through placement"
            const skill = extractPrimarySkill(event.description)
            const category = `lost_rally_${skill}` as PointCategory
            const item = analysis.find((a) => a.category === category)
            if (item) {
              item.count++
            } else {
              // Fallback to other if category not found
              analysis.find((a) => a.category === 'lost_rally_other')!.count++
            }
          }
        }

        lastPointIndex = i
      }
    }

    // Validate totals match (for debugging - remove in production if desired)
    const totalWon = analysis.filter((a) => a.isWon).reduce((sum, a) => sum + a.count, 0)
    const totalLost = analysis
      .filter((a) => !a.isWon)
      .reduce((sum, a) => sum + a.count, 0)
    const totalPoints = logEvents.filter((e) => e.type === 'point').length

    return analysis.filter((a) => a.count > 0)
  }, [logEvents, perspective])

  // Calculate match facts
  const matchFacts = useMemo(() => {
    const totalPoints = matchState.currentSetScore[0] + matchState.currentSetScore[1]
    const completedSets = matchState.setScores.length

    // Calculate longest rally
    let maxLength = 0
    let currentLength = 0

    for (const event of logEvents) {
      if (event.type === 'ball' || event.type === 'return') {
        currentLength++
      } else if (event.type === 'point') {
        maxLength = Math.max(maxLength, currentLength)
        currentLength = 0
      }
    }

    return {
      totalPoints,
      completedSets,
      longestRally: maxLength
    }
  }, [matchState, logEvents])

  const maxCount = Math.max(...pointAnalysis.map((a) => Math.abs(a.count)), 1)
  const playerName =
    perspective === 0
      ? player1.shortName || player1.firstName
      : player2.shortName || player2.firstName

  return (
    <GameCard
      style={{
        padding: theme.spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.md,
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <StyledFlex
        justify="space-between"
        align="center"
        style={{ marginBottom: theme.spacing.xs }}
      >
        <StyledHeading size="h5" margin="0">
          Match Insights
        </StyledHeading>
        <GameButton
          variant="secondary"
          size="sm"
          onClick={() => setPerspective(perspective === 0 ? 1 : 0)}
          type="button"
        >
          View:{' '}
          {perspective === 0
            ? player2.shortName || player2.firstName
            : player1.shortName || player1.firstName}
        </GameButton>
      </StyledFlex>
      <StyledText
        size="xs"
        color="secondary"
        style={{ marginBottom: theme.spacing.md, fontStyle: 'italic' }}
        title="Hover over chart bars for detailed information about how points were won or lost"
      >
        Analysis of how{' '}
        {perspective === 0
          ? player1.shortName || player1.firstName
          : player2.shortName || player2.firstName}{' '}
        won or lost points. Hover for details.
      </StyledText>

      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {/* Point Analysis Chart */}
        <div style={{ marginBottom: theme.spacing.lg }}>
          <StyledText
            size="sm"
            weight="semibold"
            style={{ marginBottom: theme.spacing.sm }}
          >
            Points Won/Lost by {playerName}
          </StyledText>
          {pointAnalysis.length === 0 ? (
            <StyledText size="xs" color="secondary" style={{ fontStyle: 'italic' }}>
              No points played yet. Analysis will appear as the match progresses.
            </StyledText>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}
            >
              {pointAnalysis.map((item) => {
                const barWidth = (item.count / maxCount) * 100

                return (
                  <div
                    key={item.category}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.sm,
                      cursor: 'help'
                    }}
                    title={`${item.description}: ${item.count} point${item.count !== 1 ? 's' : ''}. ${item.isWon ? 'Points won' : 'Points lost'} by ${playerName}.`}
                  >
                    <StyledText
                      size="xs"
                      style={{
                        minWidth: '180px',
                        color: theme.colors.text.secondary
                      }}
                    >
                      {item.description}
                    </StyledText>
                    <div
                      style={{
                        flex: 1,
                        height: '24px',
                        background: theme.colors.background.nested,
                        borderRadius: theme.borderRadius.sm,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${barWidth}%`,
                          height: '100%',
                          background: item.isWon
                            ? theme.colors.success.main
                            : theme.colors.error.main,
                          borderRadius: theme.borderRadius.sm,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingRight: theme.spacing.xs,
                          transition: 'width 0.3s ease'
                        }}
                      >
                        <StyledText
                          size="xs"
                          weight="bold"
                          style={{
                            color: theme.colors.text.inverse,
                            fontSize: theme.typography.fontSize.xs
                          }}
                        >
                          {item.count}
                        </StyledText>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Match Facts */}
        <div>
          <StyledText
            size="sm"
            weight="semibold"
            style={{ marginBottom: theme.spacing.sm }}
          >
            Match Facts
          </StyledText>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.xs
            }}
          >
            <StyledText size="xs" color="secondary">
              Total Points Played: {matchFacts.totalPoints}
            </StyledText>
            <StyledText size="xs" color="secondary">
              Sets Completed: {matchFacts.completedSets}
            </StyledText>
            <StyledText size="xs" color="secondary">
              Current Set: {matchState.currentSet + 1}
            </StyledText>
            {matchFacts.longestRally > 0 && (
              <StyledText size="xs" color="secondary">
                Longest Rally: {matchFacts.longestRally} shots
              </StyledText>
            )}
          </div>
        </div>
      </div>
    </GameCard>
  )
}
