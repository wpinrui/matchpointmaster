/**
 * Apply player progression when advancing phase
 * Processes all players on the team and applies skill improvements based on training
 */
import {
  Player,
  SaveData,
  TrainingPlan,
  PlayerTraining
} from '../services/savegame/types'
import { calculatePlayerProgression, applySkillImprovements } from './playerProgression'
import { GamePhase } from './gamePhases'

/**
 * Process player progression for all players on the team
 * Returns updated players array with skill improvements applied
 */
export function processPlayerProgression(
  players: Player[],
  teamRoster: string[],
  trainingPlan: TrainingPlan | null,
  manager: SaveData['manager'],
  school: SaveData['school'],
  currentPhase: string,
  currentMonth: number
): Player[] {
  // Only process progression if we're leaving a training phase
  const isLeavingTrainingPhase =
    (currentPhase === GamePhase.TRAINING || currentPhase === GamePhase.TRAINING_2) &&
    trainingPlan &&
    !trainingPlan.completed

  if (!isLeavingTrainingPhase || !trainingPlan) {
    return players
  }

  // Get team players
  const teamPlayers = players.filter((p) => teamRoster.includes(p.id))

  // Process each player
  const updatedPlayers = players.map((player) => {
    // Only process players on the team
    if (!teamRoster.includes(player.id)) {
      return player
    }

    // Get player's training assignment
    const trainingAssignment =
      trainingPlan.playerAssignments.find((a) => a.playerId === player.id) || null

    // Get teammates (excluding this player)
    const teammates = teamPlayers.filter((p) => p.id !== player.id)

    // Calculate progression
    const improvements = calculatePlayerProgression(
      player,
      trainingAssignment,
      trainingPlan.teamFocus,
      manager.stats,
      manager.playStyle,
      school.funding,
      teammates
    )

    // Apply improvements
    const updatedPlayer = applySkillImprovements(player, improvements)

    return updatedPlayer
  })

  return updatedPlayers
}
