/**
 * Card tier system for players (FIFA Ultimate Team style)
 * Based on overall rating
 */

export enum CardTier {
  GREY = 'grey', // Normal
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  DIAMOND = 'diamond'
}

export interface CardTierStyle {
  tier: CardTier
  name: string
  backgroundColor: string
  borderColor: string
  overallBg: string
  overallText: string
  gradient: string
  glowColor?: string
}

/**
 * Calculate overall rating from player skills
 */
export function calculateOverallRating(skills: {
  forehand: number
  backhand: number
  footwork: number
  serve: number
  receive: number
  spin: number
  placement: number
  consistency: number
}): number {
  return Math.round(
    (skills.forehand +
      skills.backhand +
      skills.footwork +
      skills.serve +
      skills.receive +
      skills.spin +
      skills.placement +
      skills.consistency) /
      8
  )
}

/**
 * Determine card tier based on overall rating
 */
export function getCardTier(overall: number): CardTier {
  if (overall >= 85) return CardTier.DIAMOND
  if (overall >= 75) return CardTier.GOLD
  if (overall >= 65) return CardTier.SILVER
  if (overall >= 50) return CardTier.BRONZE
  return CardTier.GREY
}

/**
 * Get styling for a card tier
 */
export function getCardTierStyle(tier: CardTier): CardTierStyle {
  switch (tier) {
    case CardTier.DIAMOND:
      return {
        tier: CardTier.DIAMOND,
        name: 'Diamond',
        backgroundColor: '#1a1a2e',
        borderColor: '#00d4ff',
        overallBg: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
        overallText: '#ffffff',
        gradient: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 153, 204, 0.2) 100%)',
        glowColor: 'rgba(0, 212, 255, 0.5)'
      }
    case CardTier.GOLD:
      return {
        tier: CardTier.GOLD,
        name: 'Gold',
        backgroundColor: '#2a1f0f',
        borderColor: '#ffd700',
        overallBg: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
        overallText: '#000000',
        gradient: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 179, 0, 0.2) 100%)',
        glowColor: 'rgba(255, 215, 0, 0.4)'
      }
    case CardTier.SILVER:
      return {
        tier: CardTier.SILVER,
        name: 'Silver',
        backgroundColor: '#2a2a2a',
        borderColor: '#c0c0c0',
        overallBg: 'linear-gradient(135deg, #e8e8e8 0%, #c0c0c0 100%)',
        overallText: '#000000',
        gradient: 'linear-gradient(135deg, rgba(200, 200, 200, 0.1) 0%, rgba(160, 160, 160, 0.2) 100%)',
        glowColor: 'rgba(192, 192, 192, 0.3)'
      }
    case CardTier.BRONZE:
      return {
        tier: CardTier.BRONZE,
        name: 'Bronze',
        backgroundColor: '#2a1f0f',
        borderColor: '#cd7f32',
        overallBg: 'linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)',
        overallText: '#ffffff',
        gradient: 'linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(160, 82, 45, 0.2) 100%)',
        glowColor: 'rgba(205, 127, 50, 0.3)'
      }
    case CardTier.GREY:
    default:
      return {
        tier: CardTier.GREY,
        name: 'Normal',
        backgroundColor: '#1a1a1a',
        borderColor: '#666666',
        overallBg: 'linear-gradient(135deg, #888888 0%, #666666 100%)',
        overallText: '#ffffff',
        gradient: 'linear-gradient(135deg, rgba(136, 136, 136, 0.1) 0%, rgba(102, 102, 102, 0.2) 100%)',
        glowColor: 'rgba(102, 102, 102, 0.2)'
      }
  }
}

