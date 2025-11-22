/**
 * Player progression utilities
 * Calculates skill improvements based on training, traits, coaching, etc.
 */
import {
  Player,
  PlayerSkills,
  TrainingFocus,
  PlayerTraining,
  PlayerTrait,
  PlayStyle,
  ManagerStats
} from '../services/savegame/types'

/**
 * Style synergy groups - similar play styles
 */
const styleGroups: Record<PlayStyle, PlayStyle[]> = {
  [PlayStyle.FOREHAND_ATTACKER]: [
    PlayStyle.BACKHAND_SMASHER,
    PlayStyle.AGGRESSIVE_PUSHER
  ],
  [PlayStyle.BACKHAND_SMASHER]: [
    PlayStyle.FOREHAND_ATTACKER,
    PlayStyle.AGGRESSIVE_PUSHER
  ],
  [PlayStyle.AGGRESSIVE_PUSHER]: [
    PlayStyle.FOREHAND_ATTACKER,
    PlayStyle.BACKHAND_SMASHER
  ],
  [PlayStyle.CHOPPER]: [PlayStyle.DEFENSIVE_SPECIALIST, PlayStyle.COUNTER_DRIVER],
  [PlayStyle.DEFENSIVE_SPECIALIST]: [PlayStyle.CHOPPER, PlayStyle.COUNTER_DRIVER],
  [PlayStyle.COUNTER_DRIVER]: [PlayStyle.CHOPPER, PlayStyle.DEFENSIVE_SPECIALIST],
  [PlayStyle.PLACEMENT_STRATEGIST]: [PlayStyle.ALL_ROUNDER, PlayStyle.VARIED_PLAYER],
  [PlayStyle.ALL_ROUNDER]: [PlayStyle.PLACEMENT_STRATEGIST, PlayStyle.VARIED_PLAYER],
  [PlayStyle.VARIED_PLAYER]: [PlayStyle.ALL_ROUNDER, PlayStyle.PLACEMENT_STRATEGIST],
  [PlayStyle.SPIN_MANIPULATOR]: [PlayStyle.VARIED_PLAYER],
  [PlayStyle.LOBBER]: [PlayStyle.DEFENSIVE_SPECIALIST],
  [PlayStyle.NET_PLAYER]: [PlayStyle.AGGRESSIVE_PUSHER]
}

/**
 * Opposite play styles - poor synergy
 */
const oppositeStyles: Record<PlayStyle, PlayStyle[]> = {
  [PlayStyle.FOREHAND_ATTACKER]: [PlayStyle.CHOPPER, PlayStyle.DEFENSIVE_SPECIALIST],
  [PlayStyle.BACKHAND_SMASHER]: [PlayStyle.CHOPPER, PlayStyle.DEFENSIVE_SPECIALIST],
  [PlayStyle.AGGRESSIVE_PUSHER]: [PlayStyle.CHOPPER, PlayStyle.DEFENSIVE_SPECIALIST],
  [PlayStyle.CHOPPER]: [
    PlayStyle.FOREHAND_ATTACKER,
    PlayStyle.BACKHAND_SMASHER,
    PlayStyle.AGGRESSIVE_PUSHER
  ],
  [PlayStyle.DEFENSIVE_SPECIALIST]: [
    PlayStyle.FOREHAND_ATTACKER,
    PlayStyle.BACKHAND_SMASHER,
    PlayStyle.AGGRESSIVE_PUSHER
  ],
  [PlayStyle.COUNTER_DRIVER]: [PlayStyle.AGGRESSIVE_PUSHER],
  [PlayStyle.PLACEMENT_STRATEGIST]: [],
  [PlayStyle.ALL_ROUNDER]: [],
  [PlayStyle.VARIED_PLAYER]: [],
  [PlayStyle.SPIN_MANIPULATOR]: [],
  [PlayStyle.LOBBER]: [],
  [PlayStyle.NET_PLAYER]: []
}

/**
 * Calculate style synergy multiplier between manager and player
 * Returns multiplier between 0.75 (opposite) and 1.3 (exact match)
 */
export function calculateStyleSynergy(
  managerPlayStyle: PlayStyle,
  playerPlayStyle: PlayStyle
): number {
  // Exact match
  if (managerPlayStyle === playerPlayStyle) {
    return 1.3
  }

  // Similar styles (same group)
  if (styleGroups[managerPlayStyle]?.includes(playerPlayStyle)) {
    return 1.1 // Moderate bonus for similar styles
  }

  // Opposite styles
  if (oppositeStyles[managerPlayStyle]?.includes(playerPlayStyle)) {
    return 0.75 // Penalty for opposite styles
  }

  // Neutral - no synergy bonus or penalty
  return 1.0
}

/**
 * Calculate trait multiplier for training effectiveness
 */
