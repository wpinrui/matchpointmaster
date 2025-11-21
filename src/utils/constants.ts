import { Gender } from '../services/savegame/types'

/**
 * Gender options for form dropdowns
 */
export const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: Gender.MALE, label: 'Male' },
  { value: Gender.FEMALE, label: 'Female' }
] as const

