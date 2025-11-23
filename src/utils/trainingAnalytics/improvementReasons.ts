import {
  Player,
  PlayerSkills,
  PlayerTrait,
  PlayStyle,
  TrainingFocus
} from '../../services/savegame/types'
import {
  calculateStyleSynergy,
  calculateTraitMultiplier,
  calculatePeerInfluence,
  calculateDiminishingReturns
} from '../playerProgression'
import { getSkillsForFocus } from './constants'

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
 * Analyze reasons for high improvement
 */
export function analyzeHighImprovementReasons(
  player: Player,
  skill: keyof PlayerSkills,
  improvement: number,
  styleSynergy: number,
  traitMultiplier: number,
  peerInfluence: number,
  diminishingReturns: number,
  facilitiesMultiplier: number,
  coachingMultiplier: number,
  trainingFocus: TrainingFocus | null,
  isIndividualCoaching: boolean,
  reasons: string[]
): void {
  if (styleSynergy >= 1.2) {
    reasons.push(
      `Excellent style synergy with coach (${(styleSynergy * 100).toFixed(0)}%)`
    )
  }
  if (traitMultiplier >= 1.2) {
    const goodTraits = player.traits.filter((t) =>
      [PlayerTrait.HARD_WORKER, PlayerTrait.QUICK_LEARNER, PlayerTrait.PRODIGY].includes(
        t
      )
    )
    if (goodTraits.length > 0) {
      reasons.push(
        `Strong work ethic from traits: ${goodTraits.map((t) => t.replace('_', ' ')).join(', ')}`
      )
    }
  }
  if (isIndividualCoaching) {
    reasons.push('Received individual coaching attention')
  }
  if (peerInfluence >= 1.03) {
    reasons.push('Benefited from strong teammates as training partners')
  }
  if (diminishingReturns >= 0.8) {
    reasons.push('Skill level allowed for rapid improvement')
  }
  if (facilitiesMultiplier >= 1.1) {
    reasons.push('Well-funded school facilities enhanced training')
  }
  if (coachingMultiplier >= 0.8) {
    reasons.push('Strong coaching guidance helped development')
  }
  // Check if skill is targeted by training focus
  if (trainingFocus) {
    const targetedSkills = getSkillsForFocus(trainingFocus)
    if (targetedSkills.includes(skill)) {
      reasons.push(`Focused training matched this skill area`)
    }
  }
}

/**
 * Analyze reasons for low improvement
 */
export function analyzeLowImprovementReasons(
  player: Player,
  skill: keyof PlayerSkills,
  styleSynergy: number,
  traitMultiplier: number,
  diminishingReturns: number,
  facilitiesMultiplier: number,
  coachingMultiplier: number,
  trainingFocus: TrainingFocus | null,
  isIndividualCoaching: boolean,
  reasons: string[]
): void {
  if (styleSynergy <= 0.9) {
    if (styleSynergy <= 0.8) {
      reasons.push(
        `Poor style compatibility with coach (${(styleSynergy * 100).toFixed(0)}%)`
      )
    } else {
      reasons.push(`Moderate style mismatch limited improvement`)
    }
  }
  if (traitMultiplier <= 0.9) {
    const badTraits = player.traits.filter((t) => [PlayerTrait.LAZY].includes(t))
    if (badTraits.length > 0) {
      reasons.push(
        `Struggled due to trait: ${badTraits.map((t) => t.replace('_', ' ')).join(', ')}`
      )
    }
  }
  if (!isIndividualCoaching) {
    reasons.push('Lacked individual coaching focus')
  }
  if (diminishingReturns <= 0.5) {
    reasons.push('Skill level is high - improvement slowed by diminishing returns')
  }
  if (facilitiesMultiplier <= 0.9) {
    reasons.push('Limited school facilities hindered training quality')
  }
  if (coachingMultiplier <= 0.65) {
    reasons.push('Coaching effectiveness could be improved')
  }
  // Check if skill is NOT targeted by training focus
  if (trainingFocus) {
    const targetedSkills = getSkillsForFocus(trainingFocus)
    if (!targetedSkills.includes(skill)) {
      reasons.push(`Training focused on different skills`)
    }
  }
}

