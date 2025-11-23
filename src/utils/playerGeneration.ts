/**
 * Random player generation utilities
 */
import {
  Player,
  PlayerSkills,
  Gender,
  Handedness,
  GripStyle,
  RubberType,
  FavourStyle,
  PlayStyle
} from '../services/savegame/types'
import { generateRandomFace } from './faceGeneration'
import {
  CHINESE_LAST_NAMES,
  CHINESE_BOYS_NAMES,
  CHINESE_GIRLS_NAMES,
  CHINESE_CHRISTIAN_BOYS_NAMES,
  CHINESE_CHRISTIAN_GIRLS_NAMES,
  MALAY_BOYS_NAMES,
  MALAY_GIRLS_NAMES,
  MALAY_BOYS_LAST_NAMES,
  MALAY_GIRLS_LAST_NAMES,
  INDIAN_BOYS_NAMES,
  INDIAN_GIRLS_NAMES,
  INDIAN_BOYS_LAST_NAMES,
  INDIAN_GIRLS_LAST_NAMES,
  OTHER_LAST_NAMES
} from './nameData'

/**
 * Get the full display name for a player
 * Chinese names: lastName (surname) comes first
 * Other names: firstName comes first
 */
export function getPlayerFullName(player: Player): string {
  // Handle backward compatibility: if isChinese is undefined, assume false
  const isChinese = player.isChinese ?? false
  return isChinese
    ? `${player.lastName} ${player.firstName}`
    : `${player.firstName} ${player.lastName}`
}

/**
 * Intake quality affects the skill level of generated players
 */
export enum IntakeQuality {
  POOR = 'poor', // Brand new players, very low skills
  BELOW_AVERAGE = 'below_average', // Below average skills
  AVERAGE = 'average', // Average school-level players
  ABOVE_AVERAGE = 'above_average', // Above average players
  EXCELLENT = 'excellent' // High-quality players
}

/**
 * Generate a random number between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a random number between min and max (inclusive, can be decimal)
 */
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Generate a random value from an array
 */
function randomFromArray<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)]
}

/**
 * Generate random player skills based on intake quality and gender
 */
function generateSkills(quality: IntakeQuality, gender: Gender): PlayerSkills {
  // Base skill ranges by quality
  // Bad schools should have attributes close to 0
  // Top schools (EXCELLENT) capped at high 30s to low 40s to narrow gap
  const qualityRanges: Record<IntakeQuality, { min: number; max: number }> = {
    [IntakeQuality.POOR]: { min: 0, max: 25 }, // Very low for bad schools (unchanged)
    [IntakeQuality.BELOW_AVERAGE]: { min: 15, max: 30 },
    [IntakeQuality.AVERAGE]: { min: 25, max: 38 },
    [IntakeQuality.ABOVE_AVERAGE]: { min: 32, max: 42 },
    [IntakeQuality.EXCELLENT]: { min: 37, max: 43 } // High 30s to low 40s for top schools
  }

  const range = qualityRanges[quality]

  // Generate base skills
  const baseForehand = randomFloat(range.min, range.max)
  const baseBackhand = randomFloat(range.min, range.max)
  const baseFootwork = randomFloat(range.min, range.max)

  // Gender adjustments: males have higher median footwork
  const footworkAdjustment =
    gender === Gender.MALE ? randomFloat(0, 10) : randomFloat(-5, 5)
  const footwork = Math.min(100, Math.max(0, baseFootwork + footworkAdjustment))

  // Some skills correlate with others (e.g., good forehand players might have better spin)
  const spin = randomFloat(range.min, range.max) + (baseForehand - 50) * 0.2
  const placement = randomFloat(range.min, range.max) + (baseForehand - 50) * 0.15

  return {
    forehand: Math.min(100, Math.max(0, Math.round(baseForehand))),
    backhand: Math.min(100, Math.max(0, Math.round(baseBackhand))),
    footwork: Math.min(100, Math.max(0, Math.round(footwork))),
    serve: Math.min(100, Math.max(0, Math.round(randomFloat(range.min, range.max)))),
    receive: Math.min(100, Math.max(0, Math.round(randomFloat(range.min, range.max)))),
    spin: Math.min(100, Math.max(0, Math.round(spin))),
    placement: Math.min(100, Math.max(0, Math.round(placement))),
    consistency: Math.min(100, Math.max(0, Math.round(randomFloat(range.min, range.max))))
  }
}

