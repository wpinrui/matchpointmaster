import React from 'react'
import { Player, Gender } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import GameCard from '../cards/GameCard'
import { getPlayerFullName } from '../../utils/playerGeneration'
import { getStatColor } from '../../utils/managerStats'
import {
  calculateOverallRating,
  getCardTier,
  getCardTierStyle
} from '../../utils/cardTiers'
import {
  StyledFlex,
  StyledGrid,
  StyledHeading,
  StyledText,
  StyledRatingBadge,
  StyledRatingBadgeText,
  StyledSkillBarContainer,
  StyledSkillBarLabel,
  StyledSkillBarTrack,
  StyledSkillBarFill
} from '../../styles'

interface PlayerCardProps {
  player: Player
  actionButton?: React.ReactNode
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, actionButton }) => {
  const fullName = getPlayerFullName(player)

  // Calculate overall rating
  const overall = calculateOverallRating(player.skills)
  const tier = getCardTier(overall)
  const tierStyle = getCardTierStyle(tier)

  return (
    <div style={{ position: 'relative' }}>
      {/* Overall Rating Badge - Top Left (FIFA style) */}
      <StyledRatingBadge
        bgColor={tierStyle.overallBg}
        borderColor={tierStyle.borderColor}
        textColor={tierStyle.overallText}
      >
        <StyledRatingBadgeText textColor={tierStyle.overallText}>
          {overall}
        </StyledRatingBadgeText>
      </StyledRatingBadge>

      <GameCard
        style={{
          background: theme.gradients.nestedCard,
          paddingTop: theme.spacing['2xl']
        }}
      >
        <StyledFlex direction="column" gap="md" style={{ width: '100%' }}>
          {/* Header with avatar and basic info */}
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
              <StyledHeading size="h6" margin={`0 0 ${theme.spacing.xs} 0`}>
                {fullName}
              </StyledHeading>
              <StyledFlex
                direction="column"
                style={{ fontSize: theme.typography.fontSize.sm, lineHeight: 1.3 }}
              >
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

          {/* Skills Grid */}
          <StyledGrid columns={2} gap="sm" style={{ marginTop: theme.spacing.sm }}>
            <SkillBar label="Forehand" value={player.skills.forehand} />
            <SkillBar label="Backhand" value={player.skills.backhand} />
            <SkillBar label="Footwork" value={player.skills.footwork} />
            <SkillBar label="Serve" value={player.skills.serve} />
            <SkillBar label="Receive" value={player.skills.receive} />
            <SkillBar label="Spin" value={player.skills.spin} />
            <SkillBar label="Placement" value={player.skills.placement} />
            <SkillBar label="Consistency" value={player.skills.consistency} />
          </StyledGrid>

          {/* Equipment and Style */}
          <StyledFlex
            direction="column"
            gap="xs"
            style={{
              marginTop: theme.spacing.sm,
              paddingTop: theme.spacing.sm,
              borderTop: `${theme.borderWidth.default} solid ${theme.colors.border.default}`
            }}
          >
            <StyledText size="sm" color="secondary">
              <strong style={{ color: theme.colors.text.primary }}>Style:</strong>{' '}
              {player.playStyle}
            </StyledText>
            <StyledText size="sm" color="secondary">
              <strong style={{ color: theme.colors.text.primary }}>Equipment:</strong>{' '}
              {player.gripStyle} • {player.forehandRubber} / {player.backhandRubber}
            </StyledText>
            <StyledText size="sm" color="secondary">
              <strong style={{ color: theme.colors.text.primary }}>Tendency:</strong>{' '}
              {player.forehandBackhandTendency} • {player.handedness} handed
            </StyledText>
          </StyledFlex>

          {/* Action Button */}
          {actionButton && (
            <div
              style={{
                marginTop: theme.spacing.md,
                paddingTop: theme.spacing.md,
                borderTop: `${theme.borderWidth.default} solid ${theme.colors.border.default}`
              }}
            >
              {actionButton}
            </div>
          )}
        </StyledFlex>
      </GameCard>
    </div>
  )
}

interface SkillBarProps {
  label: string
  value: number
}

const SkillBar: React.FC<SkillBarProps> = ({ label, value }) => {
  const percentage = Math.min(100, Math.max(0, value))
  // Use linear gradient color formula from dark red to dark green
  const color = getStatColor(percentage)

  return (
    <StyledSkillBarContainer>
      <StyledSkillBarLabel>
        <StyledText size="sm" color="secondary">
          {label}
        </StyledText>
        <StyledText size="sm" weight="medium" color="primary">
          {Math.floor(value)}
        </StyledText>
      </StyledSkillBarLabel>
      <StyledSkillBarTrack>
        <StyledSkillBarFill percentage={percentage} color={color} />
      </StyledSkillBarTrack>
    </StyledSkillBarContainer>
  )
}
