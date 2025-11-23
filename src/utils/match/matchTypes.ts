/**
 * Type definitions for match engine
 */

/**
 * Player horizontal positioning
 */
export enum HorizontalPosition {
  NEUTRAL = 'neutral',
  FOREHAND_BIAS = 'forehand_bias',
  BACKHAND_BIAS = 'backhand_bias'
}

/**
 * Player vertical positioning
 */
export enum VerticalPosition {
  FORWARD = 'forward',
  NEUTRAL = 'neutral',
  BACKWARDS = 'backwards'
}

/**
 * Player positioning state
 */
export type PlayerPosition = {
  horizontal: HorizontalPosition
  vertical: VerticalPosition
}

/**
 * Rally event for logging
 */
export type RallyEvent = {
  type: 'serve' | 'return' | 'point' | 'error' | 'lucky_bounce' | 'ball'
  player: number // 0 or 1
  description: string
  timestamp: number
}

/**
 * Match state
 * In table tennis: Match = best of 5 sets, Set = first to 11 points (win by 2)
 */
export type MatchState = {
  bestOf: number // odd
  sets: number[] // [player1SetsWon, player2SetsWon] - number of sets won (0-3, first to 3 wins match)
  currentSet: number // 0-indexed set number
  setScores: number[][] // [[p1Points, p2Points], ...] - final point scores for each completed set, e.g., [[11, 0], [11, 0], [11, 0]]
  currentSetScore: number[] // [p1Points, p2Points] - points in the current set being played
  servingPlayer: number // 0 or 1. If 0, then 0 serves the first point of the first set. 1 serves the first point of the second set and so on.
  playerPositions: [PlayerPosition, PlayerPosition]
  rallyEvents: RallyEvent[]
  isComplete: boolean
  winner: number | null // 0 or 1, or null if not finished
}
