/**
 * Improvement Bar Chart Component
 * Displays player improvements as a bar chart
 */
import React from 'react'
import { theme } from '../../theme/theme'

export interface ImprovementChartData {
  playerName: string
  playerId: string
  totalImprovement: number
  improvements: Array<{
    skill: string
    skillLabel: string
    improvement: number
  }>
}

interface ImprovementBarChartProps {
  data: ImprovementChartData[]
  maxBars?: number // Maximum number of bars to display
}

export const ImprovementBarChart: React.FC<ImprovementBarChartProps> = ({
  data,
  maxBars = 10
}) => {
  if (data.length === 0) {
    return (
      <div
        style={{
          padding: theme.spacing.md,
          textAlign: 'center',
          color: theme.colors.text.secondary
        }}
      >
        No improvement data available
      </div>
    )
  }

  // Sort by total improvement (descending) and take top bars
  const sortedData = [...data]
    .sort((a, b) => b.totalImprovement - a.totalImprovement)
    .slice(0, maxBars)

  // Find max improvement for scaling
  const maxImprovement = Math.max(...sortedData.map((d) => d.totalImprovement), 1)
  const minImprovement = Math.min(...sortedData.map((d) => d.totalImprovement), 0)

  // Calculate chart dimensions
  const chartHeight = 300
  const barHeight = Math.max(20, (chartHeight - sortedData.length * 10) / sortedData.length)
  const maxBarWidth = 100 // Percentage

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.sm,
        padding: theme.spacing.md
      }}
    >
      <div
        style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.xs
        }}
      >
        Top {sortedData.length} Players by Total Improvement
      </div>

      <div
        style={{
          position: 'relative',
          height: `${chartHeight}px`,
          minHeight: `${chartHeight}px`
        }}
      >
        {/* Chart bars */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.xs,
            height: '100%'
          }}
        >
          {sortedData.map((player, index) => {
            const improvement = player.totalImprovement
            const isPositive = improvement >= 0
            const barWidth =
              maxImprovement > 0
                ? Math.abs((improvement / maxImprovement) * maxBarWidth)
                : 0

            return (
              <div
                key={player.playerId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                  height: `${barHeight}px`,
                  minHeight: `${barHeight}px`
                }}
              >
                {/* Player name */}
                <div
                  style={{
                    width: '120px',
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.primary,
                    fontWeight: theme.typography.fontWeight.medium,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                  title={player.playerName}
                >
                  {player.playerName}
                </div>

                {/* Bar */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    height: '100%'
                  }}
                >
                  {/* Negative improvement bar (if applicable) */}
                  {!isPositive && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        width: `${Math.abs(barWidth)}%`,
                        height: '70%',
                        backgroundColor: theme.colors.error.main,
                        borderRadius: theme.borderRadius.xs,
                        border: `${theme.borderWidth.default} solid ${theme.colors.error.main}`
                      }}
                    />
                  )}

                  {/* Zero line */}
                  {minImprovement < 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${((0 - minImprovement) / (maxImprovement - minImprovement)) * 100}%`,
                        width: '2px',
                        height: '100%',
                        backgroundColor: theme.colors.border.default,
                        zIndex: 1
                      }}
                    />
                  )}

                  {/* Positive improvement bar */}
                  {isPositive && (
                    <div
                      style={{
                        position: 'absolute',
                        left: minImprovement < 0 ? `${((0 - minImprovement) / (maxImprovement - minImprovement)) * 100}%` : 0,
                        width: `${barWidth}%`,
                        height: '70%',
                        backgroundColor: theme.colors.success.main,
                        borderRadius: theme.borderRadius.xs,
                        border: `${theme.borderWidth.default} solid ${theme.colors.success.main}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: theme.spacing.xs
                      }}
                    >
                      {/* Value label on bar */}
                      <span
                        style={{
                          fontSize: theme.typography.fontSize.xs,
                          color: theme.colors.background.main,
                          fontWeight: theme.typography.fontWeight.bold
                        }}
                      >
                        {improvement > 0 ? '+' : ''}
                        {Math.floor(improvement)}
                      </span>
                    </div>
                  )}

                  {/* Value label outside bar (if bar is too small) */}
                  {isPositive && barWidth < 15 && (
                    <span
                      style={{
                        position: 'absolute',
                        left: `${barWidth + 2}%`,
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.text.secondary,
                        fontWeight: theme.typography.fontWeight.medium
                      }}
                    >
                      {improvement > 0 ? '+' : ''}
                      {Math.floor(improvement)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Y-axis labels */}
        <div
          style={{
            position: 'absolute',
            left: '-40px',
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.text.secondary
          }}
        >
          {maxImprovement > 0 && (
            <>
              <span>{Math.floor(maxImprovement)}</span>
              {minImprovement < 0 && <span>0</span>}
              {minImprovement < 0 && <span>{Math.floor(minImprovement)}</span>}
            </>
          )}
        </div>
      </div>

      {/* X-axis label */}
      <div
        style={{
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          marginTop: theme.spacing.xs,
          paddingLeft: '120px'
        }}
      >
        Total Skill Improvement
      </div>
    </div>
  )
}

