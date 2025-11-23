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
import { clearAllSaveSlots } from './indexedDBStorage'
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
import { createRoundRobinUpdates } from './updateHelpers/roundRobinUpdates'

export const useSaveData = () => {
  const [saveData, setSaveData] = useState<SaveData>(initialSaveData)
  const [currentSaveId, setCurrentSaveIdState] = useState<string | null>(
    getCurrentSaveId()
  )
  const [isLoading, setIsLoading] = useState(true)

  // Load initial save data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const data = await getCurrentSaveData()
        setSaveData(data)
      } catch (error) {
        console.error('Error loading initial save data:', error)
        setSaveData(initialSaveData)
      } finally {
        setIsLoading(false)
      }
    }
    loadInitialData()
  }, [])

  // Auto-save to current save slot whenever saveData changes
  useEffect(() => {
    if (currentSaveId && !isLoading) {
      updateSaveSlot(currentSaveId, saveData).catch((error) => {
        console.error('Error auto-saving:', error)
      })
    }
  }, [saveData, currentSaveId, isLoading])

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
  const exportToJson = async (): Promise<{ success: boolean; message: string }> => {
    try {
      if (!currentSaveId) {
        return {
          success: false,
          message: 'No active save to export. Please create or load a save first.'
        }
      }
      const slot = await getSaveSlot(currentSaveId)
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
  const loadSaveSlot = async (saveId: string) => {
    const slot = await getSaveSlot(saveId)
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
  const createNewSave = async (name: string, data?: SaveData) => {
    const dataToSave = data || saveData
    const newSlot = await createSaveSlot(name, dataToSave)
    setSaveData(dataToSave)
    setCurrentSaveIdState(newSlot.id)
    setCurrentSaveId(newSlot.id)
    return newSlot
  }

  /**
   * Clear current save data (reset to initial state)
   */
  const clearCurrentSave = async () => {
    setSaveData(initialSaveData)
    if (currentSaveId) {
      await updateSaveSlot(currentSaveId, initialSaveData)
    }
    // Clear the current save ID so the app knows there's no active save
    clearCurrentSaveId()
    setCurrentSaveIdState(null)
    // Clear match state from sessionStorage
    sessionStorage.removeItem('matchpointMaster_matchState')
    sessionStorage.removeItem('matchpointMaster_matchLogEvents')
    sessionStorage.removeItem('roundRobinMatch')
    sessionStorage.removeItem('roundRobinMatchResult')
    sessionStorage.removeItem('roundRobinMatchCompleted')
  }

  /**
   * Clear all save slots (delete all saves)
   */
  const clearAllSaves = async () => {
    await clearAllSaveSlots()
    setSaveData(initialSaveData)
    clearCurrentSaveId()
    setCurrentSaveIdState(null)
    // Clear match state from sessionStorage
    sessionStorage.removeItem('matchpointMaster_matchState')
    sessionStorage.removeItem('matchpointMaster_matchLogEvents')
    sessionStorage.removeItem('roundRobinMatch')
    sessionStorage.removeItem('roundRobinMatchResult')
    sessionStorage.removeItem('roundRobinMatchCompleted')
  }

  /**
   * Reset to initial save data and clear current save ID
   */
  const resetSaveData = () => {
    setSaveData(initialSaveData)
    setCurrentSaveIdState(null)
    setCurrentSaveId(null)
    // Clear match state from sessionStorage
    sessionStorage.removeItem('matchpointMaster_matchState')
    sessionStorage.removeItem('matchpointMaster_matchLogEvents')
    sessionStorage.removeItem('roundRobinMatch')
    sessionStorage.removeItem('roundRobinMatchResult')
    sessionStorage.removeItem('roundRobinMatchCompleted')
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
  const updateRoundRobinData = createRoundRobinUpdates(setSaveData)

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
    roundRobinData: saveData.roundRobinData,
    currentSaveId,
    isLoading,
    updateManager,
    updateSchool,
    updatePlayers,
    updateTeamRoster,
    updateSeason,
    updateTrainingPlan,
    updateSkillSnapshots,
    updateTrainingGoals,
    updateAISchools,
    updateRoundRobinData,
    markEmailAsRead,
    addEmail,
    exportToJson,
    loadSaveSlot,
    createNewSave,
    clearCurrentSave,
    clearAllSaves,
    resetSaveData
  }
}
