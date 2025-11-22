/**
 * Training goals utilities
 * Manages training objectives and tracking
 */
import {
  Player,
  PlayerSkills,
  TrainingGoal,
  SkillSnapshot
} from '../services/savegame/types'
import { calculateTeamAverageSkill } from './trainingInsights'

/**
 * Create a new training goal
 */
export function createTrainingGoal(
  type: TrainingGoal['type'],
  target: number,
  month: number,
  year: number,
  playerId?: string,
  skill?: keyof PlayerSkills
): TrainingGoal {
  return {
    id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    target,
    current: 0,
    playerId,
    skill,
    month,
    year,
    completed: false
  }
}

/**
 * Update goal progress based on current game state
 */
export function updateGoalProgress(
  goal: TrainingGoal,
  players: Player[],
  teamRoster: string[],
  oldSnapshots: SkillSnapshot[]
): TrainingGoal {
  const teamPlayers = players.filter((p) => teamRoster.includes(p.id))

  let current = 0

  switch (goal.type) {
    case 'team_average': {
      // Calculate current team average across all skills
      const skillKeys: (keyof PlayerSkills)[] = [
        'forehand',
        'backhand',
        'footwork',
        'serve',
        'receive',
        'spin',
        'placement',
        'consistency'
      ]
      const totalAvg = skillKeys.reduce((sum, key) => {
        const avg = calculateTeamAverageSkill(teamPlayers, key)
        return sum + avg
      }, 0)
      current = Math.floor(totalAvg / skillKeys.length)
      break
    }

    case 'player_skill':
      if (goal.playerId && goal.skill) {
        const player = players.find((p) => p.id === goal.playerId)
        if (player) {
          current = Math.floor(player.skills[goal.skill])
        }
      }
      break

    case 'team_improvement': {
      // Calculate total team improvement from snapshots
      if (oldSnapshots.length > 0) {
        const skillKeys: (keyof PlayerSkills)[] = [
          'forehand',
          'backhand',
          'footwork',
          'serve',
          'receive',
          'spin',
          'placement',
          'consistency'
        ]
        let totalImprovement = 0
        teamPlayers.forEach((player) => {
          const oldSnapshot = oldSnapshots.find((s) => s.playerId === player.id)
          if (oldSnapshot) {
            skillKeys.forEach((key) => {
              const improvement =
                Math.floor(player.skills[key]) - Math.floor(oldSnapshot.skills[key])
              totalImprovement += Math.max(0, improvement)
            })
          }
        })
        current = totalImprovement
      }
      break
    }

    case 'player_improvement': {
      if (goal.playerId && oldSnapshots.length > 0) {
        const player = players.find((p) => p.id === goal.playerId)
        const oldSnapshot = oldSnapshots.find((s) => s.playerId === goal.playerId)
        if (player && oldSnapshot) {
          const skillKeys: (keyof PlayerSkills)[] = [
            'forehand',
            'backhand',
            'footwork',
            'serve',
            'receive',
            'spin',
            'placement',
            'consistency'
          ]
          const totalImprovement = skillKeys.reduce((sum, key) => {
            const improvement =
              Math.floor(player.skills[key]) - Math.floor(oldSnapshot.skills[key])
            return sum + Math.max(0, improvement)
          }, 0)
          current = totalImprovement
        }
      }
      break
    }
  }

  const completed = current >= goal.target

  return {
    ...goal,
    current,
    completed
  }
}

/**
 * Get suggested goals based on team state
 */
export function getSuggestedGoals(
  players: Player[],
  teamRoster: string[],
  currentMonth: number,
  currentYear: number
): TrainingGoal[] {
  const teamPlayers = players.filter((p) => teamRoster.includes(p.id))
  if (teamPlayers.length === 0) return []

  const suggestions: TrainingGoal[] = []

  // Calculate current team average
  const skillKeys: (keyof PlayerSkills)[] = [
    'forehand',
    'backhand',
    'footwork',
    'serve',
    'receive',
    'spin',
    'placement',
    'consistency'
  ]
  const totalAvg = skillKeys.reduce((sum, key) => {
    const avg = calculateTeamAverageSkill(teamPlayers, key)
    return sum + avg
  }, 0)
  const currentTeamAvg = Math.floor(totalAvg / skillKeys.length)

  // Suggest team average goal (aim for +5 points)
  if (currentTeamAvg < 95) {
    suggestions.push(
      createTrainingGoal(
        'team_average',
        currentTeamAvg + 5,
        currentMonth + 2,
        currentYear
      )
    )
  }

  // Suggest improvement goal for weakest player
  const weakestPlayer = teamPlayers.reduce((weakest, player) => {
    const playerAvg =
      skillKeys.reduce((sum, key) => sum + player.skills[key], 0) / skillKeys.length
    const weakestAvg =
      skillKeys.reduce((sum, key) => sum + weakest.skills[key], 0) / skillKeys.length
    return playerAvg < weakestAvg ? player : weakest
  }, teamPlayers[0])

  const weakestPlayerAvg = Math.floor(
    skillKeys.reduce((sum, key) => sum + weakestPlayer.skills[key], 0) / skillKeys.length
  )

  if (weakestPlayerAvg < 90) {
    suggestions.push(
      createTrainingGoal(
        'player_skill',
        weakestPlayerAvg + 5,
        currentMonth + 2,
        currentYear,
        weakestPlayer.id,
        'forehand' // Default skill, can be customized
      )
    )
  }

  return suggestions
}
