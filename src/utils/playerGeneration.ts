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
  const qualityRanges: Record<IntakeQuality, { min: number; max: number }> = {
    [IntakeQuality.POOR]: { min: 20, max: 50 },
    [IntakeQuality.BELOW_AVERAGE]: { min: 35, max: 65 },
    [IntakeQuality.AVERAGE]: { min: 50, max: 75 },
    [IntakeQuality.ABOVE_AVERAGE]: { min: 65, max: 85 },
    [IntakeQuality.EXCELLENT]: { min: 75, max: 95 }
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
 * Calculate ELO based on skills
 */
function calculateElo(skills: PlayerSkills): number {
  // Average all skills
  const avgSkill =
    (skills.forehand +
      skills.backhand +
      skills.footwork +
      skills.serve +
      skills.receive +
      skills.spin +
      skills.placement +
      skills.consistency) /
    8

  // Convert skill (0-100) to ELO (800-2000+)
  // Base ELO of 800, scale up to 2000+ for high skills
  const elo = 800 + (avgSkill / 100) * 1200

  // Add some randomness (±50)
  return Math.round(elo + randomFloat(-50, 50))
}

/**
 * Generate a random player name
 */
function generateName(gender: Gender): { firstName: string; lastName: string } {
  // Simple name lists - can be expanded later
  const maleFirstNames = [
    'Alex',
    'Ben',
    'Chris',
    'David',
    'Ethan',
    'James',
    'Kevin',
    'Michael',
    'Ryan',
    'Tom',
    'Will',
    'Zach'
  ]

  const femaleFirstNames = [
    'Amy',
    'Emma',
    'Grace',
    'Jessica',
    'Kate',
    'Lisa',
    'Maria',
    'Sarah',
    'Sophie',
    'Taylor',
    'Victoria',
    'Zoe'
  ]

  const lastNames = [
    'Anderson',
    'Brown',
    'Chen',
    'Davis',
    'Garcia',
    'Johnson',
    'Lee',
    'Martinez',
    'Miller',
    'Smith',
    'Taylor',
    'Wilson',
    'Wong',
    'Zhang'
  ]

  const firstNames = gender === Gender.MALE ? maleFirstNames : femaleFirstNames

  return {
    firstName: randomFromArray(firstNames),
    lastName: randomFromArray(lastNames)
  }
}

/**
 * Generate a random player
 */
export function generatePlayer(
  quality: IntakeQuality = IntakeQuality.AVERAGE,
  year: number = 1
): Player {
  const gender = randomFromArray([Gender.MALE, Gender.FEMALE])
  const { firstName, lastName } = generateName(gender)
  const skills = generateSkills(quality, gender)
  const elo = calculateElo(skills)

  // Generate avatar
  const imagePath = generateRandomFace(`${firstName}-${lastName}-${Date.now()}`, gender)

  // Determine play style based on skills
  const playStyle = determinePlayStyle(skills)

  // Determine forehand/backhand tendency
  const forehandBackhandTendency = determineForehandBackhandTendency(skills)

  return {
    id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    firstName,
    lastName,
    gender,
    age: 15 + year - 1, // Start at 15 for year 1
    year,
    elo,
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
    imagePath
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
 * Generate multiple players
 */
export function generatePlayers(
  count: number,
  quality: IntakeQuality = IntakeQuality.AVERAGE,
  year: number = 1
): Player[] {
  return Array.from({ length: count }, () => generatePlayer(quality, year))
}
