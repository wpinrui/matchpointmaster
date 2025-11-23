import { useEffect, useState } from 'react'
import { initialSaveData } from './initialSaveData'
import { SaveData } from './types'
import {
  getCurrentSaveData,
  getCurrentSaveId,
  setCurrentSaveId,
  clearCurrentSaveId,
  updateSaveSlot,
  createSaveSlot,
  exportSaveSlotToJson,
  getSaveSlot
} from './saveManager'
import { downloadJsonFile, sanitizeFilename } from '../../utils/fileDownload'
import { createManagerUpdates } from './updateHelpers/managerUpdates'
import { createSchoolUpdates } from './updateHelpers/schoolUpdates'
import { createPlayerUpdates } from './updateHelpers/playerUpdates'
import { createTeamRosterUpdates } from './updateHelpers/teamRosterUpdates'
import { createSeasonUpdates } from './updateHelpers/seasonUpdates'
import { createTrainingPlanUpdates } from './updateHelpers/trainingPlanUpdates'
import { createTrainingGoalsUpdates } from './updateHelpers/trainingGoalsUpdates'
import { createAISchoolsUpdates } from './updateHelpers/aiSchoolsUpdates'
import { createSkillSnapshotsUpdates } from './updateHelpers/skillSnapshotsUpdates'

export const useSaveData = () => {
  const [saveData, setSaveData] = useState<SaveData>(getCurrentSaveData())
  const [currentSaveId, setCurrentSaveIdState] = useState<string | null>(
    getCurrentSaveId()
  )

  // Auto-save to current save slot whenever saveData changes
  useEffect(() => {
    if (currentSaveId) {
      updateSaveSlot(currentSaveId, saveData)
    }
  }, [saveData, currentSaveId])

  const updateAttribute = <T extends keyof SaveData, K extends keyof SaveData[T]>(
    category: T,
    key: K,
    value: SaveData[T][K]
  ) => {
    setSaveData((prevData) => {
      const categoryData = prevData[category]
      if (
        typeof categoryData === 'object' &&
        categoryData !== null &&
        !Array.isArray(categoryData)
      ) {
        return {
          ...prevData,
          [category]: {
            ...categoryData,
            [key]: value
          }
        }
      }
      return prevData
    })
  }

  const updateManager = createManagerUpdates(updateAttribute)
  const updateSchool = createSchoolUpdates(updateAttribute)
  const updatePlayers = createPlayerUpdates(setSaveData)
  const updateTeamRoster = createTeamRosterUpdates(setSaveData)

  /**
   * Export current save to JSON file (manual download)
   * Returns { success: boolean, message: string } to allow components to show dialogs
   */
  const exportToJson = (): { success: boolean; message: string } => {
    try {
      if (!currentSaveId) {
        return {
          success: false,
          message: 'No active save to export. Please create or load a save first.'
        }
      }
      const slot = getSaveSlot(currentSaveId)
      if (!slot) {
        return {
          success: false,
          message: 'Save slot not found. Please try again.'
        }
      }
      const json = exportSaveSlotToJson(slot)
      const filename = `${sanitizeFilename(slot.name)}_${slot.id.slice(0, 8)}.json`
      downloadJsonFile(json, filename)
      return {
        success: true,
        message: 'Save exported successfully!'
      }
    } catch (error) {
      console.error('Error exporting save file:', error)
      return {
        success: false,
        message: 'Failed to export save file. Please try again.'
      }
    }
  }

  /**
   * Load a specific save slot
   */
  const loadSaveSlot = (saveId: string) => {
    const slot = getSaveSlot(saveId)
    if (slot) {
      setSaveData(slot.data)
      setCurrentSaveIdState(saveId)
      setCurrentSaveId(saveId)
    }
  }

  /**
   * Create a new save slot and set it as current
   * Optionally accepts save data, otherwise uses current saveData
   */
  const createNewSave = (name: string, data?: SaveData) => {
    const dataToSave = data || saveData
    const newSlot = createSaveSlot(name, dataToSave)
    setSaveData(dataToSave)
    setCurrentSaveIdState(newSlot.id)
    setCurrentSaveId(newSlot.id)
    return newSlot
  }

  /**
   * Clear current save data (reset to initial state)
   */
  const clearCurrentSave = () => {
    setSaveData(initialSaveData)
    if (currentSaveId) {
      updateSaveSlot(currentSaveId, initialSaveData)
    }
    // Clear the current save ID so the app knows there's no active save
    clearCurrentSaveId()
    setCurrentSaveIdState(null)
  }

  /**
   * Reset to initial save data and clear current save ID
   */
  const resetSaveData = () => {
    setSaveData(initialSaveData)
    setCurrentSaveIdState(null)
    setCurrentSaveId(null)
  }

  const updateSeason = createSeasonUpdates(setSaveData)

  const markEmailAsRead = (emailId: string) => {
    setSaveData((prevData) => ({
      ...prevData,
      emails: prevData.emails.map((email) =>
        email.id === emailId ? { ...email, read: true } : email
      )
    }))
  }

  const addEmail = (email: SaveData['emails'][0]) => {
    setSaveData((prevData) => ({
      ...prevData,
      emails: [...prevData.emails, email]
    }))
  }

  const updateSkillSnapshots = createSkillSnapshotsUpdates(setSaveData)
  const updateTrainingPlan = createTrainingPlanUpdates(setSaveData)
  const updateTrainingGoals = createTrainingGoalsUpdates(setSaveData)
  const updateAISchools = createAISchoolsUpdates(setSaveData)

  return {
    saveData,
    manager: saveData.manager,
    school: saveData.school,
    players: saveData.players,
    teamRoster: saveData.teamRoster,
    season: saveData.season,
    draftCompleted: saveData.draftCompleted,
    emails: saveData.emails,
    trainingPlan: saveData.trainingPlan,
    skillSnapshots: saveData.skillSnapshots,
    trainingGoals: saveData.trainingGoals,
    aiSchools: saveData.aiSchools,
    currentSaveId,
    updateManager,
    updateSchool,
    updatePlayers,
    updateTeamRoster,
    updateSeason,
    updateTrainingPlan,
    updateSkillSnapshots,
    updateTrainingGoals,
    updateAISchools,
    markEmailAsRead,
    addEmail,
    exportToJson,
    loadSaveSlot,
    createNewSave,
    clearCurrentSave,
    resetSaveData
  }
}