export function calculateTraitMultiplier(traits: PlayerTrait[]): number {
  let multiplier = 1.0

  traits.forEach((trait) => {
    switch (trait) {
      case PlayerTrait.HARD_WORKER:
        multiplier += 0.15 // +15% training effectiveness
        break
      case PlayerTrait.NATURAL_TALENT:
        multiplier += 0.1 // +10% but may have consistency issues
        break
      case PlayerTrait.QUICK_LEARNER:
        multiplier += 0.2 // +20% faster improvement
        break
      case PlayerTrait.PRODIGY:
        multiplier += 0.3 // +30% exceptional talent
        break
      case PlayerTrait.LAZY:
        multiplier -= 0.15 // -15% training effectiveness
        break
      case PlayerTrait.INJURY_PRONE:
        multiplier -= 0.05 // -5% occasional missed training
        break
      // Other traits like UNDERDOG, RESILIENT, VULNERABLE affect performance more than training
      // so they don't directly modify training effectiveness
      default:
        break
    }
  })

  // Clamp between 0.5 and 2.0
  return Math.max(0.5, Math.min(2.0, multiplier))
}

/**
 * Calculate peer influence multiplier
 * If teammates are better, weaker players get a small bonus (up to *1.05)
 */
export function calculatePeerInfluence(player: Player, teammates: Player[]): number {
  if (teammates.length === 0) return 1.0

  // Calculate average skill of player
  const playerAvgSkill =
    (player.skills.forehand +
      player.skills.backhand +
      player.skills.footwork +
      player.skills.serve +
      player.skills.receive +
      player.skills.spin +
      player.skills.placement +
      player.skills.consistency) /
    8

  // Calculate average skill of teammates
  const teammateAvgSkill =
    teammates.reduce((sum, teammate) => {
      const teammateAvg =
        (teammate.skills.forehand +
          teammate.skills.backhand +
          teammate.skills.footwork +
          teammate.skills.serve +
          teammate.skills.receive +
          teammate.skills.spin +
          teammate.skills.placement +
          teammate.skills.consistency) /
        8
      return sum + teammateAvg
    }, 0) / teammates.length

  // If teammates are better, give bonus (minor effect)
  if (teammateAvgSkill > playerAvgSkill) {
    const skillGap = teammateAvgSkill - playerAvgSkill
    // Max bonus of 1.05 (5%) when gap is large
    // Scale linearly from 0 to 30 skill points
    const bonusMultiplier = 1.0 + Math.min(0.05, (skillGap / 30) * 0.05)
    return bonusMultiplier
  }

  return 1.0 // No bonus if player is better or equal
}

/**
 * Calculate diminishing returns multiplier
 * Skills are harder to improve when they're higher
 */
export function calculateDiminishingReturns(currentSkill: number): number {
  // Linear diminishing returns: 100% efficiency at 0, 30% efficiency at 100
  // Formula: 1.0 - (currentSkill / 100) * 0.7
  const efficiency = 1.0 - (currentSkill / 100) * 0.7
  return Math.max(0.3, efficiency) // Minimum 30% efficiency even at 100
}

/**
 * Convert funding rank to facilities multiplier
 * Lower funding rank = better funding = better facilities
 */
export function fundingToFacilitiesMultiplier(funding: number): number {
  // Funding is rank (lower is better)
  // Best funding (rank 1) = 1.2 multiplier
  // Worst funding (rank 100) = 0.8 multiplier
  // Scale linearly
  const normalized = (funding - 1) / 99 // 0 to 1
  return 1.2 - normalized * 0.4 // 1.2 to 0.8
}

/**
 * Get skill keys that are affected by a training focus
 */
function getSkillsForFocus(focus: TrainingFocus): (keyof PlayerSkills)[] {
  switch (focus) {
    case TrainingFocus.FOREHAND:
      return ['forehand']
    case TrainingFocus.BACKHAND:
      return ['backhand']
    case TrainingFocus.FOOTWORK:
      return ['footwork']
    case TrainingFocus.SERVE:
      return ['serve']
    case TrainingFocus.RECEIVE:
      return ['receive']
    case TrainingFocus.SPIN:
      return ['spin']
    case TrainingFocus.PLACEMENT:
      return ['placement']
    case TrainingFocus.CONSISTENCY:
      return ['consistency']
    case TrainingFocus.MATCH_PLAY:
      // Balanced improvement across all skills
      return [
        'forehand',
        'backhand',
        'footwork',
        'serve',
        'receive',
        'spin',
        'placement',
        'consistency'
      ]
    case TrainingFocus.FUNDAMENTALS:
      // Focus on weakest skills
      return [
        'forehand',
        'backhand',
        'footwork',
        'serve',
        'receive',
        'spin',
        'placement',
        'consistency'
      ]
    case TrainingFocus.TOURNAMENT_PREP:
      // Balanced, slight focus on key skills
      return [
        'forehand',
        'backhand',
        'footwork',
        'serve',
        'receive',
        'spin',
        'placement',
        'consistency'
      ]
    default:
      return []
  }
}

