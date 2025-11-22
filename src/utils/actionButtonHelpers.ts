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
 * Check if phase is a training phase
 */
export function isTrainingPhase(phase: string): boolean {
  return phase === GamePhase.TRAINING || phase === GamePhase.TRAINING_2
}
