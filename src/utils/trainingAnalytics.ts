/**
 * Training analytics utilities
 * Analyzes player improvements and explains why they happened
 */
import {
  Player,
  PlayerSkills,
  SkillSnapshot,
  PlayerTrait,
  PlayStyle,
  TrainingFocus
} from '../services/savegame/types'
import {
  calculateStyleSynergy,
  calculateTraitMultiplier,
  calculatePeerInfluence,
  calculateDiminishingReturns
} from './playerProgression'

/**
 * Convert funding rank to facilities multiplier
 * Lower funding rank = better funding = better facilities
 */
function fundingToFacilitiesMultiplier(funding: number): number {
  // Funding is rank (lower is better)
  // Best funding (rank 1) = 1.2 multiplier
  // Worst funding (rank 100) = 0.8 multiplier
  // Scale linearly
  const normalized = (funding - 1) / 99 // 0 to 1
  return 1.2 - normalized * 0.4 // 1.2 to 0.8
}
import { calculateSkillImprovement } from './trainingInsights'

/**
 * Analytic insight explaining an improvement
 */
export type ImprovementInsight = {
  player: Player
  skill: keyof PlayerSkills
  skillLabel: string
  improvement: number
  isMax: boolean // true if this is the max improvement, false if min
  reasons: string[] // List of reasons why this improvement happened
  effectiveMultiplier: number // Effective multiplier applied (without random variance)
}

/**
 * Get year-to-date snapshots (all snapshots from training phases in current year)
 */
export function getYearToDateSnapshots(
  allSnapshots: SkillSnapshot[],
  currentYear: number,
  trainingMonths: number[] = [2, 3, 4, 5, 8, 9, 10]
): SkillSnapshot[] {
  return allSnapshots.filter(
    (s) => s.year === currentYear && trainingMonths.includes(s.month)
  )
}

/**
 * Get improvement data for a player between two skill sets
 */
function getPlayerImprovementData(
  oldSkills: PlayerSkills,
  newSkills: PlayerSkills
): Array<{
  skill: keyof PlayerSkills
  skillLabel: string
  improvement: number
  oldValue: number
  newValue: number
}> {
  const improvements = calculateSkillImprovement(oldSkills, newSkills)
  const skillLabels: Record<keyof PlayerSkills, string> = {
    forehand: 'Forehand',
    backhand: 'Backhand',
    footwork: 'Footwork',
    serve: 'Serve',
    receive: 'Receive',
    spin: 'Spin',
    placement: 'Placement',
    consistency: 'Consistency'
  }

  return Object.keys(improvements).map((key) => {
    const skillKey = key as keyof PlayerSkills
    return {
      skill: skillKey,
      skillLabel: skillLabels[skillKey],
      improvement: improvements[skillKey] || 0,
      oldValue: Math.floor(oldSkills[skillKey]),
      newValue: Math.floor(newSkills[skillKey])
    }
  })
}

/**
 * Analyze why a player had high/low improvement on a specific skill
 */
