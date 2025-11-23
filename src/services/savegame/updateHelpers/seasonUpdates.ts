import React from 'react'
import { SaveData } from '../types'

export function createSeasonUpdates(
  setSaveData: React.Dispatch<React.SetStateAction<SaveData>>
) {
  // Helper to update season properties
  const updateSeasonProperty = <K extends keyof SaveData['season']>(
    key: K,
    value: SaveData['season'][K]
  ) => {
    setSaveData((prevData) => ({
      ...prevData,
      season: {
        ...prevData.season,
        [key]: value
      }
    }))
  }

  return {
    setPhase: (phase: string) => updateSeasonProperty('phase', phase),
    setMonth: (month: number) => updateSeasonProperty('month', month),
    setYear: (year: number) => updateSeasonProperty('year', year),
    setDraftCompleted: (completed: boolean) => {
      setSaveData((prevData) => ({
        ...prevData,
        draftCompleted: completed
      }))
    }
  }
}
