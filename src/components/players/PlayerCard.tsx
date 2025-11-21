import React from 'react'
import { Player, Gender } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import GameCard from '../cards/GameCard'

interface PlayerCardProps {
  player: Player
  actionButton?: React.ReactNode
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, actionButton }) => {
  const fullName = `${player.firstName} ${player.lastName}`

  return (
    <GameCard>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.md,
          width: '100%'
        }}
      >
        {/* Header with avatar and basic info */}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            alignItems: 'center'
          }}
        >
          {player.imagePath && (
            <img
              src={player.imagePath}
              alt={fullName}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: theme.borderRadius.md,
                border: `2px solid ${theme.colors.secondary.main}`,
                objectFit: 'cover'
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontFamily: theme.typography.fontFamily.heading,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                margin: 0,
                marginBottom: theme.spacing.xs
              }}
            >
              {fullName}
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                lineHeight: 1.1
              }}
            >
              <span
                style={{
                  color:
                    player.gender === Gender.FEMALE
                      ? '#DC2626' // Red for female
                      : '#1E3A8A', // Navy for male
                  fontWeight: theme.typography.fontWeight.semibold
                }}
              >
                {player.gender}
              </span>
              <span>Secondary {player.year}</span>
              <span
                style={{
                  fontWeight: theme.typography.fontWeight.bold
                }}
              >
                ELO {player.elo}
              </span>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.sm
          }}
        >
          <SkillBar label="Forehand" value={player.skills.forehand} />
          <SkillBar label="Backhand" value={player.skills.backhand} />
          <SkillBar label="Footwork" value={player.skills.footwork} />
          <SkillBar label="Serve" value={player.skills.serve} />
          <SkillBar label="Receive" value={player.skills.receive} />
          <SkillBar label="Spin" value={player.skills.spin} />
          <SkillBar label="Placement" value={player.skills.placement} />
          <SkillBar label="Consistency" value={player.skills.consistency} />
        </div>

        {/* Equipment and Style */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.xs,
            marginTop: theme.spacing.sm,
            paddingTop: theme.spacing.sm,
            borderTop: `1px solid ${theme.colors.neutral.gray300}`
          }}
        >
          <div
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary
            }}
          >
            <strong style={{ color: theme.colors.text.primary }}>Style:</strong>{' '}
            {player.playStyle}
          </div>
          <div
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary
            }}
          >
            <strong style={{ color: theme.colors.text.primary }}>Equipment:</strong>{' '}
            {player.gripStyle} • {player.forehandRubber} / {player.backhandRubber}
          </div>
          <div
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary
            }}
          >
            <strong style={{ color: theme.colors.text.primary }}>Tendency:</strong>{' '}
            {player.forehandBackhandTendency} • {player.handedness} handed
          </div>
        </div>

        {/* Action Button */}
        {actionButton && (
          <div
            style={{
              marginTop: theme.spacing.md,
              paddingTop: theme.spacing.md,
              borderTop: `1px solid ${theme.colors.neutral.gray300}`
            }}
          >
            {actionButton}
          </div>
        )}
      </div>
    </GameCard>
  )
}

interface SkillBarProps {
  label: string
  value: number
}

const SkillBar: React.FC<SkillBarProps> = ({ label, value }) => {
  const percentage = Math.min(100, Math.max(0, value))
  const color =
    percentage >= 80
      ? theme.colors.success.main
      : percentage >= 60
        ? theme.colors.primary.main
        : percentage >= 40
          ? theme.colors.warning.main
          : theme.colors.error.main

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xs
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: theme.typography.fontSize.sm
        }}
      >
        <span style={{ color: theme.colors.text.secondary }}>{label}</span>
        <span
          style={{
            color: theme.colors.text.primary,
            fontWeight: theme.typography.fontWeight.medium
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: theme.colors.neutral.gray200,
          borderRadius: theme.borderRadius.full,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: theme.borderRadius.full,
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  )
}
