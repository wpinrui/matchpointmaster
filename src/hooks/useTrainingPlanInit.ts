import { useEffect } from 'react'
import { GamePhase } from '../utils/gamePhases'
import { TrainingFocus } from '../services/savegame/types'
import { initializeTrainingPlan } from '../utils/trainingPlans'

interface UseTrainingPlanInitParams {
  season: { phase: string; month: number; year: number }
  trainingPlan: any
  updateTrainingPlan: {
    set: (plan: any) => void
    setTeamFocus: (focus: TrainingFocus | null) => void
  }
}

export function useTrainingPlanInit({
  season,
  trainingPlan,
  updateTrainingPlan
}: UseTrainingPlanInitParams) {
  useEffect(() => {
    const isTrainingPhase =
      season.phase === GamePhase.TRAINING || season.phase === GamePhase.TRAINING_2

    if (isTrainingPhase && !trainingPlan) {
      const newPlan = initializeTrainingPlan(season.year, season.month)
      updateTrainingPlan.set(newPlan)
    }

    // Check for recommended focus from TrainingInsightsCard
    const recommendedFocus = sessionStorage.getItem('recommendedTrainingFocus')
    if (recommendedFocus && trainingPlan && !trainingPlan.teamFocus) {
      const focus = recommendedFocus as TrainingFocus
      updateTrainingPlan.setTeamFocus(focus)
      sessionStorage.removeItem('recommendedTrainingFocus')
    }
  }, [season, trainingPlan, updateTrainingPlan])
}

