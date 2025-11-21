import { SaveData } from '../services/savegame/types'

export type ManagerValidationErrors = {
  fullName?: string
  shortName?: string
  imagePath?: string
}

export type SchoolValidationErrors = {
  name?: string
  crestPath?: string
  color?: string
}

/**
 * Validates manager data and returns errors
 */
export const validateManagerData = (
  managerData: SaveData['manager']
): { isValid: boolean; errors: ManagerValidationErrors } => {
  const errors: ManagerValidationErrors = {}

  if (!managerData.fullName.trim()) {
    errors.fullName = 'Full name is required'
  }
  if (!managerData.shortName.trim()) {
    errors.shortName = 'Short name is required'
  }
  if (!managerData.imagePath) {
    errors.imagePath = 'Profile image is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validates school data and returns errors
 */
export const validateSchoolData = (
  schoolData: SaveData['school']
): { isValid: boolean; errors: SchoolValidationErrors } => {
  const errors: SchoolValidationErrors = {}

  if (!schoolData.name.trim()) {
    errors.name = 'School name is required'
  }
  if (!schoolData.crestPath) {
    errors.crestPath = 'School crest is required'
  }
  if (!schoolData.color.trim()) {
    errors.color = 'School color is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

