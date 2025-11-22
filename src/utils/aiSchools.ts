/**
 * AI Schools utilities
 * Handles initialization, player generation, and training for AI schools
 */
import {
  AISchool,
  Player,
  Gender,
  TrainingPlan,
  ManagerStats,
  PlayStyle,
  TrainingFocus
} from '../services/savegame/types'
import { generatePlayer, IntakeQuality, calculateIntakeQuality } from './playerGeneration'
import {
  calculateMaxTeamSize,
  attractivenessToIntakeQuality,
  calculateSchoolAttractiveness
} from './schoolReputation'
import { initializeTrainingPlan } from './trainingPlans'
import { calculatePlayerProgression, applySkillImprovements } from './playerProgression'

/**
 * School data from schools_data.json
 */
export type SchoolData = {
  id: number
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  reputation: number
  funding: number
  teamType: 'boys' | 'girls' | 'both'
  crestPath: string
}

/**
 * Initialize AI schools from school data
 */
export function initializeAISchools(schoolsData: SchoolData[]): AISchool[] {
  return schoolsData.map((schoolData) => {
    // Generate random manager stats (15-85 range, with better schools having better managers)
    const reputationFactor = (100 - schoolData.reputation) / 100 // 0 to 1, higher is better
    const baseReputation = 15 + reputationFactor * 70 // 15 to 85
    const baseCoaching = 15 + reputationFactor * 70

    // Add some randomness
    const managerReputation = Math.max(
      10,
      Math.min(90, baseReputation + (Math.random() - 0.5) * 20)
    )
    const coachingEffectiveness = Math.max(
      10,
      Math.min(90, baseCoaching + (Math.random() - 0.5) * 20)
    )

    // Random play style
    const playStyles = Object.values(PlayStyle)
    const managerPlayStyle = playStyles[Math.floor(Math.random() * playStyles.length)]

    return {
      id: schoolData.id,
      name: schoolData.name,
      primaryColor: schoolData.primaryColor,
      secondaryColor: schoolData.secondaryColor,
      accentColor: schoolData.accentColor,
      reputation: schoolData.reputation,
      funding: schoolData.funding,
      teamType: schoolData.teamType,
      crestPath: schoolData.crestPath,
      players: [],
      teamRoster: [],
      trainingPlan: null,
      managerStats: {
        reputation: Math.round(managerReputation),
        coachingEffectiveness: Math.round(coachingEffectiveness)
      },
      managerPlayStyle
    }
  })
}

/**
 * Generate initial players for an AI school (Sec 2, 3, 4)
 * Each level should be ~5 points higher on average than previous
 */
export function generateInitialAISchoolPlayers(
  school: AISchool,
  schoolsData: SchoolData[]
): Player[] {
  const schoolData = schoolsData.find((s) => s.id === school.id)
  if (!schoolData) return []

  const players: Player[] = []
  const maxTeamSize = calculateMaxTeamSize(school.funding, school.teamType)

  // Calculate intake quality based on school reputation
  // For AI schools, we use a fixed manager reputation (50) to focus on school reputation
  const intakeQuality = calculateIntakeQuality(50, school.reputation)

  // Determine which genders to generate based on team type
  const gendersToGenerate: Gender[] = []
  if (school.teamType === 'boys') {
    gendersToGenerate.push(Gender.MALE)
  } else if (school.teamType === 'girls') {
    gendersToGenerate.push(Gender.FEMALE)
  } else {
    gendersToGenerate.push(Gender.MALE, Gender.FEMALE)
  }

  // Calculate team structure:
  // Co-ed: 4 teams (C boys, C girls, B boys, B girls), minimum 7 per team = 28 total
  // Single gender: 2 teams (C and B), minimum 7 per team = 14 total
  // B divs (Sec 3 and 4) should be filled to minimum capacity (7 per B team)
  // Sec 2s should be half of B div capacity
  // Rest for Sec 1s (to be drafted)

  const isCoEd = school.teamType === 'both'
  const minPlayersPerBTeam = 7

  // B div capacity: each B team needs 7 players minimum
  // Co-ed: 2 B teams (boys + girls) = 14 total
  // Single gender: 1 B team = 7 total
  const totalBDivCapacity = isCoEd ? 14 : 7

  // Sec 2s should be half of B div capacity
  const sec2Capacity = Math.floor(totalBDivCapacity / 2) // Co-ed: 7, Single: 3

  // Generate B div players (Sec 3 and 4) - fill to capacity
  // Distribute evenly between Sec 3 and Sec 4
  const sec3Players = Math.floor(totalBDivCapacity / 2)
  const sec4Players = Math.ceil(totalBDivCapacity / 2)

  // Generate Sec 3 players
  for (let i = 0; i < sec3Players; i++) {
    const gender = gendersToGenerate[Math.floor(Math.random() * gendersToGenerate.length)]
    const player = generatePlayer(intakeQuality, 3, gender)
    // Sec 3 should be ~5 points higher than Sec 2 baseline
    const skillBoost = 5 + (Math.random() - 0.5) * 5
    Object.keys(player.skills).forEach((skillKey) => {
      const skill = skillKey as keyof typeof player.skills
      player.skills[skill] = Math.min(
        100,
        Math.max(0, Math.round(player.skills[skill] + skillBoost))
      )
    })
    players.push(player)
  }

  // Generate Sec 4 players
  for (let i = 0; i < sec4Players; i++) {
    const gender = gendersToGenerate[Math.floor(Math.random() * gendersToGenerate.length)]
    const player = generatePlayer(intakeQuality, 4, gender)
    // Sec 4 should be ~10 points higher than Sec 2 baseline
    const skillBoost = 10 + (Math.random() - 0.5) * 5
    Object.keys(player.skills).forEach((skillKey) => {
      const skill = skillKey as keyof typeof player.skills
      player.skills[skill] = Math.min(
        100,
        Math.max(0, Math.round(player.skills[skill] + skillBoost))
      )
    })
    players.push(player)
  }

  // Generate Sec 2 players - half of B div capacity
  for (let i = 0; i < sec2Capacity; i++) {
    const gender = gendersToGenerate[Math.floor(Math.random() * gendersToGenerate.length)]
    const player = generatePlayer(intakeQuality, 2, gender)
    // Sec 2 is baseline (no boost)
    players.push(player)
  }

  // Set team roster to all generated players (B divs filled, Sec 2s half-filled, rest for Sec 1s)
  const teamRoster = players.map((p) => p.id)

  return players
}

