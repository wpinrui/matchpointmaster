import React from 'react'
import { theme } from '../../theme/theme'
import { getPlayerFullName } from '../../utils/playerGeneration'
import { StyledFlex, StyledText } from '../../styles'

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
      <StyledText
        size="base"
        color="secondary"
        style={{ margin: 0, textAlign: 'center', padding: theme.spacing.lg }}
      >
        No insights available yet.
      </StyledText>
    )
  }

  return (
    <StyledFlex
      direction="column"
      gap="sm"
      style={{
        overflowY: 'auto',
        flex: 1,
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
          <StyledFlex
            justify="space-between"
            align="flex-start"
            style={{ marginBottom: theme.spacing.xs }}
          >
            <div>
              <StyledText size="sm" weight="bold" color="primary">
                {getPlayerFullName(insight.player as any)}
              </StyledText>
              <StyledText
                size="xs"
                color="secondary"
                style={{ marginLeft: theme.spacing.xs }}
              >
                — {insight.skillLabel}
              </StyledText>
            </div>
            <StyledText
              size="sm"
              weight="bold"
              style={{
                color: insight.isMax ? theme.colors.success.main : theme.colors.error.main
              }}
            >
              {insight.improvement > 0 ? '+' : ''}
              {Math.floor(insight.improvement)}
            </StyledText>
          </StyledFlex>
          <StyledText size="xs" color="secondary" style={{ lineHeight: 1.5 }}>
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
          </StyledText>
        </div>
      ))}
    </StyledFlex>
  )
}
