import React from 'react'
import { Player, FavourStyle, PlayStyle } from '../../services/savegame/types'
import { theme } from '../../theme/theme'

interface PlayerAttributesSectionProps {
  player: Player
  onTendencyChange: (tendency: FavourStyle) => void
  onPlayStyleChange: (style: PlayStyle) => void
}

export const PlayerAttributesSection: React.FC<PlayerAttributesSectionProps> = ({
  player,
  onTendencyChange,
  onPlayStyleChange
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm,
        paddingTop: theme.spacing.sm,
        borderTop: `${theme.borderWidth.default} solid ${theme.colors.border.default}`
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.xs
        }}
      >
        <label
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.primary,
            fontWeight: theme.typography.fontWeight.semibold
          }}
        >
          Forehand/Backhand Tendency:
        </label>
        <select
          value={player.forehandBackhandTendency}
          onChange={(e) => onTendencyChange(e.target.value as FavourStyle)}
          style={{
            padding: theme.spacing.xs,
            borderRadius: theme.borderRadius.md,
            border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
            background: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.sm,
            cursor: 'pointer'
          }}
        >
          {Object.values(FavourStyle).map((tendency) => (
            <option key={tendency} value={tendency}>
              {tendency}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.xs
        }}
      >
        <label
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.primary,
            fontWeight: theme.typography.fontWeight.semibold
          }}
        >
          Play Style:
        </label>
        <select
          value={player.playStyle}
          onChange={(e) => onPlayStyleChange(e.target.value as PlayStyle)}
          style={{
            padding: theme.spacing.xs,
            borderRadius: theme.borderRadius.md,
            border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
            background: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.sm,
            cursor: 'pointer'
          }}
        >
          {Object.values(PlayStyle).map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
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
        <strong style={{ color: theme.colors.text.primary }}>Handedness:</strong>{' '}
        {player.handedness} handed
      </div>
    </div>
  )
}