function analyzeImprovementReason(
  player: Player,
  skill: keyof PlayerSkills,
  oldSkillValue: number,
  improvement: number,
  managerPlayStyle: PlayStyle,
  coachingEffectiveness: number,
  schoolFunding: number,
  trainingFocus: TrainingFocus | null,
  isIndividualCoaching: boolean,
  teammates: Player[]
): ImprovementInsight {
  const skillLabels: Record<keyof PlayerSkills, string> = {
    forehand: 'Forehand',
    backhand: 'Backhand',
    footwork: 'Footwork',
    serve: 'Serve',
    receive: 'Receive',
    spin: 'Spin',
    placement: 'Placement',
    consistency: 'Consistency'
  }

  const reasons: string[] = []
  const isMax = improvement > 0

  // Calculate multipliers to understand the impact
  const styleSynergy = calculateStyleSynergy(managerPlayStyle, player.playStyle)
  const traitMultiplier = calculateTraitMultiplier(player.traits)
  const peerInfluence = calculatePeerInfluence(player, teammates)
  const diminishingReturns = calculateDiminishingReturns(oldSkillValue)
  const facilitiesMultiplier = fundingToFacilitiesMultiplier(schoolFunding)
  const coachingMultiplier = 0.5 + (coachingEffectiveness / 100) * 0.5 // 0.5 to 1.0

  // Analyze reasons for high improvement
  if (isMax && improvement > 3) {
    // High improvement reasons
    if (styleSynergy >= 1.2) {
      reasons.push(
        `Excellent style synergy with coach (${(styleSynergy * 100).toFixed(0)}%)`
      )
    }
    if (traitMultiplier >= 1.2) {
      const goodTraits = player.traits.filter((t) =>
        [
          PlayerTrait.HARD_WORKER,
          PlayerTrait.QUICK_LEARNER,
          PlayerTrait.PRODIGY
        ].includes(t)
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
      const getSkillsForFocus = (focus: TrainingFocus): (keyof PlayerSkills)[] => {
        const skillMap: Record<TrainingFocus, (keyof PlayerSkills)[]> = {
          [TrainingFocus.FOREHAND]: ['forehand'],
          [TrainingFocus.BACKHAND]: ['backhand'],
          [TrainingFocus.FOOTWORK]: ['footwork'],
          [TrainingFocus.SERVE]: ['serve'],
          [TrainingFocus.RECEIVE]: ['receive'],
          [TrainingFocus.SPIN]: ['spin'],
          [TrainingFocus.PLACEMENT]: ['placement'],
          [TrainingFocus.CONSISTENCY]: ['consistency'],
          [TrainingFocus.MATCH_PLAY]: [
            'forehand',
            'backhand',
            'footwork',
            'serve',
            'receive',
            'spin',
            'placement',
            'consistency'
          ],
          [TrainingFocus.FUNDAMENTALS]: [
            'forehand',
            'backhand',
            'footwork',
            'serve',
            'receive',
            'spin',
            'placement',
            'consistency'
          ],
          [TrainingFocus.TOURNAMENT_PREP]: [
            'forehand',
            'backhand',
            'footwork',
            'serve',
            'receive',
            'spin',
            'placement',
            'consistency'
          ]
        }
        return skillMap[focus] || []
      }

      const targetedSkills = getSkillsForFocus(trainingFocus)
      if (targetedSkills.includes(skill)) {
        reasons.push(`Focused training matched this skill area`)
      }
    }
  } else if (!isMax && improvement <= 1) {
    // Low improvement reasons
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
      const getSkillsForFocus = (focus: TrainingFocus): (keyof PlayerSkills)[] => {
        const skillMap: Record<TrainingFocus, (keyof PlayerSkills)[]> = {
          [TrainingFocus.FOREHAND]: ['forehand'],
          [TrainingFocus.BACKHAND]: ['backhand'],
          [TrainingFocus.FOOTWORK]: ['footwork'],
          [TrainingFocus.SERVE]: ['serve'],
          [TrainingFocus.RECEIVE]: ['receive'],
          [TrainingFocus.SPIN]: ['spin'],
          [TrainingFocus.PLACEMENT]: ['placement'],
          [TrainingFocus.CONSISTENCY]: ['consistency'],
          [TrainingFocus.MATCH_PLAY]: [
            'forehand',
            'backhand',
            'footwork',
            'serve',
            'receive',
            'spin',
            'placement',
            'consistency'
          ],
          [TrainingFocus.FUNDAMENTALS]: [
            'forehand',
            'backhand',
            'footwork',
            'serve',
            'receive',
            'spin',
            'placement',
            'consistency'
          ],
          [TrainingFocus.TOURNAMENT_PREP]: [
            'forehand',
            'backhand',
            'footwork',
            'serve',
            'receive',
            'spin',
            'placement',
            'consistency'
          ]
        }
        return skillMap[focus] || []
      }

      const targetedSkills = getSkillsForFocus(trainingFocus)
      if (!targetedSkills.includes(skill)) {
        reasons.push(`Training focused on different skills`)
      }
    }
  }

  // Default reason if no specific reasons found
  if (reasons.length === 0) {
    if (isMax) {
      reasons.push('Steady improvement through regular training')
    } else {
      reasons.push('Limited improvement this period')
    }
  }

  // Calculate effective multiplier (excluding random variance)
  const effectiveMultiplier =
    styleSynergy *
    traitMultiplier *
    peerInfluence *
    facilitiesMultiplier *
    coachingMultiplier

  return {
    player,
    skill,
    skillLabel: skillLabels[skill],
    improvement,
    isMax,
    reasons,
    effectiveMultiplier
  }
}

