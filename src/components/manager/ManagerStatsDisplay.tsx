import React from 'react'
import { ManagerStats } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import {
  getCoachingLevel,
  getReputationLevel,
  getStatColor,
  getStatDescription
} from '../../utils/managerStats'
import GameCard from '../cards/GameCard'

interface ManagerStatsDisplayProps {
  stats: ManagerStats
}

export const ManagerStatsDisplay: React.FC<ManagerStatsDisplayProps> = ({ stats }) => {
  const reputationColor = getStatColor(stats.reputation)
  const coachingColor = getStatColor(stats.coachingEffectiveness)

  return (
    <GameCard
      style={{
        padding: theme.spacing.lg,
        marginTop: theme.spacing.xl
      }}
    >
      <h3
        style={{
          fontFamily: theme.typography.fontFamily.heading,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.lg,
          textAlign: 'center'
        }}
      >
        Manager Statistics
      </h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.lg
        }}
      >
        {/* Reputation Stat */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: theme.spacing.xs
            }}
          >
            <div style={{ flex: 1 }}>
              <h4
                style={{
                  fontFamily: theme.typography.fontFamily.heading,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                  margin: 0,
                  marginBottom: theme.spacing.xs
                }}
              >
                Reputation
              </h4>
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  margin: 0
                }}
              >
                {getReputationLevel(stats.reputation)}
              </p>
            </div>
            <div
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: reputationColor,
                marginLeft: theme.spacing.md
              }}
            >
              {stats.reputation}
            </div>
          </div>
          <div
            style={{
              height: '12px',
              background: theme.colors.neutral.gray200,
              borderRadius: theme.borderRadius.sm,
              overflow: 'hidden',
              marginTop: theme.spacing.xs
            }}
          >
            <div
              style={{
                width: `${stats.reputation}%`,
                height: '100%',
                background: reputationColor,
                borderRadius: theme.borderRadius.sm,
                transition: 'width 0.5s ease-in-out'
              }}
            />
          </div>
          <p
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
              marginTop: theme.spacing.xs,
              fontStyle: 'italic'
            }}
          >
            {getStatDescription('reputation', stats.reputation)}
          </p>
        </div>

        {/* Coaching Effectiveness Stat */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: theme.spacing.xs
            }}
          >
            <div style={{ flex: 1 }}>
              <h4
                style={{
                  fontFamily: theme.typography.fontFamily.heading,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                  margin: 0,
                  marginBottom: theme.spacing.xs
                }}
              >
                Coaching Effectiveness
              </h4>
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  margin: 0
                }}
              >
                {getCoachingLevel(stats.coachingEffectiveness)}
              </p>
            </div>
            <div
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: coachingColor,
                marginLeft: theme.spacing.md
              }}
            >
              {stats.coachingEffectiveness}
            </div>
          </div>
          <div
            style={{
              height: '12px',
              background: theme.colors.neutral.gray200,
              borderRadius: theme.borderRadius.sm,
              overflow: 'hidden',
              marginTop: theme.spacing.xs
            }}
          >
            <div
              style={{
                width: `${stats.coachingEffectiveness}%`,
                height: '100%',
                background: coachingColor,
                borderRadius: theme.borderRadius.sm,
                transition: 'width 0.5s ease-in-out'
              }}
            />
          </div>
          <p
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
              marginTop: theme.spacing.xs,
              fontStyle: 'italic'
            }}
          >
            {getStatDescription('coachingEffectiveness', stats.coachingEffectiveness)}
          </p>
        </div>
      </div>
    </GameCard>
  )
}