/**
 * Calculate ELO - all new players start at 1500
 * (ELO will change as they play matches)
 */
function calculateElo(_skills: PlayerSkills): number {
  // All new players start at 1500 ELO
  // This will be adjusted as they play matches
  return 1500
}

/**
 * Racial distribution for Singapore
 */
const RACIAL_DISTRIBUTION = {
  'Singapore (Chinese)': 0.759,
  'Singapore (Malay)': 0.15,
  'Singapore (Indian)': 0.075,
  Other: 0.016
} as const

export type RacialCategory = keyof typeof RACIAL_DISTRIBUTION

/**
 * Select a racial category based on distribution
 */
function selectRacialCategory(): RacialCategory {
  const rand = Math.random()
  let cumulative = 0

  for (const [category, probability] of Object.entries(RACIAL_DISTRIBUTION)) {
    cumulative += probability
    if (rand <= cumulative) {
      return category as RacialCategory
    }
  }

  return 'Other' // Fallback
}

/**
 * Generate a random player name based on Singapore racial distribution
 */
function generateName(gender: Gender): {
  firstName: string
  lastName: string
  shortName: string
  isChinese: boolean
  racialCategory: RacialCategory
} {
  const category = selectRacialCategory()

  let firstName: string
  let lastName: string
  let isChinese = false

  if (category === 'Singapore (Chinese)') {
    const chineseNames = gender === Gender.MALE ? CHINESE_BOYS_NAMES : CHINESE_GIRLS_NAMES
    const christianNames =
      gender === Gender.MALE
        ? CHINESE_CHRISTIAN_BOYS_NAMES
        : CHINESE_CHRISTIAN_GIRLS_NAMES
    const surname = randomFromArray(CHINESE_LAST_NAMES)

    // Randomly choose between traditional Chinese name or Christian name
    const useTraditionalChinese = Math.random() < 0.5

    if (useTraditionalChinese) {
      // Traditional Chinese names: lastName (surname) comes first
      const givenName = randomFromArray(chineseNames)
      lastName = surname
      firstName = givenName
      isChinese = true
    } else {
      // Chinese Christian names: firstName comes first (Western order)
      const givenName = randomFromArray(christianNames)
      firstName = givenName
      lastName = surname
      isChinese = false
    }
  } else if (category === 'Singapore (Malay)') {
    const malayNames = gender === Gender.MALE ? MALAY_BOYS_NAMES : MALAY_GIRLS_NAMES
    const malayLastNames =
      gender === Gender.MALE ? MALAY_BOYS_LAST_NAMES : MALAY_GIRLS_LAST_NAMES
    firstName = randomFromArray(malayNames)
    lastName = randomFromArray(malayLastNames)
  } else if (category === 'Singapore (Indian)') {
    const indianNames = gender === Gender.MALE ? INDIAN_BOYS_NAMES : INDIAN_GIRLS_NAMES
    const indianLastNames =
      gender === Gender.MALE ? INDIAN_BOYS_LAST_NAMES : INDIAN_GIRLS_LAST_NAMES
    firstName = randomFromArray(indianNames)
    lastName = randomFromArray(indianLastNames)
  } else {
    // Other category
    const christianNames =
      gender === Gender.MALE
        ? CHINESE_CHRISTIAN_BOYS_NAMES
        : CHINESE_CHRISTIAN_GIRLS_NAMES
    firstName = randomFromArray(christianNames)
    lastName = randomFromArray(OTHER_LAST_NAMES)
  }

  // shortName is always the first name (given name)
  const shortName = firstName

  return { firstName, lastName, shortName, isChinese, racialCategory: category }
}

/**
 * Calculate intake quality based on manager and school reputation
 */
export function calculateIntakeQuality(
  managerReputation: number,
  schoolReputation: number
): IntakeQuality {
  // Average the two reputations
  const avgReputation = (managerReputation + schoolReputation) / 2

  if (avgReputation >= 80) return IntakeQuality.EXCELLENT
  if (avgReputation >= 60) return IntakeQuality.ABOVE_AVERAGE
  if (avgReputation >= 40) return IntakeQuality.AVERAGE
  if (avgReputation >= 20) return IntakeQuality.BELOW_AVERAGE
  return IntakeQuality.POOR
}

