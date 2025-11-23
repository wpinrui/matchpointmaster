import React from 'react'
import GameCard from '../cards/GameCard'
import { theme } from '../../theme/theme'

interface TeamStatisticsProps {
  teamStats: {
    totalPlayers: number
    averageRating: number
    lowerSecondary: number
    upperSecondary: number
  }
  maxTeamSize: number
}

export const TeamStatistics: React.FC<TeamStatisticsProps> = ({
  teamStats,
  maxTeamSize
}) => {
  return (
    <GameCard
      style={{
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: theme.spacing.lg,
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <span
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary
            }}
          >
            Team Size:
          </span>
          <span
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.primary.main
            }}
          >
            {teamStats.totalPlayers} / {maxTeamSize}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <span
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary
            }}
          >
            Avg Rating:
          </span>
          <span
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.accent.light
            }}
          >
            {teamStats.averageRating || 'N/A'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <span
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary
            }}
          >
            Lower Sec:
          </span>
          <span
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.secondary.light
            }}
          >
            {teamStats.lowerSecondary}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <span
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary
            }}
          >
            Upper Sec:
          </span>
          <span
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.secondary.light
            }}
          >
            {teamStats.upperSecondary}
          </span>
        </div>
      </div>
    </GameCard>
  )
}

