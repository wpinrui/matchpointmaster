import React from 'react'
import { theme } from '../../theme/theme'
import { getPlayerFullName } from '../../utils/playerGeneration'

interface Insight {
  player: {
    id: string
  }
  skill: string
  skillLabel: string
  improvement: number
  isMax: boolean
  reasons: string[]
}

interface InsightsListProps {
  insights: Insight[]
}

export const InsightsList: React.FC<InsightsListProps> = ({ insights }) => {
  if (insights.length === 0) {
    return (
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
    )
  }

  return (
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
                {getPlayerFullName(insight.player as any)}
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
                color: insight.isMax ? theme.colors.success.main : theme.colors.error.main
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
  )
}
