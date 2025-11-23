/**
 * Utilities for handling phase progression logic
 * Extracted to reduce duplication across screens
 */

import type {
  AISchool,
  Email,
  Player,
  SaveData,
  SkillSnapshot,
  TrainingPlan
} from '../services/savegame/types'
import { Gender } from '../services/savegame/types'
import {
  applyAISchoolTraining,
  generateAISchoolDraftPlayers,
  initializeAISchoolTraining
} from './aiSchools'
import { createSkillSnapshots, processPlayerProgression } from './applyProgression'
import { calculateOverallRating } from './cardTiers'
import {
  generatePhaseProgressionEmail,
  generateTrainingMotivationEmail,
  generateTrainingResultsEmail
} from './emailGenerator'
import { GamePhase, getNextPhase } from './gamePhases'
import {
  calculateMaxTeamSize,
  calculatePlayerPoolSize,
  calculateSchoolAttractiveness
} from './schoolReputation'

type Manager = SaveData['manager']
type School = SaveData['school']

export const TRAINING_MONTHS = {
  FIRST_PHASE_START: 2, // February
  FIRST_PHASE_END: 4, // April
  SECOND_PHASE_START: 8, // August
  SECOND_PHASE_END: 10 // October
} as const

export const UNIMPLEMENTED_PHASES: GamePhase[] = [
  GamePhase.ZONAL,
  GamePhase.NATIONAL,
  GamePhase.SINGLES_SELECTION,
  GamePhase.SINGLES_TOURNAMENT,
  GamePhase.GRADUATION
]

export interface PhaseProgressionParams {
  currentMonth: number
  currentYear: number
  currentPhase: GamePhase
  players: Player[]
  teamRoster: string[]
  manager: Manager
  school: School
  trainingPlan: TrainingPlan | null
  skillSnapshots: SkillSnapshot[]
  previousMonthSnapshots?: SkillSnapshot[]
  aiSchools?: AISchool[]
}

export interface PhaseProgressionCallbacks {
  updateSeason: {
    setMonth: (month: number) => void
    setPhase: (phase: string) => void
    setYear: (year: number) => void
    setDraftCompleted: (completed: boolean) => void
  }
  updatePlayers: {
    set: (players: Player[]) => void
  }
  updateTrainingPlan: {
    setCompleted: (completed: boolean) => void
    setMonthAndYear: (month: number, year: number) => void
  }
  updateSkillSnapshots: {
    addMany: (snapshots: SkillSnapshot[]) => void
  }
  updateAISchools?: {
    set: (schools: AISchool[]) => void
  }
  addEmail: (email: Email) => void
}

/**
 * Process player progression for training phases
 */
function processTrainingProgression(
  params: PhaseProgressionParams,
  callbacks: PhaseProgressionCallbacks
): void {
  const {
    currentPhase,
    currentMonth,
    currentYear,
    players,
    teamRoster,
    trainingPlan,
    manager,
    school
  } = params
  const { updatePlayers, updateTrainingPlan, updateSkillSnapshots } = callbacks

  if (
    (currentPhase === GamePhase.TRAINING || currentPhase === GamePhase.TRAINING_2) &&
    trainingPlan
  ) {
    // Create skill snapshots before progression
    const snapshots = createSkillSnapshots(players, teamRoster, currentMonth, currentYear)
    callbacks.updateSkillSnapshots.addMany(snapshots)

    // Process progression
    const updatedPlayers = processPlayerProgression(
      players,
      teamRoster,
      trainingPlan,
      manager,
      school,
      currentPhase as string,
      currentMonth
    )
    updatePlayers.set(updatedPlayers)
    updateTrainingPlan.setCompleted(true)
  }
}

/**
 * Advance to the next phase and handle all related updates
 */
