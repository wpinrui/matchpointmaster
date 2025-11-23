import { useMemo } from 'react'
import {
  calculateTeamExpectedImprovements,
  calculateTeamExpectedSummary
} from '../utils/trainingPreview'
import {
  getMaxCoachingSlots,
  getRecommendedTrainingFocus,
  isTournamentPrepPhase
} from '../utils/trainingPlans'

interface UseTrainingCalculationsParams {
  players: any[]
  teamRoster: string[]
  trainingPlan: any
  manager: { stats?: any; playStyle: any }
  school: { funding?: number }
  season: { phase: string; month: number }
}

export function useTrainingCalculations({
  players,
  teamRoster,
  trainingPlan,
  manager,
  school,
  season
}: UseTrainingCalculationsParams) {
  // Get max coaching slots
  const maxCoachingSlots = useMemo(() => {
    if (!manager.stats) return 5
    return getMaxCoachingSlots(manager.stats.coachingEffectiveness)
  }, [manager.stats])

  // Get recommended focus for current phase
  const recommendedFocus = useMemo(() => {
    return getRecommendedTrainingFocus(season.phase, season.month)
  }, [season.phase, season.month])

  // Check if we're in tournament prep phase
  const isTournamentPrep = useMemo(() => {
    return isTournamentPrepPhase(season.phase, season.month)
  }, [season.phase, season.month])

  // Calculate expected improvements for preview
  const expectedImprovements = useMemo(() => {
    if (!trainingPlan) return []
    return calculateTeamExpectedImprovements(
      players,
      teamRoster,
      trainingPlan,
      manager.stats,
      manager.playStyle,
      school.funding || 50
    )
  }, [
    players,
    teamRoster,
    trainingPlan,
    manager.stats,
    manager.playStyle,
    school.funding
  ])

  const expectedSummary = useMemo(() => {
    return calculateTeamExpectedSummary(expectedImprovements)
  }, [expectedImprovements])

  return {
    maxCoachingSlots,
    recommendedFocus,
    isTournamentPrep,
    expectedImprovements,
    expectedSummary
  }
}
