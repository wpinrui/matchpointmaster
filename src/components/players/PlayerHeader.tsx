import React from 'react'
import { Player, Gender } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import { getPlayerFullName } from '../../utils/playerGeneration'

interface PlayerHeaderProps {
  player: Player
  fullName: string
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({ player, fullName }) => {
  return (
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
            border: `${theme.borderWidth.default} solid ${theme.colors.secondary.light}`,
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
            lineHeight: 1.3
          }}
        >
          <span
            style={{
              color:
                player.gender === Gender.FEMALE
                  ? theme.colors.gender.female
                  : theme.colors.gender.male,
              fontWeight: theme.typography.fontWeight.semibold
            }}
          >
            {player.gender}
          </span>
          <span>Secondary {player.year}</span>
        </div>
      </div>
    </div>
  )
}