export function advanceToNextPhase(
  params: PhaseProgressionParams,
  callbacks: PhaseProgressionCallbacks
): void {
  const {
    currentMonth,
    currentYear,
    currentPhase,
    players,
    teamRoster,
    manager,
    school,
    trainingPlan,
    skillSnapshots,
    previousMonthSnapshots = []
  } = params

  const { updateSeason, updateTrainingPlan, addEmail } = callbacks

  // Calculate next phase early
  const nextPhase = getNextPhase(currentPhase, currentMonth)
  const newYear = nextPhase.month === 1 ? currentYear + 1 : currentYear

  // Process training progression if in a training phase - SAME LOGIC FOR PLAYER AND AI
  const isTrainingPhase =
    currentPhase === GamePhase.TRAINING || currentPhase === GamePhase.TRAINING_2

  // Process player's team training (existing logic)
  processTrainingProgression(params, callbacks)

  // Process AI school training - EXACT SAME LOGIC as player's team
  if (params.aiSchools && callbacks.updateAISchools && isTrainingPhase) {
    const updatedAISchools = params.aiSchools.map((school) => {
      // First ensure we have a training plan for the CURRENT month (same as player's team does in TrainingScreen)
      let schoolWithPlan = school
      if (!school.trainingPlan || school.trainingPlan.month !== currentMonth) {
        schoolWithPlan = initializeAISchoolTraining(
          school,
          currentYear,
          currentMonth,
          currentPhase
        )
      }

      // Then apply training - EXACT SAME CONDITION as player's team
      if (schoolWithPlan.trainingPlan && !schoolWithPlan.trainingPlan.completed) {
        const teamPlayers = schoolWithPlan.players.filter((p) =>
          schoolWithPlan.teamRoster.includes(p.id)
        )
        return applyAISchoolTraining(schoolWithPlan, teamPlayers)
      }

      return schoolWithPlan
    })
    callbacks.updateAISchools.set(updatedAISchools)
  }

  // Get snapshots from the month we're leaving
  const monthSnapshots =
    previousMonthSnapshots.length > 0
      ? previousMonthSnapshots
      : skillSnapshots.filter((s) => s.month === currentMonth && s.year === currentYear)

  // Advance phase
  updateSeason.setMonth(nextPhase.month)
  updateSeason.setPhase(nextPhase.phase)
  if (nextPhase.month === 1) {
    // New year - reset draft
    updateSeason.setDraftCompleted(false)
    updateSeason.setYear(newYear)
  }

  // If entering a new training month, reset completed flag and update month/year
  // SAME LOGIC FOR PLAYER AND AI - initialize training plans when entering training phase
  if (
    nextPhase.phase === GamePhase.TRAINING ||
    nextPhase.phase === GamePhase.TRAINING_2
  ) {
    // Player's team: initialize/reset training plan for new month
    if (trainingPlan) {
      if (trainingPlan.month !== nextPhase.month || trainingPlan.year !== newYear) {
        updateTrainingPlan.setMonthAndYear(nextPhase.month, newYear)
        updateTrainingPlan.setCompleted(false)
      }
    }

    // AI schools: initialize training plans when entering training phase (SAME as player's team)
    if (params.aiSchools && callbacks.updateAISchools) {
      const updatedAISchools = params.aiSchools.map((school) => {
        // Initialize if entering training phase and don't have a plan, or if plan is for different month
        if (!school.trainingPlan || school.trainingPlan.month !== nextPhase.month) {
          return initializeAISchoolTraining(
            school,
            newYear,
            nextPhase.month,
            nextPhase.phase
          )
        }
        return school
      })
      callbacks.updateAISchools.set(updatedAISchools)
    }
  }

  // Generate and add phase progression email
  const phaseProgressionEmail = generatePhaseProgressionEmail(
    manager.fullName || 'Coach',
    school.name || 'the school',
    players,
    teamRoster,
    currentMonth,
    currentYear,
    currentPhase,
    nextPhase.month,
    newYear,
    nextPhase.phase,
    monthSnapshots
  )
  addEmail(phaseProgressionEmail)

  // Generate training motivation email if entering a training month
  // Date it to the previous month (the month we're leaving) so it appears in the past
  // This ensures the email shows as "X days ago" rather than in the future
  if (
    (nextPhase.phase === GamePhase.TRAINING ||
      nextPhase.phase === GamePhase.TRAINING_2) &&
    trainingPlan
  ) {
    const motivationEmail = generateTrainingMotivationEmail(
      manager.fullName || 'Coach',
      school.name || 'the school',
      players,
      teamRoster,
      currentMonth, // Use the month we're leaving, not the new month
      currentYear, // Use current year (may be different if crossing year boundary)
      trainingPlan
    )
    if (motivationEmail) {
      addEmail(motivationEmail)
    }
  }

  // Generate training results email if leaving a training month
  if (
    (currentPhase === GamePhase.TRAINING || currentPhase === GamePhase.TRAINING_2) &&
    trainingPlan &&
    monthSnapshots.length > 0
  ) {
    const resultsEmail = generateTrainingResultsEmail(
      manager.fullName || 'Coach',
      school.name || 'the school',
      players,
      teamRoster,
      currentMonth,
      currentYear,
      monthSnapshots,
      trainingPlan
    )
    if (resultsEmail) {
      addEmail(resultsEmail)
    }
  }
}

/**
 * Simulate AI schools drafting players from their own individual pools
 * Each school generates their own draft pool and drafts the best available players until they reach capacity
 */
