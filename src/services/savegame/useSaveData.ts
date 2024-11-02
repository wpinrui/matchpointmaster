import { useState } from 'react'
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

export const useSaveData = () => {
  const [saveData, setSaveData] = useState<SaveData>(initialSaveData)

  const manager = saveData.manager
  const school = saveData.school

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
    crestPath: (crestPath: string) => updateAttribute('school', 'crestPath', crestPath),
    schoolColor: (color: string) => updateAttribute('school', 'color', color)
  }

  const saveToFile = () => {
    const json = JSON.stringify(saveData)
    localStorage.setItem('saveData', json)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'saveData.json'
    link.click()
  }

  const loadFromFile = () => {
    const savedData = localStorage.getItem('saveData')
    if (savedData) {
      setSaveData(JSON.parse(savedData))
    }
  }

  const resetSaveData = () => {
    setSaveData(initialSaveData)
  }

  return {
    saveData,
    manager,
    school,
    updateManager,
    updateSchool,
    saveToFile,
    loadFromFile,
    resetSaveData
  }
}
