import React from 'react'
import { Player, FavourStyle, PlayStyle } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import { StyledFlex, StyledLabel, StyledSelect, StyledText } from '../../styles'

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
    <StyledFlex
      direction="column"
      gap="sm"
      style={{
        marginTop: theme.spacing.sm,
        paddingTop: theme.spacing.sm,
        borderTop: `${theme.borderWidth.default} solid ${theme.colors.border.default}`
      }}
    >
      <StyledFlex direction="column" gap="xs">
        <StyledLabel>Forehand/Backhand Tendency:</StyledLabel>
        <StyledSelect
          value={player.forehandBackhandTendency}
          onChange={(e) => onTendencyChange(e.target.value as FavourStyle)}
        >
          {Object.values(FavourStyle).map((tendency) => (
            <option key={tendency} value={tendency}>
              {tendency}
            </option>
          ))}
        </StyledSelect>
      </StyledFlex>

      <StyledFlex direction="column" gap="xs">
        <StyledLabel>Play Style:</StyledLabel>
        <StyledSelect
          value={player.playStyle}
          onChange={(e) => onPlayStyleChange(e.target.value as PlayStyle)}
        >
          {Object.values(PlayStyle).map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </StyledSelect>
      </StyledFlex>

      <StyledText size="sm" color="secondary">
        <strong style={{ color: theme.colors.text.primary }}>Equipment:</strong>{' '}
        {player.gripStyle} • {player.forehandRubber} / {player.backhandRubber}
      </StyledText>
      <StyledText size="sm" color="secondary">
        <strong style={{ color: theme.colors.text.primary }}>Handedness:</strong>{' '}
        {player.handedness} handed
      </StyledText>
    </StyledFlex>
  )
}
