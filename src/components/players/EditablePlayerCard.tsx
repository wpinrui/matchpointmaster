import React from 'react'
import {
  Player,
  Gender,
  FavourStyle,
  PlayStyle,
  PlayerSkills
} from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import GameCard from '../cards/GameCard'
import { getPlayerFullName } from '../../utils/playerGeneration'
import { getStatColor } from '../../utils/managerStats'
import {
  calculateOverallRating,
  getCardTier,
  getCardTierStyle
} from '../../utils/cardTiers'

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
      {/* Overall Rating Badge - Top Left (FIFA style) */}
      <div
        style={{
          position: 'absolute',
          top: theme.spacing.sm,
          left: theme.spacing.sm,
          width: '50px',
          height: '50px',
          background: tierStyle.overallBg,
          borderRadius: theme.borderRadius.md,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          border: `2px solid ${tierStyle.borderColor}`,
          boxShadow: `0 2px 8px rgba(0, 0, 0, 0.5)`
        }}
      >
        <span
          style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.extrabold,
            color: tierStyle.overallText,
            fontFamily: theme.typography.fontFamily.heading,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}
        >
          {overall}
        </span>
      </div>

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

          {/* Skills Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: theme.spacing.sm,
              marginTop: theme.spacing.sm
            }}
          >
            <EditableSkillBar
              label="Forehand"
              value={player.skills.forehand}
              onChange={(value) => updateSkill('forehand', value)}
            />
            <EditableSkillBar
              label="Backhand"
              value={player.skills.backhand}
              onChange={(value) => updateSkill('backhand', value)}
            />
            <EditableSkillBar
              label="Footwork"
              value={player.skills.footwork}
              onChange={(value) => updateSkill('footwork', value)}
            />
            <EditableSkillBar
              label="Serve"
              value={player.skills.serve}
              onChange={(value) => updateSkill('serve', value)}
            />
            <EditableSkillBar
              label="Receive"
              value={player.skills.receive}
              onChange={(value) => updateSkill('receive', value)}
            />
            <EditableSkillBar
              label="Spin"
              value={player.skills.spin}
              onChange={(value) => updateSkill('spin', value)}
            />
            <EditableSkillBar
              label="Placement"
              value={player.skills.placement}
              onChange={(value) => updateSkill('placement', value)}
            />
            <EditableSkillBar
              label="Consistency"
              value={player.skills.consistency}
              onChange={(value) => updateSkill('consistency', value)}
            />
          </div>

          {/* Tendencies and Style */}
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
                onChange={(e) => updateTendency(e.target.value as FavourStyle)}
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
                onChange={(e) => updatePlayStyle(e.target.value as PlayStyle)}
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
        </div>
      </GameCard>
    </div>
  )
}

interface EditableSkillBarProps {
  label: string
  value: number
  onChange: (value: number) => void
}

const EditableSkillBar: React.FC<EditableSkillBarProps> = ({
  label,
  value,
  onChange
}) => {
  const percentage = Math.min(100, Math.max(0, value))
  const color = getStatColor(percentage)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue)) {
      onChange(Math.max(0, Math.min(100, newValue)))
    }
  }

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
          alignItems: 'center',
          fontSize: theme.typography.fontSize.sm
        }}
      >
        <span style={{ color: theme.colors.text.secondary }}>{label}</span>
        <input
          type="number"
          min="0"
          max="100"
          value={Math.round(value)}
          onChange={handleInputChange}
          style={{
            width: '50px',
            padding: `${theme.spacing.xs} ${theme.spacing.xs}`,
            borderRadius: theme.borderRadius.sm,
            border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
            background: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.sm,
            textAlign: 'center',
            fontWeight: theme.typography.fontWeight.medium
          }}
        />
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={handleSliderChange}
        style={{
          width: '100%',
          height: '8px',
          borderRadius: theme.borderRadius.full,
          background: theme.colors.border.dark,
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
          appearance: 'none'
        }}
      />
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: theme.colors.border.dark,
          borderRadius: theme.borderRadius.full,
          overflow: 'hidden',
          marginTop: '-12px',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: theme.borderRadius.full,
            transition: 'width 0.1s ease'
          }}
        />
      </div>
    </div>
  )
}