/**
 * Get improvement insights for all players
 * Returns up to maxInsights insights, prioritized by improvement magnitude
 */
export function getImprovementInsights(
  oldSnapshots: SkillSnapshot[],
  currentPlayers: Player[],
  managerPlayStyle: PlayStyle,
  coachingEffectiveness: number,
  schoolFunding: number,
  trainingFocus: TrainingFocus | null,
  playerTrainings: Array<{
    playerId: string
    focus: TrainingFocus | null
    isIndividualCoaching: boolean
  }>,
  maxInsights: number = 8
): ImprovementInsight[] {
  const insights: ImprovementInsight[] = []

  // Get all teammates for peer influence calculation
  const teammates = currentPlayers

  currentPlayers.forEach((player) => {
    const oldSnapshot = oldSnapshots.find((s) => s.playerId === player.id)
    if (!oldSnapshot) return

    const playerTraining = playerTrainings.find((pt) => pt.playerId === player.id)
    const isIndividualCoaching = playerTraining?.isIndividualCoaching || false

    const improvementData = getPlayerImprovementData(oldSnapshot.skills, player.skills)

    // Find max and min improvements for this player
    let maxImprovement = improvementData[0]
    let minImprovement = improvementData[0]

    improvementData.forEach((data) => {
      if (data.improvement > maxImprovement.improvement) {
        maxImprovement = data
      }
      if (data.improvement < minImprovement.improvement) {
        minImprovement = data
      }
    })

    // Analyze max improvement
    if (maxImprovement.improvement > 0) {
      const maxInsight = analyzeImprovementReason(
        player,
        maxImprovement.skill,
        maxImprovement.oldValue,
        maxImprovement.improvement,
        managerPlayStyle,
        coachingEffectiveness,
        schoolFunding,
        playerTraining?.focus || trainingFocus,
        isIndividualCoaching,
        teammates
      )
      insights.push(maxInsight)
    }

    // Analyze min improvement (only if it's significantly different from max)
    if (
      minImprovement.improvement < maxImprovement.improvement - 2 &&
      minImprovement.improvement <= 1
    ) {
      const minInsight = analyzeImprovementReason(
        player,
        minImprovement.skill,
        minImprovement.oldValue,
        minImprovement.improvement,
        managerPlayStyle,
        coachingEffectiveness,
        schoolFunding,
        playerTraining?.focus || trainingFocus,
        isIndividualCoaching,
        teammates
      )
      insights.push(minInsight)
    }
  })

  // Sort by improvement magnitude (absolute value) and take top insights
  insights.sort((a, b) => Math.abs(b.improvement) - Math.abs(a.improvement))
  return insights.slice(0, maxInsights)
}

/**
 * Get improvement chart data for players
 * Returns data formatted for bar chart display
 */
export function getImprovementChartData(
  oldSnapshots: SkillSnapshot[],
  currentPlayers: Player[]
): Array<{
  playerName: string
  playerId: string
  totalImprovement: number
  improvements: Array<{
    skill: keyof PlayerSkills
    skillLabel: string
    improvement: number
  }>
}> {
  return currentPlayers
    .map((player) => {
      const oldSnapshot = oldSnapshots.find((s) => s.playerId === player.id)
      if (!oldSnapshot) return null

      const improvements = calculateSkillImprovement(oldSnapshot.skills, player.skills)
      const skillLabels: Record<keyof PlayerSkills, string> = {
        forehand: 'Forehand',
        backhand: 'Backhand',
        footwork: 'Footwork',
        serve: 'Serve',
        receive: 'Receive',
        spin: 'Spin',
        placement: 'Placement',
        consistency: 'Consistency'
      }

      const improvementList = Object.keys(improvements).map((key) => {
        const skillKey = key as keyof PlayerSkills
        return {
          skill: skillKey,
          skillLabel: skillLabels[skillKey],
          improvement: improvements[skillKey] || 0
        }
      })

      const totalImprovement = improvementList.reduce(
        (sum, item) => sum + item.improvement,
        0
      )

      return {
        playerName: `${player.firstName} ${player.lastName}`,
        playerId: player.id,
        totalImprovement,
        improvements: improvementList
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.totalImprovement - a.totalImprovement)
}
