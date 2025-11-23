import React from 'react'
import { SaveData, Player } from '../types'

export function createAISchoolsUpdates(
  setSaveData: React.Dispatch<React.SetStateAction<SaveData>>
) {
  return {
    set: (schools: SaveData['aiSchools']) => {
      setSaveData((prevData) => ({
        ...prevData,
        aiSchools: schools
      }))
    },
    update: (schoolId: number, updates: Partial<SaveData['aiSchools'][0]>) => {
      setSaveData((prevData) => ({
        ...prevData,
        aiSchools: prevData.aiSchools.map((school) =>
          school.id === schoolId ? { ...school, ...updates } : school
        )
      }))
    },
    updateSchoolPlayers: (schoolId: number, players: Player[]) => {
      setSaveData((prevData) => ({
        ...prevData,
        aiSchools: prevData.aiSchools.map((school) =>
          school.id === schoolId ? { ...school, players } : school
        )
      }))
    },
    updateSchoolRoster: (schoolId: number, roster: string[]) => {
      setSaveData((prevData) => ({
        ...prevData,
        aiSchools: prevData.aiSchools.map((school) =>
          school.id === schoolId ? { ...school, teamRoster: roster } : school
        )
      }))
    }
  }
}
