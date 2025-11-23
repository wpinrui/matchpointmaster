/**
 * AI Schools utilities
 * Handles initialization, player generation, and training for AI schools
 */
import {
  AISchool,
  Gender,
  Player,
  PlayStyle,
  TrainingFocus,
  TrainingPlan
} from '../services/savegame/types'
import { generatePlayer, IntakeQuality } from './playerGeneration'
import { applySkillImprovements, calculatePlayerProgression } from './playerProgression'
import {
  attractivenessToIntakeQuality,
  calculateMaxTeamSize,
  calculateSchoolAttractiveness
} from './schoolReputation'
import { initializeTrainingPlan } from './trainingPlans'

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
 * Simulate training phases for a player
 * Applies multiple months of training to represent experience
 */
function simulateTrainingPhases(
  player: Player,
  numPhases: number,
  school: AISchool,
  teammates: Player[]
): Player {
  let trainedPlayer = player

  // Simulate each training phase (each phase = 1 month of training)
  for (let phase = 0; phase < numPhases; phase++) {
    // Select a random training focus for this phase (mimics AI coach behavior)
    // Use similar logic to selectAITrainingFocus but simpler
    const commonFocuses: TrainingFocus[] = [
      TrainingFocus.MATCH_PLAY,
      TrainingFocus.FUNDAMENTALS,
      TrainingFocus.FOREHAND,
      TrainingFocus.BACKHAND,
      TrainingFocus.FOOTWORK,
      TrainingFocus.CONSISTENCY
    ]

    // 20% chance of no focus (just general training)
    const teamFocus =
      Math.random() < 0.2
        ? null
        : commonFocuses[Math.floor(Math.random() * commonFocuses.length)]

    // Calculate progression (no individual coaching during simulation)
    const improvements = calculatePlayerProgression(
      trainedPlayer,
      null, // no individual coaching assignment
      teamFocus,
      school.managerStats,
      school.managerPlayStyle,
      school.funding,
      teammates.filter((p) => p.id !== trainedPlayer.id)
    )

    // Apply improvements
    trainedPlayer = applySkillImprovements(trainedPlayer, improvements)
  }

  return trainedPlayer
}

/**
 * Generate initial players for an AI school (Sec 2, 3, 4)
 * Simulates training phases instead of artificially boosting stats
 */
export function generateInitialAISchoolPlayers(
  school: AISchool,
  schoolsData: SchoolData[]
): Player[] {
  const schoolData = schoolsData.find((s) => s.id === school.id)
  if (!schoolData) return []

  const players: Player[] = []
  const maxTeamSize = calculateMaxTeamSize(school.funding, school.teamType)

  // Calculate intake quality based on school attractiveness (same as DraftScreen)
  // For AI schools, we use a fixed manager reputation (50) to focus on school reputation
  // School reputation and funding are rankings (lower is better), so we need to calculate attractiveness first
  const schoolAttractiveness = calculateSchoolAttractiveness(
    school.reputation, // ranking (lower is better)
    school.funding, // ranking (lower is better)
    50 // fixed manager reputation
  )
  const intakeInfo = attractivenessToIntakeQuality(schoolAttractiveness)
  // The quality string matches the IntakeQuality enum values
  const intakeQuality = intakeInfo.quality as IntakeQuality

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
  // B divs (Sec 3 and 4) should be filled to half of max capacity
  // C div (Sec 2) should be filled to 7 players (minimum for C div)
  // Rest for Sec 1s (to be drafted)

  const isCoEd = school.teamType === 'both'
  const minPlayersPerBTeam = 7
  const minPlayersPerCTeam = 7

  // B div capacity: half of max team size
  // Co-ed: maxTeamSize = 28-56, so B div gets 14-28 (half)
  // Single gender: maxTeamSize = 14-28, so B div gets 7-14 (half)
  const totalBDivCapacity = Math.floor(maxTeamSize / 2)

  // C div capacity: minimum 7 players per C team
  // Co-ed: 2 C teams = 14 total minimum
  // Single gender: 1 C team = 7 total minimum
  const totalCDivCapacity = isCoEd ? 14 : 7

  // Generate B div players (Sec 3 and 4) - fill to capacity
  // Distribute evenly between Sec 3 and Sec 4
  const sec3Players = Math.floor(totalBDivCapacity / 2)
  const sec4Players = Math.ceil(totalBDivCapacity / 2)

  // Generate Sec 2 players - fill C div capacity
  const sec2Capacity = totalCDivCapacity

  // For co-ed schools, split evenly between boys and girls
  // For single-gender schools, all players are the same gender
  if (isCoEd) {
    // B div: split evenly between boys and girls
    const bDivBoys = Math.floor(totalBDivCapacity / 2)
    const bDivGirls = Math.ceil(totalBDivCapacity / 2)

    // Sec 3: split evenly
    const sec3Boys = Math.floor(sec3Players / 2)
    const sec3Girls = Math.ceil(sec3Players / 2)

    // Sec 4: split evenly
    const sec4Boys = Math.floor(sec4Players / 2)
    const sec4Girls = Math.ceil(sec4Players / 2)

    // Generate Sec 4 players first (they've been training longest)
    // Generate Sec 4 boys
    for (let i = 0; i < sec4Boys; i++) {
      const player = generatePlayer(intakeQuality, 4, Gender.MALE)
      // Simulate 18 training phases (they've been training for 1.5 years)
      const trainedPlayer = simulateTrainingPhases(player, 18, school, players)
      players.push(trainedPlayer)
    }

    // Generate Sec 4 girls
    for (let i = 0; i < sec4Girls; i++) {
      const player = generatePlayer(intakeQuality, 4, Gender.FEMALE)
      // Simulate 18 training phases (they've been training for 1.5 years)
      const trainedPlayer = simulateTrainingPhases(player, 18, school, players)
      players.push(trainedPlayer)
    }

    // Generate Sec 3 players
    // Generate Sec 3 boys
    for (let i = 0; i < sec3Boys; i++) {
      const player = generatePlayer(intakeQuality, 3, Gender.MALE)
      // Simulate 12 training phases (they've been training for 1 year)
      const trainedPlayer = simulateTrainingPhases(player, 12, school, players)
      players.push(trainedPlayer)
    }

    // Generate Sec 3 girls
    for (let i = 0; i < sec3Girls; i++) {
      const player = generatePlayer(intakeQuality, 3, Gender.FEMALE)
      // Simulate 12 training phases (they've been training for 1 year)
      const trainedPlayer = simulateTrainingPhases(player, 12, school, players)
      players.push(trainedPlayer)
    }

    // C div: split evenly between boys and girls (7 each)
    const sec2Boys = Math.floor(sec2Capacity / 2)
    const sec2Girls = Math.ceil(sec2Capacity / 2)

    // Generate Sec 2 players last
    // Generate Sec 2 boys
    for (let i = 0; i < sec2Boys; i++) {
      const player = generatePlayer(intakeQuality, 2, Gender.MALE)
      // Simulate 6 training phases (they've been training for 6 months)
      const trainedPlayer = simulateTrainingPhases(player, 6, school, players)
      players.push(trainedPlayer)
    }

    // Generate Sec 2 girls
    for (let i = 0; i < sec2Girls; i++) {
      const player = generatePlayer(intakeQuality, 2, Gender.FEMALE)
      // Simulate 6 training phases (they've been training for 6 months)
      const trainedPlayer = simulateTrainingPhases(player, 6, school, players)
      players.push(trainedPlayer)
    }
  } else {
    // Single-gender school: all players are the same gender
    const gender = gendersToGenerate[0] // Only one gender in the array

    // Generate Sec 4 players first (they've been training longest)
    for (let i = 0; i < sec4Players; i++) {
      const player = generatePlayer(intakeQuality, 4, gender)
      // Simulate 18 training phases (they've been training for 1.5 years)
      const trainedPlayer = simulateTrainingPhases(player, 18, school, players)
      players.push(trainedPlayer)
    }

    // Generate Sec 3 players
    for (let i = 0; i < sec3Players; i++) {
      const player = generatePlayer(intakeQuality, 3, gender)
      // Simulate 12 training phases (they've been training for 1 year)
      const trainedPlayer = simulateTrainingPhases(player, 12, school, players)
      players.push(trainedPlayer)
    }

    // Generate Sec 2 players last
    for (let i = 0; i < sec2Capacity; i++) {
      const player = generatePlayer(intakeQuality, 2, gender)
      // Simulate 6 training phases (they've been training for 6 months)
      const trainedPlayer = simulateTrainingPhases(player, 6, school, players)
      players.push(trainedPlayer)
    }
  }

  // Set team roster to all generated players (B divs filled, Sec 2s half-filled, rest for Sec 1s)
  const teamRoster = players.map((p) => p.id)

  return players
}

