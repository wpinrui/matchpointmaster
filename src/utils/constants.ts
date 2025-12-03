/**
 * Shared constants used across the application
 */

import { Gender } from '../services/savegame/types'

/**
 * Storage keys for sessionStorage and localStorage
 */
export const STORAGE_KEYS = {
  // Session storage keys
  ROUND_ROBIN_MATCH: 'roundRobinMatch',
  ROUND_ROBIN_MATCH_RESULT: 'roundRobinMatchResult',
  ROUND_ROBIN_MATCH_COMPLETED: 'roundRobinMatchCompleted',
  MATCH_STATE: 'matchpointMaster_matchState',
  MATCH_LOG_EVENTS: 'matchpointMaster_matchLogEvents',
  SELECTED_EMAIL_ID: 'selectedEmailId',
  RECOMMENDED_TRAINING_FOCUS: 'recommendedTrainingFocus',
  MATCH_CONTEXT: 'matchContext',
  // Local storage keys
  CURRENT_SAVE_ID: 'matchpointMaster_currentSaveId'
} as const

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const

export interface GenderOption {
  value: Gender
  label: string
}

export const GENDER_OPTIONS: GenderOption[] = [
  { value: Gender.MALE, label: 'Male' },
  { value: Gender.FEMALE, label: 'Female' }
]
