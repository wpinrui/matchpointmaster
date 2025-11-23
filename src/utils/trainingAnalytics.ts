/**
 * Training analytics utilities
 * Analyzes player improvements and explains why they happened
 */
import {
  Player,
  PlayerSkills,
  SkillSnapshot,
  PlayStyle,
  TrainingFocus
} from '../services/savegame/types'
import {
  calculateStyleSynergy,
  calculateTraitMultiplier,
  calculatePeerInfluence,
  calculateDiminishingReturns
} from './playerProgression'
import { getPlayerFullName } from './playerGeneration'
import { calculateSkillImprovement } from './trainingInsights'
import { SKILL_LABELS } from './trainingAnalytics/constants'
import {
  fundingToFacilitiesMultiplier,
  analyzeHighImprovementReasons,
  analyzeLowImprovementReasons
} from './trainingAnalytics/improvementReasons'

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

  return Object.keys(improvements).map((key) => {
    const skillKey = key as keyof PlayerSkills
    return {
      skill: skillKey,
      skillLabel: SKILL_LABELS[skillKey],
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
    analyzeHighImprovementReasons(
      player,
      skill,
      improvement,
      styleSynergy,
      traitMultiplier,
      peerInfluence,
      diminishingReturns,
      facilitiesMultiplier,
      coachingMultiplier,
      trainingFocus,
      isIndividualCoaching,
      reasons
    )
  } else if (!isMax && improvement <= 1) {
    // Low improvement reasons
    analyzeLowImprovementReasons(
      player,
      skill,
      styleSynergy,
      traitMultiplier,
      diminishingReturns,
      facilitiesMultiplier,
      coachingMultiplier,
      trainingFocus,
      isIndividualCoaching,
      reasons
    )
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
    skillLabel: SKILL_LABELS[skill],
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

      const improvementList = Object.keys(improvements).map((key) => {
        const skillKey = key as keyof PlayerSkills
        return {
          skill: skillKey,
          skillLabel: SKILL_LABELS[skillKey],
          improvement: improvements[skillKey] || 0
        }
      })

      const totalImprovement = improvementList.reduce(
        (sum, item) => sum + item.improvement,
        0
      )

      return {
        playerName: getPlayerFullName(player),
        playerId: player.id,
        totalImprovement,
        improvements: improvementList
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.totalImprovement - a.totalImprovement)
}
