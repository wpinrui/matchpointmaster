/**
 * Manager stats that affect gameplay
 */
export type ManagerStats = {
  reputation: number // 0-100, affects player intake quality
  coachingEffectiveness: number // 0-100, affects player development
}

export type SaveData = {
  manager: {
    fullName: string
    shortName: string
    gender: Gender
    imagePath: string
    handedness: Handedness
    forehandRubber: RubberType
    backhandRubber: RubberType
    gripStyle: GripStyle
    forehandBackhandTendency: FavourStyle
    playStyle: PlayStyle
    stats: ManagerStats
  }
  school: {
    name: string
    crestPath: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    reputation: number // 0-100, school's reputation affects player intake quality
  }
  players: Player[] // All available players (draft pool + team)
  teamRoster: string[] // Array of player IDs that are on the team (max 7)
  season: {
    year: number
    month: number // 1-12
    phase: string // GamePhase enum value (stored as string for flexibility)
  } // Current season data
  draftCompleted: boolean // Whether draft phase has been completed for this season
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export enum PlayStyle {
  FOREHAND_ATTACKER = 'Forehand Attacker',
  CHOPPER = 'Chopper',
  PLACEMENT_STRATEGIST = 'Placement Strategist',
  VARIED_PLAYER = 'Varied Player',
  BACKHAND_SMASHER = 'Backhand Smasher',
  ALL_ROUNDER = 'All-Rounder',
  COUNTER_DRIVER = 'Counter-Driver',
  DEFENSIVE_SPECIALIST = 'Defensive Specialist',
  SPIN_MANIPULATOR = 'Spin Manipulator',
  AGGRESSIVE_PUSHER = 'Aggressive Pusher',
  LOBBER = 'Lobber',
  NET_PLAYER = 'Net Player'
}

export enum RubberType {
  SPIN_RUBBER = 'Spin Rubber',
  ANTISPIN_RUBBER = 'Antispin Rubber',
  SHORT_PIMPLE = 'Short Pimple',
  MEDIUM_PIMPLE = 'Medium Pimple',
  LONG_PIMPLE = 'Long Pimple',
  WOOD = 'Wood'
}

export enum FavourStyle {
  HEAVILY_FOREHAND = 'Heavily Forehand',
  SLIGHTLY_FOREHAND = 'Slightly Forehand',
  BALANCED = 'Balanced',
  SLIGHTLY_BACKHAND = 'Slightly Backhand',
  HEAVILY_BACKHAND = 'Heavily Backhand'
}

export enum GripStyle {
  SHAKE_HAND = 'Shake Hand',
  PENHOLD = 'Penhold',
  UNCONVENTIONAL = 'Unconventional'
}

export enum Handedness {
  RIGHT = 'Right',
  LEFT = 'Left'
}

/**
 * Player skills (0-100 scale)
 */
export type PlayerSkills = {
  forehand: number // Forehand stroke quality
  backhand: number // Backhand stroke quality
  footwork: number // Movement and positioning
  serve: number // Serve quality
  receive: number // Return of serve
  spin: number // Spin generation and reading
  placement: number // Shot placement accuracy
  consistency: number // Consistency and error rate
}

/**
 * Player attributes and stats
 */
export type Player = {
  id: string // Unique identifier
  firstName: string
  lastName: string
  gender: Gender
  age: number // Age in years
  year: number // Year in school (1-4, max 4 years)
  elo: number // ELO rating (typically 800-2000+)
  skills: PlayerSkills
  handedness: Handedness
  gripStyle: GripStyle
  forehandRubber: RubberType
  backhandRubber: RubberType
  forehandBackhandTendency: FavourStyle
  playStyle: PlayStyle
  imagePath: string // Avatar image path
}
