import React from 'react'
import { Player, Gender } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import { getPlayerFullName } from '../../utils/playerGeneration'
import { StyledFlex, StyledHeading, StyledText } from '../../styles'

interface PlayerHeaderProps {
  player: Player
  fullName: string
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({ player, fullName }) => {
  return (
    <StyledFlex gap="md" align="center">
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
        <StyledHeading size="h4" margin={`0 0 ${theme.spacing.xs} 0`}>
          {fullName}
        </StyledHeading>
        <StyledFlex direction="column" style={{ lineHeight: 1.3 }}>
          <StyledText
            size="sm"
            weight="semibold"
            style={{
              color:
                player.gender === Gender.FEMALE
                  ? theme.colors.gender.female
                  : theme.colors.gender.male
            }}
          >
            {player.gender}
          </StyledText>
          <StyledText size="sm" color="secondary">
            Secondary {player.year}
          </StyledText>
        </StyledFlex>
      </div>
    </StyledFlex>
  )
}
