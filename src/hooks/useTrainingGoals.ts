import { useMemo } from 'react'
import { TrainingGoal } from '../services/savegame/types'
import { getSuggestedGoals, updateGoalProgress } from '../utils/trainingGoals'

interface UseTrainingGoalsParams {
  trainingGoals: TrainingGoal[]
  season: { year: number; month: number }
  players: any[]
  teamRoster: string[]
  skillSnapshots: any[]
}

export function useTrainingGoals({
  trainingGoals,
  season,
  players,
  teamRoster,
  skillSnapshots
}: UseTrainingGoalsParams) {
  // Get active goals for current period
  const activeGoals = useMemo(() => {
    return trainingGoals.filter(
      (goal) => !goal.completed && goal.year === season.year && goal.month >= season.month
    )
  }, [trainingGoals, season])

  // Update goal progress
  const goalsWithProgress = useMemo(() => {
    const previousMonthSnapshots = skillSnapshots.filter(
      (s) => s.month === season.month - 1 && s.year === season.year
    )
    return activeGoals.map((goal) =>
      updateGoalProgress(goal, players, teamRoster, previousMonthSnapshots)
    )
  }, [activeGoals, players, teamRoster, skillSnapshots, season])

  // Get suggested goals
  const suggestions = useMemo(() => {
    return getSuggestedGoals(players, teamRoster, season.month, season.year)
  }, [players, teamRoster, season])

  return {
    activeGoals,
    goalsWithProgress,
    suggestions
  }
}

