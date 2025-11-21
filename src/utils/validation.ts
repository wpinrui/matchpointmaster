import { SaveData } from '../services/savegame/types'

/**
 * Validates manager data to ensure all required fields are filled
 */
export const validateManagerData = (managerData: SaveData['manager']): boolean => {
  return (
    managerData.fullName.trim() !== '' &&
    managerData.shortName.trim() !== '' &&
    managerData.imagePath !== ''
  )
}

/**
 * Validates school data to ensure all required fields are filled
 */
export const validateSchoolData = (schoolData: SaveData['school']): boolean => {
  return (
    schoolData.name.trim() !== '' &&
    schoolData.crestPath !== '' &&
    schoolData.color.trim() !== ''
  )
}

