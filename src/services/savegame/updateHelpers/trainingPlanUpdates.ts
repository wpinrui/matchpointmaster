import React from 'react'
import { SaveData, TrainingFocus, PlayerTraining } from '../types'

export function createTrainingPlanUpdates(
  setSaveData: React.Dispatch<React.SetStateAction<SaveData>>
) {
  return {
    set: (plan: SaveData['trainingPlan']) => {
      setSaveData((prevData) => ({
        ...prevData,
        trainingPlan: plan
      }))
    },
    setTeamFocus: (focus: TrainingFocus | null) => {
      setSaveData((prevData) => ({
        ...prevData,
        trainingPlan: prevData.trainingPlan
          ? { ...prevData.trainingPlan, teamFocus: focus }
          : null
      }))
    },
    addPlayerAssignment: (assignment: PlayerTraining) => {
      setSaveData((prevData) => {
        if (!prevData.trainingPlan) return prevData
        const existingIndex = prevData.trainingPlan.playerAssignments.findIndex(
          (a) => a.playerId === assignment.playerId
        )
        const newAssignments =
          existingIndex >= 0
            ? prevData.trainingPlan.playerAssignments.map((a, i) =>
                i === existingIndex ? assignment : a
              )
            : [...prevData.trainingPlan.playerAssignments, assignment]

        const slotsUsed = newAssignments.filter((a) => a.isIndividualCoaching).length

        return {
          ...prevData,
          trainingPlan: {
            ...prevData.trainingPlan,
            playerAssignments: newAssignments,
            coachingSlotsUsed: slotsUsed
          }
        }
      })
    },
    removePlayerAssignment: (playerId: string) => {
      setSaveData((prevData) => {
        if (!prevData.trainingPlan) return prevData
        const newAssignments = prevData.trainingPlan.playerAssignments.filter(
          (a) => a.playerId !== playerId
        )
        const slotsUsed = newAssignments.filter((a) => a.isIndividualCoaching).length

        return {
          ...prevData,
          trainingPlan: {
            ...prevData.trainingPlan,
            playerAssignments: newAssignments,
            coachingSlotsUsed: slotsUsed
          }
        }
      })
    },
    setCompleted: (completed: boolean) => {
      setSaveData((prevData) => ({
        ...prevData,
        trainingPlan: prevData.trainingPlan
          ? { ...prevData.trainingPlan, completed }
          : null
      }))
    },
    setMonthAndYear: (month: number, year: number) => {
      setSaveData((prevData) => ({
        ...prevData,
        trainingPlan: prevData.trainingPlan
          ? { ...prevData.trainingPlan, month, year }
          : null
      }))
    }
  }
}
