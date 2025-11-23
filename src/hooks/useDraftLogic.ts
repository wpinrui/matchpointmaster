import { useEffect, useMemo, useRef } from 'react'
import { Gender } from '../services/savegame/types'
import { generatePlayer, IntakeQuality } from '../utils/playerGeneration'
import {
  attractivenessToIntakeQuality,
  calculateMaxTeamSize,
  calculatePlayerPoolSize,
  calculateSchoolAttractiveness,
  calculateSchoolReputation
} from '../utils/schoolReputation'

interface UseDraftLogicParams {
  season: { phase: string; month: number; year: number }
  draftCompleted: boolean
  players: any[]
  manager: { stats?: any }
  school: {
    reputationHistory?: any[]
    funding?: number
    teamType: 'boys' | 'girls' | 'both'
  }
  updatePlayers: { set: (players: any[]) => void }
}

export function useDraftLogic({
  season,
  draftCompleted,
  players,
  manager,
  school,
  updatePlayers
}: UseDraftLogicParams) {
  const hasGeneratedInitialPoolRef = useRef<boolean>(false)

  // Helper to pick a random element from an array
  const randomFromArray = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
  }

  // Calculate school reputation from history
  const calculatedSchoolReputation = useMemo(() => {
    return calculateSchoolReputation(school.reputationHistory || [])
  }, [school.reputationHistory])

  // Calculate school attractiveness (combines reputation, funding, and coach)
  const schoolAttractiveness = useMemo(() => {
    if (!manager.stats) return 50 // Default
    return calculateSchoolAttractiveness(
      calculatedSchoolReputation,
      school.funding || 50,
      manager.stats.reputation
    )
  }, [calculatedSchoolReputation, school.funding, manager.stats])

  // Get intake quality based on attractiveness
  const intakeInfo = useMemo(() => {
    return attractivenessToIntakeQuality(schoolAttractiveness)
  }, [schoolAttractiveness])

  // Calculate max team size based on funding
  const maxTeamSize = useMemo(() => {
    return calculateMaxTeamSize(school.funding, school.teamType)
  }, [school.funding, school.teamType])

  // Generate initial player pool ONCE when draft screen first loads
  useEffect(() => {
    // Only run during draft phase
    if (season.phase !== 'draft' || draftCompleted) {
      return
    }

    // Only generate if we haven't already generated and there are no players
    if (hasGeneratedInitialPoolRef.current || players.length > 0) {
      return
    }

    // Only generate if we have manager stats
    if (!manager.stats) {
      return
    }

    // Calculate pool size (7-15) based on school attractiveness
    const poolSize = calculatePlayerPoolSize(schoolAttractiveness)

    // Get player quality based on attractiveness
    const intakeQualityMap: Record<string, IntakeQuality> = {
      poor: IntakeQuality.POOR,
      below_average: IntakeQuality.BELOW_AVERAGE,
      average: IntakeQuality.AVERAGE,
      above_average: IntakeQuality.ABOVE_AVERAGE,
      excellent: IntakeQuality.EXCELLENT
    }
    const playerQuality = intakeQualityMap[intakeInfo.quality] || IntakeQuality.AVERAGE

    // Determine which gender(s) to generate based on team type
    const gendersToGenerate: Gender[] =
      school.teamType === 'boys'
        ? [Gender.MALE]
        : school.teamType === 'girls'
          ? [Gender.FEMALE]
          : [Gender.MALE, Gender.FEMALE]

    // Generate all players at once
    const newPlayers = Array.from({ length: poolSize }, () => {
      const gender = randomFromArray(gendersToGenerate)
      return generatePlayer(playerQuality, 1, gender)
    })

    // Mark as generated BEFORE updating to prevent double generation
    hasGeneratedInitialPoolRef.current = true

    // Update players - this is the ONLY time we generate players
    updatePlayers.set([...players, ...newPlayers])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolAttractiveness, intakeInfo.quality, school.teamType]) // Only run once when these values are ready

  return {
    calculatedSchoolReputation,
    schoolAttractiveness,
    intakeInfo,
    maxTeamSize
  }
}
