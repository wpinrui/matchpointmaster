import React from 'react'
import {
  Player,
  FavourStyle,
  PlayStyle,
  PlayerSkills
} from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import GameCard from '../cards/GameCard'
import { getPlayerFullName } from '../../utils/playerGeneration'
import {
  calculateOverallRating,
  getCardTier,
  getCardTierStyle
} from '../../utils/cardTiers'
import { OverallRatingBadge } from './OverallRatingBadge'
import { PlayerHeader } from './PlayerHeader'
import { SkillsGrid } from './SkillsGrid'
import { PlayerAttributesSection } from './PlayerAttributesSection'

interface EditablePlayerCardProps {
  player: Player
  onPlayerChange: (updatedPlayer: Player) => void
}

export const EditablePlayerCard: React.FC<EditablePlayerCardProps> = ({
  player,
  onPlayerChange
}) => {
  const fullName = getPlayerFullName(player)

  // Calculate overall rating
  const overall = calculateOverallRating(player.skills)
  const tier = getCardTier(overall)
  const tierStyle = getCardTierStyle(tier)

  const updateSkill = (skillName: keyof PlayerSkills, value: number) => {
    const newSkills = {
      ...player.skills,
      [skillName]: Math.max(0, Math.min(100, value))
    }
    onPlayerChange({
      ...player,
      skills: newSkills
    })
  }

  const updateTendency = (tendency: FavourStyle) => {
    onPlayerChange({
      ...player,
      forehandBackhandTendency: tendency
    })
  }

  const updatePlayStyle = (style: PlayStyle) => {
    onPlayerChange({
      ...player,
      playStyle: style
    })
  }

  return (
    <div style={{ position: 'relative' }}>
      <OverallRatingBadge overall={overall} tierStyle={tierStyle} />

      <GameCard
        style={{
          background: theme.gradients.nestedCard,
          paddingTop: theme.spacing['2xl']
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.md,
            width: '100%'
          }}
        >
          <PlayerHeader player={player} fullName={fullName} />

          <SkillsGrid skills={player.skills} onSkillChange={updateSkill} />

          <PlayerAttributesSection
            player={player}
            onTendencyChange={updateTendency}
            onPlayStyleChange={updatePlayStyle}
          />
        </div>
      </GameCard>
    </div>
  )
}
