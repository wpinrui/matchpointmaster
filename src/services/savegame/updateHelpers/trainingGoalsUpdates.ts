import React from 'react'
import { SaveData } from '../types'

export function createTrainingGoalsUpdates(
  setSaveData: React.Dispatch<React.SetStateAction<SaveData>>
) {
  return {
    add: (goal: SaveData['trainingGoals'][0]) => {
      setSaveData((prevData) => ({
        ...prevData,
        trainingGoals: [...prevData.trainingGoals, goal]
      }))
    },
    remove: (goalId: string) => {
      setSaveData((prevData) => ({
        ...prevData,
        trainingGoals: prevData.trainingGoals.filter((g) => g.id !== goalId)
      }))
    },
    update: (goalId: string, updates: Partial<SaveData['trainingGoals'][0]>) => {
      setSaveData((prevData) => ({
        ...prevData,
        trainingGoals: prevData.trainingGoals.map((g) =>
          g.id === goalId ? { ...g, ...updates } : g
        )
      }))
    },
    set: (goals: SaveData['trainingGoals']) => {
      setSaveData((prevData) => ({
        ...prevData,
        trainingGoals: goals
      }))
    }
  }
}
