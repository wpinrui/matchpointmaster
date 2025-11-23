/**
 * Helper utilities for action button logic
 */

import { GamePhase } from './gamePhases'
import { isPhaseImplemented } from './phaseProgression'
import { Screens } from '../screen_manager/screens'

export interface ActionButtonConfig {
  text: string
  disabled?: boolean
  action: () => void
}

/**
 * Get action button configuration for draft phase
 */
export function getDraftActionButton(
  draftCompleted: boolean,
  changeScreen: (screen: Screens) => void
): ActionButtonConfig | null {
  if (!draftCompleted) {
    return {
      text: 'Go to Draft',
      action: () => changeScreen(Screens.DRAFT)
    }
  }
  return null
}

/**
 * Get action button configuration for training phase
 */
export function getTrainingActionButton(
  changeScreen: (screen: Screens) => void
): ActionButtonConfig {
  return {
    text: 'Open Training',
    action: () => changeScreen(Screens.TRAINING)
  }
}

/**
 * Get action button configuration for intra-club round-robin phase
 */
export function getIntraClubActionButton(
  changeScreen: (screen: Screens) => void,
  roundRobinData?: any
): ActionButtonConfig {
  // Check if any tournament has started
  const tournamentStarted = roundRobinData
    ? Object.values(roundRobinData.teamResults || {}).some(
        (result: any) => result !== null && result.tournamentStarted === true
      )
    : false

  return {
    text: tournamentStarted ? 'Continue Round-Robin' : 'Start Round-Robin',
    action: () => changeScreen(Screens.ROUND_ROBIN)
  }
}

/**
 * Check if phase is a training phase
 */
export function isTrainingPhase(phase: string): boolean {
  return phase === GamePhase.TRAINING || phase === GamePhase.TRAINING_2
}
