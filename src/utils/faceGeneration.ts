import { createAvatar } from '@dicebear/core'
import { avataaars } from '@dicebear/collection'
import { Gender } from '../services/savegame/types'
import type { RacialCategory } from './playerGeneration'
import {
  SKIN_TONES,
  MALE_HAIR_STYLES,
  FEMALE_HAIR_STYLES,
  HAIR_COLORS,
  ACCESSORIES,
  FACIAL_HAIR,
  CLOTHING
} from './faceConstants'

/**
 * Get appropriate skin tone based on racial category with natural variation
 * Skin tones: 'FDB896' (Light), 'D08B5B' (Medium), '8D5524' (Dark), 'C68642' (Tan), 'A0522D' (Brown)
 */
function getSkinToneForRacialCategory(racialCategory?: RacialCategory): string {
  if (!racialCategory) {
    // If no category provided, use random selection (backward compatibility)
    return SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)]
  }

  const rand = Math.random()

  switch (racialCategory) {
    case 'Singapore (Chinese)':
      // Chinese: Mostly light to medium, with some variation (darker skin Chinese people exist)
      // 60% light, 30% medium, 8% tan, 2% darker tones
      if (rand < 0.6) return 'FDB896' // Light
      if (rand < 0.9) return 'D08B5B' // Medium
      if (rand < 0.98) return 'C68642' // Tan
      return '8D5524' // Dark (rare but exists)

    case 'Singapore (Malay)':
      // Malay: Medium to dark, with some variation (lighter skin Malays exist)
      // 10% light, 40% medium, 35% tan, 15% darker tones
      if (rand < 0.1) return 'FDB896' // Light (rare but exists)
      if (rand < 0.5) return 'D08B5B' // Medium
      if (rand < 0.85) return 'C68642' // Tan
      if (rand < 0.95) return '8D5524' // Dark
      return 'A0522D' // Brown

    case 'Singapore (Indian)':
      // Indian: Medium to dark, with some variation (lighter skin Indians exist)
      // 5% light, 30% medium, 40% tan, 20% darker tones, 5% brown
      if (rand < 0.05) return 'FDB896' // Light (rare but exists)
      if (rand < 0.35) return 'D08B5B' // Medium
      if (rand < 0.75) return 'C68642' // Tan
      if (rand < 0.95) return '8D5524' // Dark
      return 'A0522D' // Brown

    case 'Other':
      // Other: Mostly light to medium (European-origin names)
      // 70% light, 25% medium, 5% tan
      if (rand < 0.7) return 'FDB896' // Light
      if (rand < 0.95) return 'D08B5B' // Medium
      return 'C68642' // Tan

    default:
      // Fallback: random selection
      return SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)]
  }
}

/**
 * Generate a random face avatar URL using DiceBear
 */
export const generateRandomFace = (
  seed: string,
  gender?: Gender,
  racialCategory?: RacialCategory
): string => {
  try {
    // Get gender-appropriate hair styles
    const availableHairStyles =
      gender === Gender.FEMALE ? FEMALE_HAIR_STYLES : MALE_HAIR_STYLES

    // Select skin tone based on racial category with natural variation
    const randomSkinTone = getSkinToneForRacialCategory(racialCategory)
    const randomHairStyle =
      availableHairStyles[Math.floor(Math.random() * availableHairStyles.length)]
    const randomHairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)]
    const randomAccessory =
      Math.random() > 0.5
        ? ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)]
        : 'blank'

    // Facial hair is more common for males, rare for females
    const facialHairProbability = gender === Gender.FEMALE ? 0.05 : 0.3
    const randomFacialHair =
      Math.random() < facialHairProbability
        ? FACIAL_HAIR[Math.floor(Math.random() * FACIAL_HAIR.length)]
        : 'blank'
    const randomClothing = CLOTHING[Math.floor(Math.random() * CLOTHING.length)]

    const options: any = {
      seed: seed,
      skinColor: [randomSkinTone],
      top: [randomHairStyle],
      hairColor: [randomHairColor],
      clothing: [randomClothing],
      clothingColor: ['262E33'] // Default dark (without #), will be replaced with school color
    }

    // Add accessories if not blank
    if (randomAccessory !== 'blank') {
      options.accessories = [randomAccessory]
    }

    // Add facial hair if not blank
    if (randomFacialHair !== 'blank') {
      options.facialHair = [randomFacialHair]
    }

    const avatar = createAvatar(avataaars, options)
    return avatar.toDataUri()
  } catch (error) {
    console.error('Error generating face:', error)
    return ''
  }
}

/**
 * Generate multiple random faces
 */
export const generateFaceSet = (
  count: number,
  initialSeed: string,
  gender?: Gender,
  racialCategory?: RacialCategory
): string[] => {
  const faces: string[] = []
  for (let i = 0; i < count; i++) {
    const seed = `${initialSeed}-${Date.now()}-${i}-${Math.random()
      .toString(36)
      .substring(7)}`
    const faceUrl = generateRandomFace(seed, gender, racialCategory)
    if (faceUrl) {
      faces.push(faceUrl)
    }
  }
  return faces
}
