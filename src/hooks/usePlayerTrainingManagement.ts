import { useState } from 'react'
import { TrainingFocus, PlayerTraining } from '../services/savegame/types'

interface UsePlayerTrainingManagementParams {
  trainingPlan: any
  maxCoachingSlots: number
  updateTrainingPlan: {
    addPlayerAssignment: (assignment: PlayerTraining) => void
    removePlayerAssignment: (playerId: string) => void
  }
  setShowCoachingSlotsDialog: (show: boolean) => void
  setCoachingSlotsMessage: (message: string) => void
}

export function usePlayerTrainingManagement({
  trainingPlan,
  maxCoachingSlots,
  updateTrainingPlan,
  setShowCoachingSlotsDialog,
  setCoachingSlotsMessage
}: UsePlayerTrainingManagementParams) {
  const [selectedPlayerForTraining, setSelectedPlayerForTraining] = useState<
    string | null
  >(null)

  // Get player training assignment
  const getPlayerTraining = (playerId: string): PlayerTraining | null => {
    if (!trainingPlan) return null
    return trainingPlan.playerAssignments.find((a) => a.playerId === playerId) || null
  }

  // Check if player has individual coaching
  const hasIndividualCoaching = (playerId: string): boolean => {
    const assignment = getPlayerTraining(playerId)
    return assignment?.isIndividualCoaching ?? false
  }

  // Get training focus for a player (individual or team)
  const getPlayerFocus = (playerId: string): TrainingFocus | null => {
    if (!trainingPlan) return null
    const assignment = getPlayerTraining(playerId)
    if (assignment?.focus) return assignment.focus
    return trainingPlan.teamFocus
  }

  // Handle setting individual player training
  const handleSetPlayerTraining = (
    playerId: string,
    focus: TrainingFocus | null,
    isIndividualCoaching: boolean
  ) => {
    if (!trainingPlan) return

    // Check coaching slots
    const currentSlotsUsed = trainingPlan.coachingSlotsUsed
    const hasCoaching = hasIndividualCoaching(playerId)

    // If adding coaching and no slots available, don't allow
    if (isIndividualCoaching && !hasCoaching && currentSlotsUsed >= maxCoachingSlots) {
      setCoachingSlotsMessage(`No coaching slots available. Maximum: ${maxCoachingSlots}`)
      setShowCoachingSlotsDialog(true)
      return
    }

    if (focus === null) {
      // Remove individual assignment, player follows team training
      updateTrainingPlan.removePlayerAssignment(playerId)
    } else {
      // Add or update individual assignment
      const assignment: PlayerTraining = {
        playerId,
        focus,
        isIndividualCoaching
      }
      updateTrainingPlan.addPlayerAssignment(assignment)
    }
    setSelectedPlayerForTraining(null)
  }

  // Handle removing individual training (player follows team)
  const handleRemovePlayerTraining = (playerId: string) => {
    updateTrainingPlan.removePlayerAssignment(playerId)
  }

  return {
    selectedPlayerForTraining,
    setSelectedPlayerForTraining,
    getPlayerTraining,
    hasIndividualCoaching,
    getPlayerFocus,
    handleSetPlayerTraining,
    handleRemovePlayerTraining
  }
}
