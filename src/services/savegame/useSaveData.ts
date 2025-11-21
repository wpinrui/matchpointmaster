import { useEffect, useState } from 'react'
import { initialSaveData } from './initialSaveData'
import {
  FavourStyle,
  Gender,
  GripStyle,
  Handedness,
  PlayStyle,
  RubberType,
  SaveData
} from './types'
import {
  getCurrentSaveData,
  getCurrentSaveId,
  setCurrentSaveId,
  updateSaveSlot,
  createSaveSlot,
  exportSaveSlotToJson,
  getSaveSlot
} from './saveManager'

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
    setSaveData((prevData) => ({
      ...prevData,
      [category]: {
        ...prevData[category],
        [key]: value
      }
    }))
  }

  const updateManager = {
    fullName: (newName: string) => updateAttribute('manager', 'fullName', newName),
    shortName: (newShortName: string) =>
      updateAttribute('manager', 'shortName', newShortName),
    gender: (newGender: Gender) => updateAttribute('manager', 'gender', newGender),
    imagePath: (newImagePath: string) =>
      updateAttribute('manager', 'imagePath', newImagePath),
    handedness: (newHandedness: Handedness) =>
      updateAttribute('manager', 'handedness', newHandedness),
    forehandRubber: (newRubber: RubberType) =>
      updateAttribute('manager', 'forehandRubber', newRubber),
    backhandRubber: (newRubber: RubberType) =>
      updateAttribute('manager', 'backhandRubber', newRubber),
    gripStyle: (newGripStyle: GripStyle) =>
      updateAttribute('manager', 'gripStyle', newGripStyle),
    forehandBackhandTendency: (newTendency: FavourStyle) =>
      updateAttribute('manager', 'forehandBackhandTendency', newTendency),
    playStyle: (newPlayStyle: PlayStyle) =>
      updateAttribute('manager', 'playStyle', newPlayStyle)
  }

  const updateSchool = {
    name: (newName: string) => updateAttribute('school', 'name', newName),
    crestPath: (crestPath: string) =>
      updateAttribute('school', 'crestPath', crestPath),
    primaryColor: (color: string) =>
      updateAttribute('school', 'primaryColor', color),
    secondaryColor: (color: string) =>
      updateAttribute('school', 'secondaryColor', color),
    accentColor: (color: string) => updateAttribute('school', 'accentColor', color)
  }

  /**
   * Export current save to JSON file (manual download)
   */
  const exportToJson = () => {
    try {
      if (!currentSaveId) {
        alert('No active save to export. Please create or load a save first.')
        return
      }
      const slot = getSaveSlot(currentSaveId)
      if (!slot) {
        alert('Save slot not found. Please try again.')
        return
      }
      const json = exportSaveSlotToJson(slot)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${slot.name.replace(/[^a-z0-9]/gi, '_')}_${slot.id.slice(0, 8)}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting save file:', error)
      alert('Failed to export save file. Please try again.')
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
  }

  /**
   * Reset to initial save data and clear current save ID
   */
  const resetSaveData = () => {
    setSaveData(initialSaveData)
    setCurrentSaveIdState(null)
    setCurrentSaveId(null)
  }

  return {
    saveData,
    manager: saveData.manager,
    school: saveData.school,
    currentSaveId,
    updateManager,
    updateSchool,
    exportToJson,
    loadSaveSlot,
    createNewSave,
    clearCurrentSave,
    resetSaveData
  }
}
