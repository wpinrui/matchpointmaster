/**
 * Training preview utilities
 * Calculates expected improvements before training is applied
 */
import {
  Player,
  PlayerSkills,
  TrainingFocus,
  PlayerTraining,
  TrainingPlan,
  ManagerStats,
  PlayStyle
} from '../services/savegame/types'
import {
  calculatePlayerProgression,
  calculateStyleSynergy,
  calculateTraitMultiplier,
  calculatePeerInfluence,
  calculateDiminishingReturns,
  fundingToFacilitiesMultiplier
} from './playerProgression'

/**
 * Expected improvement for a skill (without random variance)
 */
export type ExpectedImprovement = {
  skill: keyof PlayerSkills
  skillLabel: string
  currentValue: number
  expectedValue: number
  expectedImprovement: number
  minImprovement: number // With -10% variance
  maxImprovement: number // With +10% variance
}

/**
 * Expected improvements for a player
 */
export type PlayerExpectedImprovements = {
  player: Player
  improvements: ExpectedImprovement[]
  totalExpectedImprovement: number
  factors: {
    styleSynergy: number
    traitMultiplier: number
    peerInfluence: number
    facilitiesMultiplier: number
    coachingMultiplier: number
    diminishingReturns: Record<keyof PlayerSkills, number>
  }
}

/**
 * Calculate expected improvements for a player (without random variance)
 */
