import React from 'react'
import GameCard from '../cards/GameCard'
import { theme } from '../../theme/theme'

interface TeamStatusCardProps {
  teamSize: number
}

export const TeamStatusCard: React.FC<TeamStatusCardProps> = ({ teamSize }) => {
  return (
    <GameCard
      style={{
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.xl
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: 0,
              marginBottom: theme.spacing.xs
            }}
          >
            Team Status
          </h3>
          <p
            style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.secondary,
              margin: 0
            }}
          >
            {teamSize} player{teamSize !== 1 ? 's' : ''} selected
          </p>
        </div>
      </div>
    </GameCard>
  )
}