function simulateAISchoolDrafting(aiSchools: AISchool[]): AISchool[] {
  return aiSchools.map((school) => {
    // Calculate max team size for this school
    const maxTeamSize = calculateMaxTeamSize(school.funding, school.teamType)

    // Get current team size (existing players on roster)
    const currentTeamSize = school.teamRoster.length

    // Calculate how many players this school needs
    const playersNeeded = maxTeamSize - currentTeamSize

    if (playersNeeded <= 0) {
      return school // No capacity
    }

    // Calculate school attractiveness to determine pool size
    const schoolAttractiveness = calculateSchoolAttractiveness(
      school.reputation,
      school.funding,
      school.managerStats.reputation
    )
    const poolSize = calculatePlayerPoolSize(schoolAttractiveness)

    // Generate this school's own draft pool
    const draftPool = generateAISchoolDraftPlayers(school, poolSize)

    // Filter by team type
    let eligiblePlayers = draftPool
    if (school.teamType === 'boys') {
      eligiblePlayers = draftPool.filter((p) => p.gender === Gender.MALE)
    } else if (school.teamType === 'girls') {
      eligiblePlayers = draftPool.filter((p) => p.gender === Gender.FEMALE)
    }
    // 'both' allows all genders

    // Sort by overall rating (best first)
    const sortedPlayers = [...eligiblePlayers].sort(
      (a, b) => calculateOverallRating(b.skills) - calculateOverallRating(a.skills)
    )

    // Draft the best available players up to capacity
    const playersToDraft = sortedPlayers.slice(0, playersNeeded)
    const draftedPlayerIds = playersToDraft.map((p) => p.id)

    // Add drafted players to school's players array and team roster
    const updatedPlayers = [...school.players, ...playersToDraft]
    const updatedTeamRoster = [...school.teamRoster, ...draftedPlayerIds]

    return {
      ...school,
      players: updatedPlayers,
      teamRoster: updatedTeamRoster
    }
  })
}

/**
 * Complete draft and progress to training phase
 * Simplified version for draft completion that doesn't require all callbacks
 */
export function completeDraftAndProgress(
  params: {
    currentMonth: number
    currentYear: number
    players: Player[]
    teamRoster: string[]
    manager: Manager
    school: School
    aiSchools?: AISchool[]
  },
  callbacks: {
    updateSeason: {
      setDraftCompleted: (completed: boolean) => void
      setMonth: (month: number) => void
      setPhase: (phase: string) => void
    }
    addEmail: (email: Email) => void
    updatePlayers?: {
      set: (players: Player[]) => void
    }
    updateAISchools?: {
      set: (schools: AISchool[]) => void
    }
  }
): void {
  const { updateSeason } = callbacks

  // Simulate AI schools drafting from their own individual pools
  let updatedAISchools = params.aiSchools || []

  if (params.aiSchools && params.aiSchools.length > 0) {
    updatedAISchools = simulateAISchoolDrafting(params.aiSchools)

    // Update AI schools if callback is provided
    if (callbacks.updateAISchools) {
      callbacks.updateAISchools.set(updatedAISchools)
    }
  }

  // Mark draft as completed
  updateSeason.setDraftCompleted(true)

  // Progress to next phase (training)
  const nextPhase = getNextPhase(GamePhase.DRAFT, params.currentMonth)
  updateSeason.setMonth(nextPhase.month)
  updateSeason.setPhase(nextPhase.phase)

  // Generate and add phase progression email
  const phaseProgressionEmail = generatePhaseProgressionEmail(
    params.manager.fullName || 'Coach',
    params.school.name || 'the school',
    params.players,
    params.teamRoster,
    params.currentMonth,
    params.currentYear,
    GamePhase.DRAFT,
    nextPhase.month,
    params.currentYear,
    nextPhase.phase,
    [] // No previous snapshots for draft phase
  )
  callbacks.addEmail(phaseProgressionEmail)
}

/**
 * Check if a phase is implemented
 */
export function isPhaseImplemented(phase: GamePhase): boolean {
  return !UNIMPLEMENTED_PHASES.includes(phase)
}

/**
 * Check if a month is a training month
 */
export function isTrainingMonth(month: number): boolean {
  return (
    (month >= TRAINING_MONTHS.FIRST_PHASE_START &&
      month <= TRAINING_MONTHS.FIRST_PHASE_END) ||
    (month >= TRAINING_MONTHS.SECOND_PHASE_START &&
      month <= TRAINING_MONTHS.SECOND_PHASE_END)
  )
}

/**
 * Check if a month is the first month of a training phase
 */
export function isFirstTrainingMonth(month: number): boolean {
  return (
    month === TRAINING_MONTHS.FIRST_PHASE_START ||
    month === TRAINING_MONTHS.SECOND_PHASE_START
  )
}