export function calculateExpectedImprovements(
  player: Player,
  trainingAssignment: PlayerTraining | null,
  teamFocus: TrainingFocus | null,
  managerStats: ManagerStats,
  managerPlayStyle: PlayStyle,
  funding: number,
  teammates: Player[]
): PlayerExpectedImprovements {
  const focus = trainingAssignment?.focus || teamFocus
  const isIndividualCoaching = trainingAssignment?.isIndividualCoaching || false

  if (!focus) {
    return {
      player,
      improvements: [],
      totalExpectedImprovement: 0,
      factors: {
        styleSynergy: 1.0,
        traitMultiplier: 1.0,
        peerInfluence: 1.0,
        facilitiesMultiplier: 1.0,
        coachingMultiplier: 1.0,
        diminishingReturns: {} as Record<keyof PlayerSkills, number>
      }
    }
  }

  // Calculate multipliers (same as in playerProgression)
  const styleSynergy = calculateStyleSynergy(managerPlayStyle, player.playStyle)
  const traitMultiplier = calculateTraitMultiplier(player.traits)
  const peerInfluence = calculatePeerInfluence(player, teammates)
  const facilitiesMultiplier = fundingToFacilitiesMultiplier(funding)
  const coachingMultiplier = 0.5 + (managerStats.coachingEffectiveness / 100) * 1.0

  // Get skills affected by focus
  const getSkillsForFocus = (f: TrainingFocus): (keyof PlayerSkills)[] => {
    switch (f) {
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
      case TrainingFocus.FUNDAMENTALS:
      case TrainingFocus.TOURNAMENT_PREP:
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

  const targetedSkills = getSkillsForFocus(focus)
  const improvements: ExpectedImprovement[] = []
  const diminishingReturns: Record<keyof PlayerSkills, number> = {} as Record<
    keyof PlayerSkills,
    number
  >

  // Calculate base improvement
  const baseImprovement = isIndividualCoaching ? 9.0 : 6.0 // 1.5x for individual coaching

  // Adjust for composite focuses
  let adjustedBase = baseImprovement
  if (focus === TrainingFocus.FUNDAMENTALS) {
    adjustedBase *= 1.2
  } else if (
    focus === TrainingFocus.MATCH_PLAY ||
    focus === TrainingFocus.TOURNAMENT_PREP
  ) {
    adjustedBase *= 0.8
  }

  targetedSkills.forEach((skill) => {
    const currentValue = player.skills[skill]
    const diminishingReturnsMultiplier = calculateDiminishingReturns(currentValue)
    diminishingReturns[skill] = diminishingReturnsMultiplier

    // Base improvement for targeted vs non-targeted
    const isTargeted = targetedSkills.includes(skill)
    const skillBase = isTargeted ? adjustedBase : isIndividualCoaching ? 0.3 : 0.2

    // Calculate expected improvement (without random variance)
    let expectedImprovement =
      skillBase *
      diminishingReturnsMultiplier *
      styleSynergy *
      traitMultiplier *
      peerInfluence *
      facilitiesMultiplier *
      coachingMultiplier

    // For FUNDAMENTALS, boost weak skills
    if (focus === TrainingFocus.FUNDAMENTALS && isTargeted) {
      const avgSkill =
        targetedSkills.reduce((sum, key) => sum + player.skills[key], 0) /
        targetedSkills.length
      if (currentValue < avgSkill) {
        const gap = avgSkill - currentValue
        expectedImprovement *= 1.0 + (gap / 100) * 0.5
      }
    }

    // Calculate min/max with variance
    const minImprovement = expectedImprovement * 0.9
    const maxImprovement = expectedImprovement * 1.1

    const expectedValue = Math.min(100, currentValue + expectedImprovement)
    const actualImprovement = expectedValue - currentValue

    improvements.push({
      skill,
      skillLabel: skillLabels[skill],
      currentValue: Math.floor(currentValue),
      expectedValue: Math.floor(expectedValue),
      expectedImprovement: Math.floor(actualImprovement),
      minImprovement: Math.floor(minImprovement),
      maxImprovement: Math.floor(maxImprovement)
    })
  })

  const totalExpectedImprovement = improvements.reduce(
    (sum, imp) => sum + imp.expectedImprovement,
    0
  )

  return {
    player,
    improvements,
    totalExpectedImprovement,
    factors: {
      styleSynergy,
      traitMultiplier,
      peerInfluence,
      facilitiesMultiplier,
      coachingMultiplier,
      diminishingReturns
    }
  }
}

/**
 * Calculate expected improvements for all team players
 */
export function calculateTeamExpectedImprovements(
  players: Player[],
  teamRoster: string[],
  trainingPlan: TrainingPlan | null,
  managerStats: ManagerStats,
  managerPlayStyle: PlayStyle,
  funding: number
): PlayerExpectedImprovements[] {
  if (!trainingPlan) return []

  const teamPlayers = players.filter((p) => teamRoster.includes(p.id))

  return teamPlayers.map((player) => {
    const trainingAssignment =
      trainingPlan.playerAssignments.find((a) => a.playerId === player.id) || null
    const teammates = teamPlayers.filter((p) => p.id !== player.id)

    return calculateExpectedImprovements(
      player,
      trainingAssignment,
      trainingPlan.teamFocus,
      managerStats,
      managerPlayStyle,
      funding,
      teammates
    )
  })
}

/**
 * Calculate team-wide expected improvement summary
 */
export function calculateTeamExpectedSummary(
  expectedImprovements: PlayerExpectedImprovements[]
): {
  totalExpectedImprovement: number
  averagePerPlayer: number
  topExpectedImprovers: Array<{
    player: Player
    expectedImprovement: number
  }>
} {
  const totalExpectedImprovement = expectedImprovements.reduce(
    (sum, exp) => sum + exp.totalExpectedImprovement,
    0
  )
  const averagePerPlayer =
    expectedImprovements.length > 0
      ? totalExpectedImprovement / expectedImprovements.length
      : 0

  const topExpectedImprovers = expectedImprovements
    .map((exp) => ({
      player: exp.player,
      expectedImprovement: exp.totalExpectedImprovement
    }))
    .sort((a, b) => b.expectedImprovement - a.expectedImprovement)
    .slice(0, 3)

  return {
    totalExpectedImprovement: Math.floor(totalExpectedImprovement),
    averagePerPlayer: Math.floor(averagePerPlayer),
    topExpectedImprovers
  }
}