/**
 * Generate new players for AI school during draft phase
 */
export function generateAISchoolDraftPlayers(school: AISchool, count: number): Player[] {
  const intakeQuality = calculateIntakeQuality(50, school.reputation)
  const gendersToGenerate: Gender[] = []
  if (school.teamType === 'boys') {
    gendersToGenerate.push(Gender.MALE)
  } else if (school.teamType === 'girls') {
    gendersToGenerate.push(Gender.FEMALE)
  } else {
    gendersToGenerate.push(Gender.MALE, Gender.FEMALE)
  }

  const players: Player[] = []
  for (let i = 0; i < count; i++) {
    const gender = gendersToGenerate[Math.floor(Math.random() * gendersToGenerate.length)]
    players.push(generatePlayer(intakeQuality, 1, gender))
  }

  return players
}

/**
 * AI coach behavior: randomly select training focus
 */
export function selectAITrainingFocus(
  phase: string,
  month: number
): TrainingFocus | null {
  // 30% chance to use tournament prep if appropriate
  if (month === 4 || month === 10) {
    if (Math.random() < 0.3) {
      return TrainingFocus.TOURNAMENT_PREP
    }
  }

  // Otherwise, random selection from common focuses
  const commonFocuses: TrainingFocus[] = [
    TrainingFocus.MATCH_PLAY,
    TrainingFocus.FUNDAMENTALS,
    TrainingFocus.FOREHAND,
    TrainingFocus.BACKHAND,
    TrainingFocus.FOOTWORK,
    TrainingFocus.CONSISTENCY
  ]

  // 20% chance of no focus (just general training)
  if (Math.random() < 0.2) {
    return null
  }

  return commonFocuses[Math.floor(Math.random() * commonFocuses.length)]
}

/**
 * Apply training to AI school players
 */
export function applyAISchoolTraining(school: AISchool, teammates: Player[]): AISchool {
  if (!school.trainingPlan || school.trainingPlan.completed) {
    return school
  }

  const updatedPlayers = school.players.map((player) => {
    const isOnTeam = school.teamRoster.includes(player.id)
    if (!isOnTeam) return player

    const trainingAssignment =
      school.trainingPlan?.playerAssignments.find((a) => a.playerId === player.id) || null

    const improvements = calculatePlayerProgression(
      player,
      trainingAssignment,
      school.trainingPlan?.teamFocus || null,
      school.managerStats,
      school.managerPlayStyle,
      school.funding,
      teammates.filter((p) => p.id !== player.id)
    )

    return applySkillImprovements(player, improvements)
  })

  // Mark training as completed
  const updatedTrainingPlan: TrainingPlan = {
    ...school.trainingPlan,
    completed: true
  }

  return {
    ...school,
    players: updatedPlayers,
    trainingPlan: updatedTrainingPlan
  }
}

/**
 * Initialize training plan for AI school
 */
export function initializeAISchoolTraining(
  school: AISchool,
  year: number,
  month: number,
  phase: string
): AISchool {
  const teamPlayers = school.players.filter((p) => school.teamRoster.includes(p.id))

  // Select training focus (random AI behavior)
  const teamFocus = selectAITrainingFocus(phase, month)

  // Create training plan
  const trainingPlan = initializeTrainingPlan(year, month)
  trainingPlan.teamFocus = teamFocus

  // AI schools don't use individual coaching for now (can be added later)
  trainingPlan.playerAssignments = []
  trainingPlan.coachingSlotsUsed = 0

  return {
    ...school,
    trainingPlan
  }
}
