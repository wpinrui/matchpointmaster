/**
 * Game phase utilities for managing the seasonal game cycle
 */

export enum GamePhase {
  DRAFT = 'draft', // January - Player draft
  TRAINING = 'training', // February-May, August-October
  INTRA_CLUB = 'intra_club', // End of May
  ZONAL = 'zonal', // June
  NATIONAL = 'national', // July
  TRAINING_2 = 'training_2', // August-October
  SINGLES_SELECTION = 'singles_selection', // End of October
  SINGLES_TOURNAMENT = 'singles_tournament', // November
  GRADUATION = 'graduation' // December
}

// SeasonData type is defined inline in SaveData to avoid circular dependencies
// This matches the structure: { year: number, month: number, phase: string }

/**
 * Get the current phase based on month
 */
export function getPhaseForMonth(month: number): GamePhase {
  switch (month) {
    case 1:
      return GamePhase.DRAFT
    case 2:
    case 3:
    case 4:
    case 5:
      return GamePhase.TRAINING
    case 6:
      return GamePhase.ZONAL
    case 7:
      return GamePhase.NATIONAL
    case 8:
    case 9:
    case 10:
      return GamePhase.TRAINING_2
    case 11:
      return GamePhase.SINGLES_TOURNAMENT
    case 12:
      return GamePhase.GRADUATION
    default:
      return GamePhase.TRAINING
  }
}

/**
 * Get phase display name
 */
export function getPhaseDisplayName(phase: GamePhase, month: number): string {
  switch (phase) {
    case GamePhase.DRAFT:
      return 'pre-draft'
    case GamePhase.TRAINING:
      if (month === 5) return 'pre-intra-club'
      return 'training'
    case GamePhase.INTRA_CLUB:
      return 'intra-club'
    case GamePhase.ZONAL:
      return 'zonal'
    case GamePhase.NATIONAL:
      return 'national'
    case GamePhase.TRAINING_2:
      if (month === 10) return 'pre-singles'
      return 'training'
    case GamePhase.SINGLES_SELECTION:
      return 'singles-selection'
    case GamePhase.SINGLES_TOURNAMENT:
      return 'singles-tournament'
    case GamePhase.GRADUATION:
      return 'post-singles'
    default:
      return 'training'
  }
}

/**
 * Get next phase
 */
export function getNextPhase(
  currentPhase: GamePhase,
  currentMonth: number
): {
  phase: GamePhase
  month: number
} {
  if (currentMonth === 12) {
    return { phase: GamePhase.DRAFT, month: 1 }
  }
  const nextMonth = currentMonth + 1
  return { phase: getPhaseForMonth(nextMonth), month: nextMonth }
}

/**
 * Initialize season data for a new game
 * Returns SeasonData with phase as string (to match SaveData type)
 * New games always start in January (DRAFT phase)
 */
export function initializeSeasonData(): {
  year: number
  month: number
  phase: string
} {
  const now = new Date()
  const currentYear = now.getFullYear()
  // New games always start in January (month 1) in the DRAFT phase
  return {
    year: currentYear,
    month: 1,
    phase: GamePhase.DRAFT as string
  }
}

// Explicit export to ensure module is recognized
export default {
  GamePhase,
  getPhaseForMonth,
  getPhaseDisplayName,
  getNextPhase,
  initializeSeasonData
}
