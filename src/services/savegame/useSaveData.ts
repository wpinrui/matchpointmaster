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

const STORAGE_KEY = 'saveData'

const loadFromLocalStorage = (): SaveData => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (!savedData) {
      return initialSaveData
    }
    const parsed = JSON.parse(savedData)
    // Basic validation - ensure parsed data has expected structure
    if (
      parsed &&
      typeof parsed === 'object' &&
      'manager' in parsed &&
      'school' in parsed
    ) {
      // Ensure players array exists
      if (!parsed.players || !Array.isArray(parsed.players)) {
        parsed.players = []
      }
      return parsed as SaveData
    }
    console.warn('Invalid save data structure, using initial data')
    return initialSaveData
  } catch (error) {
    console.error('Error loading save data from localStorage:', error)
    return initialSaveData
  }
}

const saveToLocalStorage = (data: SaveData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving data to localStorage:', error)
    // Could show user notification here in the future
  }
}

export const useSaveData = () => {
  const [saveData, setSaveData] = useState<SaveData>(loadFromLocalStorage)

  useEffect(() => {
    saveToLocalStorage(saveData)
  }, [saveData])

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
        players: prevData.players.filter((p) => p.id !== playerId)
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

  const saveToFile = () => {
    try {
      const json = JSON.stringify(saveData, null, 2)
      saveToLocalStorage(saveData)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'saveData.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // Clean up the object URL to prevent memory leaks
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error saving file:', error)
      alert('Failed to save file. Please try again.')
    }
  }

  const loadFromLocalStorageData = () => {
    const loadedData = loadFromLocalStorage()
    setSaveData(loadedData)
  }

  const resetSaveData = () => {
    setSaveData(initialSaveData)
  }

  return {
    saveData,
    manager: saveData.manager,
    school: saveData.school,
    players: saveData.players,
    updateManager,
    updateSchool,
    updatePlayers,
    saveToFile,
    loadFromLocalStorageData,
    resetSaveData
  }
}
