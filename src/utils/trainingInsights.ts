/**
 * Training insights utilities
 * Calculates useful insights about team weaknesses, recommendations, and progress
 */
import {
  Player,
  PlayerSkills,
  TrainingFocus,
  PlayStyle,
  SkillSnapshot
} from '../services/savegame/types'

/** Human-readable labels for each skill type */
export const SKILL_LABELS: Record<keyof PlayerSkills, string> = {
  forehand: 'Forehand',
  backhand: 'Backhand',
  footwork: 'Footwork',
  serve: 'Serve',
  receive: 'Receive',
  spin: 'Spin',
  placement: 'Placement',
  consistency: 'Consistency'
} as const

/** All skill keys for iteration */
export const SKILL_KEYS: (keyof PlayerSkills)[] = [
  'forehand',
  'backhand',
  'footwork',
  'serve',
  'receive',
  'spin',
  'placement',
  'consistency'
] as const

/**
 * Training recommendation based on team analysis
 */
export type TrainingRecommendation = {
  focus: TrainingFocus
  reason: string
  priority: 'high' | 'medium' | 'low'
}

/**
 * Weakest skill analysis for a player
 */
export type WeakestSkill = {
  skill: keyof PlayerSkills
  value: number
  label: string
}

/**
 * Get the weakest skill for a player
 */
export function getWeakestSkill(player: Player): WeakestSkill | null {
  const skills = player.skills

  let weakest: keyof PlayerSkills = 'forehand'
  let lowestValue = skills.forehand

  SKILL_KEYS.forEach((skillKey) => {
    if (skills[skillKey] < lowestValue) {
      lowestValue = skills[skillKey]
      weakest = skillKey
    }
  })

  return {
    skill: weakest,
    value: lowestValue,
    label: SKILL_LABELS[weakest]
  }
}

/**
 * Get the strongest skill for a player
 */
export function getStrongestSkill(player: Player): WeakestSkill | null {
  const skills = player.skills

  let strongest: keyof PlayerSkills = 'forehand'
  let highestValue = skills.forehand

  SKILL_KEYS.forEach((skillKey) => {
    if (skills[skillKey] > highestValue) {
      highestValue = skills[skillKey]
      strongest = skillKey
    }
  })

  return {
    skill: strongest,
    value: highestValue,
    label: SKILL_LABELS[strongest]
  }
}

/**
 * Calculate average skill for a team
 */
export function calculateTeamAverageSkill(
  players: Player[],
  skill: keyof PlayerSkills
): number {
  if (players.length === 0) return 0
  const total = players.reduce((sum, p) => sum + p.skills[skill], 0)
  return Math.floor(total / players.length)
}

/**
 * Get team's weakest average skill
 */
export function getTeamWeakestSkill(players: Player[]): {
  skill: keyof PlayerSkills
  average: number
  label: string
} | null {
  if (players.length === 0) return null

  let weakest: keyof PlayerSkills = 'forehand'
  let lowestAverage = calculateTeamAverageSkill(players, 'forehand')

  SKILL_KEYS.forEach((skillKey) => {
    const avg = calculateTeamAverageSkill(players, skillKey)
    if (avg < lowestAverage) {
      lowestAverage = avg
      weakest = skillKey
    }
  })

  return {
    skill: weakest,
    average: lowestAverage,
    label: SKILL_LABELS[weakest]
  }
}

/**
 * Get training recommendations based on team analysis
 */
