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
  clearCurrentSaveId,
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
      updateAttribute('manager', 'playStyle', newPlayStyle),
    stats: (newStats: SaveData['manager']['stats']) =>
      updateAttribute('manager', 'stats', newStats)
  }

  const updateSchool = {
    name: (newName: string) => updateAttribute('school', 'name', newName),
    crestPath: (crestPath: string) => updateAttribute('school', 'crestPath', crestPath),
    primaryColor: (color: string) => updateAttribute('school', 'primaryColor', color),
    secondaryColor: (color: string) => updateAttribute('school', 'secondaryColor', color),
    accentColor: (color: string) => updateAttribute('school', 'accentColor', color),
    reputation: (reputation: number) =>
      updateAttribute('school', 'reputation', reputation)
  }

  const updatePlayers = {
    add: (player: SaveData['players'][0]) => {
      setSaveData((prevData) => ({
        ...prevData,
        players: [...prevData.players, player]
      }))
    },
    remove: (playerId: string) => {
      setSaveData((prevData) => ({
        ...prevData,
        players: prevData.players.filter((p) => p.id !== playerId),
        teamRoster: prevData.teamRoster.filter((id) => id !== playerId)
      }))
    },
    set: (players: SaveData['players']) => {
      setSaveData((prevData) => ({
        ...prevData,
        players
      }))
    },
    update: (playerId: string, updates: Partial<SaveData['players'][0]>) => {
      setSaveData((prevData) => ({
        ...prevData,
        players: prevData.players.map((p) =>
          p.id === playerId ? { ...p, ...updates } : p
        )
      }))
    }
  }

  const updateTeamRoster = {
    add: (playerId: string) => {
      setSaveData((prevData) => {
        // Don't add if already on team
        if (prevData.teamRoster.includes(playerId)) {
          return prevData
        }
        return {
          ...prevData,
          teamRoster: [...prevData.teamRoster, playerId]
        }
      })
    },
    remove: (playerId: string) => {
      setSaveData((prevData) => ({
        ...prevData,
        teamRoster: prevData.teamRoster.filter((id) => id !== playerId)
      }))
    },
    set: (playerIds: string[]) => {
      setSaveData((prevData) => ({
        ...prevData,
        teamRoster: playerIds
      }))
    },
    clear: () => {
      setSaveData((prevData) => ({
        ...prevData,
        teamRoster: []
      }))
    }
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

  const updateSeason = {
    setPhase: (phase: string) => {
      setSaveData((prevData) => ({
        ...prevData,
        season: {
          ...prevData.season,
          phase
        }
      }))
    },
    setMonth: (month: number) => {
      setSaveData((prevData) => ({
        ...prevData,
        season: {
          ...prevData.season,
          month
        }
      }))
    },
    setYear: (year: number) => {
      setSaveData((prevData) => ({
        ...prevData,
        season: {
          ...prevData.season,
          year
        }
      }))
    },
    setDraftCompleted: (completed: boolean) => {
      setSaveData((prevData) => ({
        ...prevData,
        draftCompleted: completed
      }))
    }
  }

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

  return {
    saveData,
    manager: saveData.manager,
    school: saveData.school,
    players: saveData.players,
    teamRoster: saveData.teamRoster,
    season: saveData.season,
    draftCompleted: saveData.draftCompleted,
    emails: saveData.emails,
    currentSaveId,
    updateManager,
    updateSchool,
    updatePlayers,
    updateTeamRoster,
    updateSeason,
    markEmailAsRead,
    addEmail,
    exportToJson,
    loadSaveSlot,
    createNewSave,
    clearCurrentSave,
    resetSaveData
  }
}