export function generatePlayer(
  quality: IntakeQuality = IntakeQuality.AVERAGE,
  year: number = 1,
  genderOverride?: Gender
): Player {
  const gender = genderOverride || randomFromArray([Gender.MALE, Gender.FEMALE])
  const { firstName, lastName, shortName, isChinese, racialCategory } =
    generateName(gender)
  const skills = generateSkills(quality, gender)
  const elo = calculateElo(skills)

  // Generate avatar with racial category for appropriate skin tone
  const imagePath = generateRandomFace(
    `${firstName}-${lastName}-${Date.now()}`,
    gender,
    racialCategory
  )

  // Determine play style based on skills
  const playStyle = determinePlayStyle(skills)

  // Determine forehand/backhand tendency
  const forehandBackhandTendency = determineForehandBackhandTendency(skills)

  return {
    id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    firstName,
    lastName,
    shortName,
    isChinese,
    gender,
    age: 13, // All new players are Sec 1 (age 13)
    year,
    elo: 1500, // All new players start at 1500 ELO
    skills,
    handedness: randomFromArray([Handedness.RIGHT, Handedness.LEFT]),
    gripStyle: randomFromArray([
      GripStyle.SHAKE_HAND,
      GripStyle.PENHOLD,
      GripStyle.UNCONVENTIONAL
    ]),
    forehandRubber: randomFromArray([
      RubberType.SPIN_RUBBER,
      RubberType.ANTISPIN_RUBBER,
      RubberType.SHORT_PIMPLE
    ]),
    backhandRubber: randomFromArray([
      RubberType.SPIN_RUBBER,
      RubberType.ANTISPIN_RUBBER,
      RubberType.SHORT_PIMPLE
    ]),
    forehandBackhandTendency,
    playStyle,
    imagePath,
    traits: [] // Players start with no traits, can earn them over time
  }
}

/**
 * Determine play style based on skill distribution
 */
function determinePlayStyle(skills: PlayerSkills): PlayStyle {
  const forehandDiff = skills.forehand - skills.backhand
  const attackScore = (skills.forehand + skills.backhand + skills.spin) / 3
  const defenseScore = (skills.consistency + skills.receive) / 2
  const placementScore = skills.placement

  if (forehandDiff > 20) {
    return PlayStyle.FOREHAND_ATTACKER
  }
  if (forehandDiff < -20) {
    return PlayStyle.BACKHAND_SMASHER
  }
  if (defenseScore > 75 && skills.spin < 50) {
    return PlayStyle.CHOPPER
  }
  if (placementScore > 75) {
    return PlayStyle.PLACEMENT_STRATEGIST
  }
  if (attackScore > 70 && defenseScore > 70) {
    return PlayStyle.ALL_ROUNDER
  }
  if (skills.spin > 75) {
    return PlayStyle.SPIN_MANIPULATOR
  }

  return PlayStyle.VARIED_PLAYER
}

/**
 * Determine forehand/backhand tendency based on skills
 */
function determineForehandBackhandTendency(skills: PlayerSkills): FavourStyle {
  const diff = skills.forehand - skills.backhand

  if (diff > 25) {
    return FavourStyle.HEAVILY_FOREHAND
  }
  if (diff > 10) {
    return FavourStyle.SLIGHTLY_FOREHAND
  }
  if (diff < -25) {
    return FavourStyle.HEAVILY_BACKHAND
  }
  if (diff < -10) {
    return FavourStyle.SLIGHTLY_BACKHAND
  }

  return FavourStyle.BALANCED
}

/**
 * Generate multiple players based on manager and school reputation
 */
export function generatePlayersByReputation(
  count: number,
  managerReputation: number,
  schoolReputation: number,
  startYear: number = 1
): Player[] {
  const quality = calculateIntakeQuality(managerReputation, schoolReputation)
  return Array.from({ length: count }, () => generatePlayer(quality, startYear))
}

/**
 * Generate worst possible player (for when draft pool runs out)
 */
export function generateWorstPlayer(year: number = 1, genderOverride?: Gender): Player {
  return generatePlayer(IntakeQuality.POOR, year, genderOverride)
}

/**
 * Generate multiple players (legacy function for backward compatibility)
 */
export function generatePlayers(
  count: number,
  quality: IntakeQuality = IntakeQuality.AVERAGE,
  year: number = 1
): Player[] {
  return Array.from({ length: count }, () => generatePlayer(quality, year))
}
