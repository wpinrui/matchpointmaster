/**
 * Utilities for handling phase progression logic
 * Extracted to reduce duplication across screens
 */

import { GamePhase, getNextPhase } from './gamePhases'
import {
  generatePhaseProgressionEmail,
  generateTrainingMotivationEmail,
  generateTrainingResultsEmail
} from './emailGenerator'
import { createSkillSnapshots, processPlayerProgression } from './applyProgression'
import type {
  Player,
  SaveData,
  TrainingPlan,
  SkillSnapshot,
  Email
} from '../services/savegame/types'

type Manager = SaveData['manager']
type School = SaveData['school']

export const TRAINING_MONTHS = {
  FIRST_PHASE_START: 2, // February
  FIRST_PHASE_END: 4, // April
  SECOND_PHASE_START: 8, // August
  SECOND_PHASE_END: 10 // October
} as const

export const UNIMPLEMENTED_PHASES: GamePhase[] = [
  GamePhase.INTRA_CLUB,
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

  // Process training progression if leaving a training phase
  processTrainingProgression(params, callbacks)

  // Calculate next phase
  const nextPhase = getNextPhase(currentPhase, currentMonth)
  const newYear = nextPhase.month === 1 ? currentYear + 1 : currentYear

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
  if (
    (nextPhase.phase === GamePhase.TRAINING ||
      nextPhase.phase === GamePhase.TRAINING_2) &&
    trainingPlan
  ) {
    if (trainingPlan.month !== nextPhase.month || trainingPlan.year !== newYear) {
      updateTrainingPlan.setMonthAndYear(nextPhase.month, newYear)
      updateTrainingPlan.setCompleted(false)
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
  },
  callbacks: {
    updateSeason: {
      setDraftCompleted: (completed: boolean) => void
      setMonth: (month: number) => void
      setPhase: (phase: string) => void
    }
    addEmail: (email: Email) => void
  }
): void {
  const { updateSeason } = callbacks

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