/**
 * Generate new players for AI school during draft phase
 */
export function generateAISchoolDraftPlayers(school: AISchool, count: number): Player[] {
  // Calculate intake quality based on school attractiveness (same as initial generation)
  const schoolAttractiveness = calculateSchoolAttractiveness(
    school.reputation, // ranking (lower is better)
    school.funding, // ranking (lower is better)
    50 // fixed manager reputation
  )
  const intakeInfo = attractivenessToIntakeQuality(schoolAttractiveness)
  // The quality string matches the IntakeQuality enum values
  const intakeQuality = intakeInfo.quality as IntakeQuality
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
    console.log(`[AI Training] Skipping ${school.name} - no training plan or already completed`)
    return school
  }

  console.log(
    `[AI Training] Processing ${school.name} - Team Focus: ${school.trainingPlan.teamFocus || 'None'}, Players: ${teammates.length}`
  )

  let totalImprovements = 0
  const playerImprovements: Array<{ name: string; total: number; details: Record<string, number> }> = []

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

    // Calculate total improvement
    const improvementTotal = Object.values(improvements).reduce((sum, val) => sum + val, 0)
    totalImprovements += improvementTotal

    // Track individual player improvements
    const improvementDetails: Record<string, number> = {}
    Object.entries(improvements).forEach(([skill, value]) => {
      if (value > 0) {
        improvementDetails[skill] = value
      }
    })

    if (improvementTotal > 0) {
      playerImprovements.push({
        name: `${player.firstName} ${player.lastName}`,
        total: improvementTotal,
        details: improvementDetails
      })
    }

    return applySkillImprovements(player, improvements)
  })

  // Log summary
  console.log(
    `[AI Training] ${school.name} - Total improvement: ${totalImprovements.toFixed(2)} points across ${playerImprovements.length} players`
  )
  if (playerImprovements.length > 0) {
    console.log(`[AI Training] Top improvers:`)
    playerImprovements
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .forEach((p) => {
        const detailsStr = Object.entries(p.details)
          .map(([skill, val]) => `${skill}: +${val.toFixed(2)}`)
          .join(', ')
        console.log(`  - ${p.name}: +${p.total.toFixed(2)} (${detailsStr})`)
      })
  }

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

  console.log(
    `[AI Training] Initialized training plan for ${school.name} - Month: ${month}, Focus: ${teamFocus || 'None'}, Team Players: ${teamPlayers.length}`
  )

  return {
    ...school,
    trainingPlan
  }
}
