/**
 * Shared constants used across the application
 */

import { Gender } from '../services/savegame/types'

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
