import { useEffect, useMemo, useRef } from 'react'
import { Gender } from '../services/savegame/types'
import { GamePhase } from '../utils/gamePhases'
import { generatePlayer, IntakeQuality } from '../utils/playerGeneration'
import {
  attractivenessToIntakeQuality,
  calculatePlayerPoolSize,
  calculateSchoolAttractiveness,
  calculateSchoolReputation
} from '../utils/schoolReputation'

interface UseHomeDraftPoolParams {
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

export function useHomeDraftPool({
  season,
  draftCompleted,
  players,
  manager,
  school,
  updatePlayers
}: UseHomeDraftPoolParams) {
  const hasInitializedDraftPoolRef = useRef<boolean>(false)

  // Calculate school reputation and attractiveness for draft pool initialization
  const calculatedSchoolReputation = useMemo(() => {
    return calculateSchoolReputation(school.reputationHistory || [])
  }, [school.reputationHistory])

  const schoolAttractiveness = useMemo(() => {
    if (!manager.stats) return 50 // Default
    return calculateSchoolAttractiveness(
      calculatedSchoolReputation,
      school.funding || 50,
      manager.stats.reputation
    )
  }, [calculatedSchoolReputation, school.funding, manager.stats])

  const intakeInfo = useMemo(() => {
    return attractivenessToIntakeQuality(schoolAttractiveness)
  }, [schoolAttractiveness])

  // Initialize draft player pool when entering draft phase
  useEffect(() => {
    // Only run during draft phase and if draft hasn't been completed
    if (season.phase !== GamePhase.DRAFT || draftCompleted) {
      // Reset the flag when leaving draft phase so it can initialize again next year
      if (season.phase !== GamePhase.DRAFT) {
        hasInitializedDraftPoolRef.current = false
      }
      return
    }

    // Only generate if we haven't already generated and there are no players
    if (hasInitializedDraftPoolRef.current || players.length > 0) {
      return
    }

    // Only generate if we have manager stats
    if (!manager.stats) {
      return
    }

    // Helper to pick a random element from an array
    const randomFromArray = <T>(array: T[]): T => {
      return array[Math.floor(Math.random() * array.length)]
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
    hasInitializedDraftPoolRef.current = true

    // Update players - this initializes the draft pool
    updatePlayers.set([...players, ...newPlayers])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    season.phase,
    draftCompleted,
    schoolAttractiveness,
    intakeInfo,
    school.teamType,
    manager.stats
  ])
}
