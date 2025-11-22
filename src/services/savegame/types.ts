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
    reputation: number // Current reputation (lower is better, 1st is best)
    funding: number // Current funding rank (lower is better, 1st is best)
    reputationHistory: number[] // Past 10 years of reputation rankings
    fundingHistory: number[] // Past 10 years of funding rankings
    teamType: 'boys' | 'girls' | 'both' // Whether school has boys-only, girls-only, or both teams
  }
  players: Player[] // All available players (draft pool + team)
  teamRoster: string[] // Array of player IDs that are on the team
  season: {
    year: number
    month: number // 1-12
    phase: string // GamePhase enum value (stored as string for flexibility)
  } // Current season data
  draftCompleted: boolean // Whether draft phase has been completed for this season
  emails: Email[] // In-game emails
  trainingPlan: TrainingPlan | null // Current month's training plan, null if not set
  skillSnapshots: SkillSnapshot[] // Historical skill snapshots for progress tracking
  trainingGoals: TrainingGoal[] // Active training goals across all periods
}

/**
 * Skill snapshot for tracking player progress over time
 */
export type SkillSnapshot = {
  playerId: string
  skills: PlayerSkills
  month: number
  year: number
}

/**
 * Email tags for categorization
 */
export enum EmailTag {
  WELCOME = 'welcome',
  NEWS = 'news',
  DRAFT = 'draft',
  TOURNAMENT = 'tournament',
  TRAINING = 'training',
  ADMINISTRATIVE = 'administrative',
  SOCIAL = 'social'
}

/**
 * In-game email structure
 */
export type Email = {
  id: string // Unique identifier
  from: string // Sender name
  subject: string
  body: string // Email content (can be HTML or plain text)
  timestamp: number // Unix timestamp
  read: boolean // Whether email has been read
  tags: EmailTag[] // Tags for categorization
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
 * Player traits that affect development and performance
 * Flexible system - can add more traits in the future
 */
export enum PlayerTrait {
  HARD_WORKER = 'hard_worker', // +training effectiveness
  NATURAL_TALENT = 'natural_talent', // +potential, may be less consistent
  INJURY_PRONE = 'injury_prone', // Random missed training
  QUICK_LEARNER = 'quick_learner', // Faster improvement
  LAZY = 'lazy', // -training effectiveness
  UNDERDOG = 'underdog', // Overperforms when expectations are low, struggles when expectations rise
  PRODIGY = 'prodigy', // Exceptional talent, very fast improvement
  RESILIENT = 'resilient', // Maintains performance regardless of circumstances
  VULNERABLE = 'vulnerable' // Struggles after early success/setbacks
}

/**
 * Player attributes and stats
 */
export type Player = {
  id: string // Unique identifier
  firstName: string
  lastName: string
  shortName: string // Short name (typically first name)
  isChinese: boolean // Whether player has Chinese name (affects display order)
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
  traits: PlayerTrait[] // Player traits (can earn/lose over time)
}

/**
 * Training focus types
 */
export enum TrainingFocus {
  FOREHAND = 'forehand',
  BACKHAND = 'backhand',
  FOOTWORK = 'footwork',
  SERVE = 'serve',
  RECEIVE = 'receive',
  SPIN = 'spin',
  PLACEMENT = 'placement',
  CONSISTENCY = 'consistency',
  MATCH_PLAY = 'match_play', // General match practice
  FUNDAMENTALS = 'fundamentals', // Balanced, focuses on weaknesses
  TOURNAMENT_PREP = 'tournament_prep' // Pre-tournament preparation
}

/**
 * Individual training assignment for a player
 */
export type PlayerTraining = {
  playerId: string
  focus: TrainingFocus | null // null means following team training
  isIndividualCoaching: boolean // Uses coaching slot if true
}

/**
 * Training goal for tracking objectives
 */
export type TrainingGoal = {
  id: string // Unique identifier
  type: 'team_average' | 'player_skill' | 'team_improvement' | 'player_improvement'
  target: number // Target value
  current: number // Current value
  playerId?: string // For player-specific goals
  skill?: keyof PlayerSkills // For skill-specific goals
  month: number // Target month
  year: number // Target year
  completed: boolean // Whether goal is achieved
}

/**
 * Training plan for the current month
 */
export type TrainingPlan = {
  month: number // 1-12
  year: number
  teamFocus: TrainingFocus | null // Team-wide focus, null if not set
  playerAssignments: PlayerTraining[] // Individual assignments
  coachingSlotsUsed: number // How many coaching slots are in use (max 5)
  completed: boolean // Whether this month's training is complete
  goals: TrainingGoal[] // Training goals for this period
}