export function getTrainingRecommendations(
  players: Player[],
  managerPlayStyle: PlayStyle
): TrainingRecommendation[] {
  if (players.length === 0) return []

  const recommendations: TrainingRecommendation[] = []
  const skillToFocus: Record<keyof PlayerSkills, TrainingFocus> = {
    forehand: TrainingFocus.FOREHAND,
    backhand: TrainingFocus.BACKHAND,
    footwork: TrainingFocus.FOOTWORK,
    serve: TrainingFocus.SERVE,
    receive: TrainingFocus.RECEIVE,
    spin: TrainingFocus.SPIN,
    placement: TrainingFocus.PLACEMENT,
    consistency: TrainingFocus.CONSISTENCY
  }

  // Check for very weak team skills (below 50 average)
  const teamWeakest = getTeamWeakestSkill(players)
  if (teamWeakest && teamWeakest.average < 50) {
    recommendations.push({
      focus: skillToFocus[teamWeakest.skill],
      reason: `Team average ${teamWeakest.label} is ${teamWeakest.average} - needs improvement`,
      priority: 'high'
    })
  }

  // Check for players with very weak fundamentals
  const playersWithWeakFundamentals = players.filter((player) => {
    const weakest = getWeakestSkill(player)
    return weakest && weakest.value < 40
  })

  if (playersWithWeakFundamentals.length >= players.length / 2) {
    recommendations.push({
      focus: TrainingFocus.FUNDAMENTALS,
      reason: `${playersWithWeakFundamentals.length} players have weak fundamentals`,
      priority: 'high'
    })
  }

  // Recommend match play if skills are balanced
  const avgSkills = players.reduce(
    (acc, player) => {
      SKILL_KEYS.forEach((skillKey) => {
        acc[skillKey] = (acc[skillKey] || 0) + player.skills[skillKey]
      })
      return acc
    },
    {} as Record<keyof PlayerSkills, number>
  )

  const averages = SKILL_KEYS.map((key) => avgSkills[key] / players.length)
  const minAvg = Math.min(...averages)
  const maxAvg = Math.max(...averages)

  // If skills are relatively balanced (within 15 points), recommend match play
  if (maxAvg - minAvg < 15 && minAvg > 45) {
    recommendations.push({
      focus: TrainingFocus.MATCH_PLAY,
      reason: 'Team skills are well-balanced - focus on match practice',
      priority: 'medium'
    })
  }

  return recommendations
}

/**
 * Calculate skill improvement between two snapshots
 */
export function calculateSkillImprovement(
  oldSkills: PlayerSkills,
  newSkills: PlayerSkills
): Partial<PlayerSkills> {
  const improvements: Partial<PlayerSkills> = {}

  SKILL_KEYS.forEach((skillKey) => {
    improvements[skillKey] = Math.floor(newSkills[skillKey]) - Math.floor(oldSkills[skillKey])
  })

  return improvements
}

/**
 * Get the most improved skill for a player
 */
export function getMostImprovedSkill(
  oldSkills: PlayerSkills,
  newSkills: PlayerSkills
): {
  skill: keyof PlayerSkills
  improvement: number
  label: string
} | null {
  const improvements = calculateSkillImprovement(oldSkills, newSkills)

  let mostImproved: keyof PlayerSkills | null = null
  let maxImprovement = -Infinity

  SKILL_KEYS.forEach((skillKey) => {
    const improvement = improvements[skillKey] || 0
    if (improvement > maxImprovement) {
      maxImprovement = improvement
      mostImproved = skillKey
    }
  })

  if (mostImproved === null || maxImprovement <= 0) return null

  return {
    skill: mostImproved,
    improvement: maxImprovement,
    label: SKILL_LABELS[mostImproved]
  }
}

/**
 * Calculate total team improvement across all skills
 */
export function calculateTeamTotalImprovement(
  oldSnapshots: SkillSnapshot[],
  newPlayers: Player[]
): number {
  let totalImprovement = 0

  newPlayers.forEach((player) => {
    const oldSnapshot = oldSnapshots.find((snapshot) => snapshot.playerId === player.id)
    if (!oldSnapshot) return

    const improvements = calculateSkillImprovement(oldSnapshot.skills, player.skills)

    SKILL_KEYS.forEach((skillKey) => {
      totalImprovement += improvements[skillKey] || 0
    })
  })

  return totalImprovement
}

/**
 * Get top improvers (players with most total skill improvement)
 */
export function getTopImprovers(
  oldSnapshots: SkillSnapshot[],
  newPlayers: Player[],
  limit: number = 3
): Array<{
  player: Player
  totalImprovement: number
}> {
  const improvers = newPlayers
    .map((player) => {
      const oldSnapshot = oldSnapshots.find((snapshot) => snapshot.playerId === player.id)
      if (!oldSnapshot) return null

      const improvements = calculateSkillImprovement(oldSnapshot.skills, player.skills)

      const totalImprovement = SKILL_KEYS.reduce(
        (sum, skillKey) => sum + (improvements[skillKey] || 0),
        0
      )

      return {
        player,
        totalImprovement
      }
    })
    .filter((item): item is { player: Player; totalImprovement: number } => {
      return item !== null && item.totalImprovement > 0
    })
    .sort((a, b) => b.totalImprovement - a.totalImprovement)
    .slice(0, limit)

  return improvers
}

/**
 * Calculate average improvement for team
 */
export function calculateTeamAverageImprovement(
  oldSnapshots: SkillSnapshot[],
  newPlayers: Player[]
): number {
  if (newPlayers.length === 0) return 0

  const totalImprovement = calculateTeamTotalImprovement(oldSnapshots, newPlayers)
  // Average per player across all 8 skills
  return Math.floor(totalImprovement / newPlayers.length / 8)
}
