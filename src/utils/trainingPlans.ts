/**
 * Training plan utilities
 */
import { TrainingFocus, TrainingPlan, PlayerTraining } from '../services/savegame/types'
import { GamePhase } from './gamePhases'

/**
 * Get display name for training focus
 */
export function getTrainingFocusDisplayName(focus: TrainingFocus): string {
  const names: Record<TrainingFocus, string> = {
    [TrainingFocus.FOREHAND]: 'Forehand',
    [TrainingFocus.BACKHAND]: 'Backhand',
    [TrainingFocus.FOOTWORK]: 'Footwork',
    [TrainingFocus.SERVE]: 'Serve',
    [TrainingFocus.RECEIVE]: 'Receive',
    [TrainingFocus.SPIN]: 'Spin',
    [TrainingFocus.PLACEMENT]: 'Placement',
    [TrainingFocus.CONSISTENCY]: 'Consistency',
    [TrainingFocus.MATCH_PLAY]: 'Match Play',
    [TrainingFocus.FUNDAMENTALS]: 'Fundamentals',
    [TrainingFocus.TOURNAMENT_PREP]: 'Tournament Prep'
  }
  return names[focus]
}

/**
 * Get description for training focus
 */
export function getTrainingFocusDescription(focus: TrainingFocus): string {
  const descriptions: Record<TrainingFocus, string> = {
    [TrainingFocus.FOREHAND]: 'Focus on improving forehand strokes and power',
    [TrainingFocus.BACKHAND]: 'Focus on improving backhand technique and consistency',
    [TrainingFocus.FOOTWORK]: 'Focus on movement, positioning, and agility',
    [TrainingFocus.SERVE]: 'Focus on serve quality, spin, and placement',
    [TrainingFocus.RECEIVE]: 'Focus on return of serve and reading opponent serves',
    [TrainingFocus.SPIN]: 'Focus on spin generation and reading spin',
    [TrainingFocus.PLACEMENT]: 'Focus on shot placement and accuracy',
    [TrainingFocus.CONSISTENCY]: 'Focus on reducing errors and maintaining rallies',
    [TrainingFocus.MATCH_PLAY]: 'General match practice, balanced skill improvement',
    [TrainingFocus.FUNDAMENTALS]: 'Focus on weakest areas, balanced development',
    [TrainingFocus.TOURNAMENT_PREP]:
      'Preparation for upcoming tournament, match-focused training'
  }
  return descriptions[focus]
}

/**
 * Get all available training focuses
 */
export function getAllTrainingFocuses(): TrainingFocus[] {
  return Object.values(TrainingFocus)
}

/**
 * Check if a training focus is appropriate for tournament prep
 */
export function isTournamentPrepPhase(phase: string, month: number): boolean {
  // April (before intra-club) and October (before singles) are tournament prep phases
  if (phase === GamePhase.TRAINING && month === 4) return true
  if (phase === GamePhase.TRAINING_2 && month === 10) return true
  return false
}

/**
 * Initialize a new training plan for a month
 */
export function initializeTrainingPlan(year: number, month: number): TrainingPlan {
  return {
    year,
    month,
    teamFocus: null,
    playerAssignments: [],
    coachingSlotsUsed: 0,
    completed: false
  }
}

/**
 * Get recommended training focus based on phase
 */
export function getRecommendedTrainingFocus(
  phase: string,
  month: number
): TrainingFocus | null {
  if (isTournamentPrepPhase(phase, month)) {
    return TrainingFocus.TOURNAMENT_PREP
  }
  return null // No recommendation, let player choose
}

/**
 * Get maximum coaching slots available
 */
export function getMaxCoachingSlots(coachingEffectiveness: number): number {
  // Base slots: 3, scales up to 7 with coaching effectiveness
  return Math.floor(3 + coachingEffectiveness / 25)
}

/**
 * Get training focus that targets a specific skill
 */
export function getFocusForSkill(skillName: keyof typeof skillToFocus): TrainingFocus {
  return skillToFocus[skillName]
}

const skillToFocus: Record<string, TrainingFocus> = {
  forehand: TrainingFocus.FOREHAND,
  backhand: TrainingFocus.BACKHAND,
  footwork: TrainingFocus.FOOTWORK,
  serve: TrainingFocus.SERVE,
  receive: TrainingFocus.RECEIVE,
  spin: TrainingFocus.SPIN,
  placement: TrainingFocus.PLACEMENT,
  consistency: TrainingFocus.CONSISTENCY
}
