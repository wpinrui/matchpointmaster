import { createAvatar } from '@dicebear/core'
import { avataaars } from '@dicebear/collection'
import { Gender } from '../services/savegame/types'
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
 * Generate a random face avatar URL using DiceBear
 */
export const generateRandomFace = (seed: string, gender?: Gender): string => {
  try {
    // Get gender-appropriate hair styles
    const availableHairStyles =
      gender === Gender.FEMALE ? FEMALE_HAIR_STYLES : MALE_HAIR_STYLES

    // Randomly select features
    const randomSkinTone =
      SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)]
    const randomHairStyle =
      availableHairStyles[
        Math.floor(Math.random() * availableHairStyles.length)
      ]
    const randomHairColor =
      HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)]
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
    const randomClothing =
      CLOTHING[Math.floor(Math.random() * CLOTHING.length)]

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
  gender?: Gender
): string[] => {
  const faces: string[] = []
  for (let i = 0; i < count; i++) {
    const seed = `${initialSeed}-${Date.now()}-${i}-${Math.random()
      .toString(36)
      .substring(7)}`
    const faceUrl = generateRandomFace(seed, gender)
    if (faceUrl) {
      faces.push(faceUrl)
    }
  }
  return faces
}