/**
 * Calculate base skill improvement for a skill
 * Base improvement per month of training
 */
function calculateBaseImprovement(
  skill: keyof PlayerSkills,
  focus: TrainingFocus | null,
  isIndividualCoaching: boolean
): number {
  if (!focus) return 0 // No training focus = no improvement

  const skillsForFocus = getSkillsForFocus(focus)

  // Check if this skill is targeted by the focus
  const isTargeted = skillsForFocus.includes(skill)

  if (!isTargeted) {
    // If not targeted, small improvement (0.2 per month)
    return isIndividualCoaching ? 0.3 : 0.2
  }

  // Base improvement for targeted skill
  let base = 2.0 // Base improvement per month

  // Individual coaching gives bonus
  if (isIndividualCoaching) {
    base *= 1.5 // 50% bonus for individual coaching
  }

  // Special handling for composite focuses
  if (focus === TrainingFocus.FUNDAMENTALS) {
    // Fundamentals focuses on weakest areas - less overall improvement
    base *= 1.2 // Slight bonus
  } else if (
    focus === TrainingFocus.MATCH_PLAY ||
    focus === TrainingFocus.TOURNAMENT_PREP
  ) {
    // Match play gives balanced improvement - slightly less per skill
    base *= 0.8 // Spread across all skills
  }

  return base
}

/**
 * Calculate skill improvements for a player after training
 */
export function calculatePlayerProgression(
  player: Player,
  trainingAssignment: PlayerTraining | null,
  teamFocus: TrainingFocus | null,
  managerStats: ManagerStats,
  managerPlayStyle: PlayStyle,
  funding: number,
  teammates: Player[]
): Partial<PlayerSkills> {
  const improvements: Partial<PlayerSkills> = {}

  // Determine training focus (individual takes priority)
  const focus = trainingAssignment?.focus || teamFocus
  if (!focus) return improvements // No training = no improvement

  const isIndividualCoaching = trainingAssignment?.isIndividualCoaching || false

  // Calculate multipliers
  const styleSynergy = calculateStyleSynergy(managerPlayStyle, player.playStyle)
  const traitMultiplier = calculateTraitMultiplier(player.traits)
  const peerInfluence = calculatePeerInfluence(player, teammates)
  const facilitiesMultiplier = fundingToFacilitiesMultiplier(funding)

  // Coaching effectiveness multiplier (0-100 -> 0.5-1.5)
  const coachingMultiplier = 0.5 + (managerStats.coachingEffectiveness / 100) * 1.0

  // Random variance: ±10%
  const randomVariance = 0.9 + Math.random() * 0.2 // 0.9 to 1.1

  // Calculate improvement for each skill
  const skillKeys: (keyof PlayerSkills)[] = [
    'forehand',
    'backhand',
    'footwork',
    'serve',
    'receive',
    'spin',
    'placement',
    'consistency'
  ]

  skillKeys.forEach((skill) => {
    const currentSkill = player.skills[skill]
    const baseImprovement = calculateBaseImprovement(skill, focus, isIndividualCoaching)

    if (baseImprovement <= 0) {
      improvements[skill] = 0
      return
    }

    // Apply diminishing returns
    const diminishingReturnsMultiplier = calculateDiminishingReturns(currentSkill)

    // Calculate total improvement
    let totalImprovement =
      baseImprovement *
      diminishingReturnsMultiplier *
      styleSynergy *
      traitMultiplier *
      peerInfluence *
      facilitiesMultiplier *
      coachingMultiplier *
      randomVariance

    // For FUNDAMENTALS focus, boost improvement for weakest skills
    if (focus === TrainingFocus.FUNDAMENTALS) {
      // Find average skill level
      const avgSkill =
        skillKeys.reduce((sum, key) => sum + player.skills[key], 0) / skillKeys.length
      // If this skill is below average, boost improvement
      if (currentSkill < avgSkill) {
        const gap = avgSkill - currentSkill
        totalImprovement *= 1.0 + (gap / 100) * 0.5 // Up to 50% bonus for very weak skills
      }
    }

    // Clamp improvement (can't go above 100, can't be negative)
    const newSkill = Math.min(100, Math.max(0, currentSkill + totalImprovement))
    improvements[skill] = newSkill - currentSkill // Return the delta
  })

  return improvements
}

/**
 * Apply skill improvements to a player
 */
export function applySkillImprovements(
  player: Player,
  improvements: Partial<PlayerSkills>
): Player {
  const newSkills: PlayerSkills = { ...player.skills }

  Object.keys(improvements).forEach((key) => {
    const skillKey = key as keyof PlayerSkills
    const improvement = improvements[skillKey]
    if (improvement !== undefined) {
      newSkills[skillKey] = Math.min(
        100,
        Math.max(0, player.skills[skillKey] + improvement)
      )
    }
  })

  return {
    ...player,
    skills: newSkills
  }
}
