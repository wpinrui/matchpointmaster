/**
 * Save Data Migrations
 * Handles backward compatibility when loading old save files
 */

import { initializeSeasonData } from '../../utils/gamePhases'
import { SaveData } from './types'

/**
 * Migrate save data to the latest version
 * Adds missing fields with default values for backward compatibility
 */
export function migrateSaveData(data: SaveData): SaveData {
  const migrated = { ...data }

  // Ensure manager stats exist
  if (!migrated.manager.stats) {
    migrated.manager.stats = {
      reputation: 15,
      coachingEffectiveness: 15
    }
  }

  // Ensure teamRoster exists
  if (!migrated.teamRoster) {
    migrated.teamRoster = []
  }

  // Ensure school reputation exists
  if (migrated.school.reputation === undefined) {
    migrated.school.reputation = 50 // Default starting reputation rank
  }

  // Ensure school funding exists
  if (migrated.school.funding === undefined) {
    migrated.school.funding = 50 // Default starting funding rank
  }

  // Ensure school reputation history exists
  if (!migrated.school.reputationHistory) {
    migrated.school.reputationHistory = []
  }

  // Ensure school funding history exists
  if (!migrated.school.fundingHistory) {
    migrated.school.fundingHistory = []
  }

  // Ensure season data exists
  if (!migrated.season) {
    migrated.season = initializeSeasonData()
  }

  // Ensure draftCompleted exists
  if (migrated.draftCompleted === undefined) {
    migrated.draftCompleted = false
  }

  // Ensure emails array exists
  if (!migrated.emails) {
    migrated.emails = []
  }

  return migrated
}

/**
 * Check if save data needs migration
 */
export function needsMigration(data: SaveData): boolean {
  return (
    !data.manager.stats ||
    !data.teamRoster ||
    data.school.reputation === undefined ||
    data.school.funding === undefined ||
    !data.school.reputationHistory ||
    !data.school.fundingHistory ||
    !data.school.teamType ||
    !data.season ||
    data.draftCompleted === undefined ||
    !data.emails
  )
}
