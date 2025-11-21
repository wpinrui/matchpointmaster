import { SaveData } from '../services/savegame/types'

export type ManagerValidationErrors = {
  fullName?: string
  shortName?: string
  imagePath?: string
}

export type SchoolValidationErrors = {
  name?: string
  crestPath?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
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
  if (!schoolData.primaryColor.trim()) {
    errors.primaryColor = 'Primary color is required'
  }
  if (!schoolData.secondaryColor.trim()) {
    errors.secondaryColor = 'Secondary color is required'
  }
  if (!schoolData.accentColor.trim()) {
    errors.accentColor = 'Accent color is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
