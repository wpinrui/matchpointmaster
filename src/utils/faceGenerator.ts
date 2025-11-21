import { createAvatar } from '@dicebear/core'
import { avataaars } from '@dicebear/collection'

export type SkinTone = 'light' | 'medium' | 'dark'
export type HairStyle = 'short' | 'medium' | 'long' | 'bald'

interface FaceConfig {
  skinTone: SkinTone
  hairStyle: HairStyle
  seed: string
}

// Colors should be hex strings without # for DiceBear API
const skinToneMap: Record<SkinTone, string> = {
  light: 'FDB896',
  medium: 'D08B5B',
  dark: '8D5524'
}

// Valid avataaars top/hair style values (matching DiceBear API types)
const hairStyleMap: Record<HairStyle, string[]> = {
  short: [
    'shortCurly',
    'shortFlat',
    'shortRound',
    'shortWaved',
    'theCaesar',
    'theCaesarAndSidePart',
    'frizzle',
    'shaggyMullet',
    'sides'
  ],
  medium: [
    'dreads01',
    'dreads02',
    'frizzle',
    'shaggyMullet',
    'shaggy',
    'shortCurly',
    'shortFlat',
    'shortRound',
    'shortWaved'
  ],
  long: [
    'bob',
    'curly',
    'straight02',
    'straight01',
    'straightAndStrand',
    'bun',
    'curvy',
    'frida',
    'fro',
    'froBand',
    'longButNotTooLong',
    'shavedSides',
    'miaWallace'
  ],
  bald: ['bigHair'] // Using bigHair as closest to bald, or we could use a hat
}

/**
 * Generate a face avatar URL using DiceBear
 */
export const generateFaceUrl = (config: FaceConfig): string => {
  // Get a random hair style from the category
  const availableHairStyles = hairStyleMap[config.hairStyle]
  const randomHairStyle = availableHairStyles[
    Math.floor(Math.random() * availableHairStyles.length)
  ] as any // Type assertion needed due to DiceBear's strict typing

  // Generate face WITHOUT clothing - clothing will be added later with school colors
  const options: any = {
    seed: config.seed,
    skinColor: [skinToneMap[config.skinTone]],
    top: [randomHairStyle]
  }

  // Randomize hair color for variety (colors without # prefix)
  const hairColors = [
    'A55728',
    '2C1B18',
    'B58143',
    'D6B370',
    '724133',
    'C93305',
    'E8E1E1'
  ]
  const randomHairColor = hairColors[Math.floor(Math.random() * hairColors.length)]
  options.hairColor = [randomHairColor]

  // Don't include clothing - it will be added based on school colors later
  // Clothing is hardcoded to coach attire style

  const avatar = createAvatar(avataaars, options)

  return avatar.toDataUri()
}

/**
 * Generate 24 faces systematically grouped by skin tone and hair style
 * 6 rows x 4 columns
 * Rows: 2 light, 2 medium, 2 dark (skin tones)
 * Columns: Different hair styles within each skin tone group
 */
export const generateFaceGrid = (): Array<{ url: string; config: FaceConfig }> => {
  const faces: Array<{ url: string; config: FaceConfig }> = []
  const skinTones: SkinTone[] = ['light', 'medium', 'dark']
  const hairStyles: HairStyle[] = ['short', 'medium', 'long', 'bald']

  // Generate 24 faces: 6 rows (2 per skin tone) x 4 columns (hair styles)
  skinTones.forEach((skinTone, skinIndex) => {
    // 2 rows per skin tone
    for (let row = 0; row < 2; row++) {
      hairStyles.forEach((hairStyle, hairIndex) => {
        // Create unique seed for each face
        const seed = `face-${skinTone}-${hairStyle}-${row}-${hairIndex}-${Date.now()}`
        const config: FaceConfig = {
          skinTone,
          hairStyle,
          seed
        }
        faces.push({
          url: generateFaceUrl(config),
          config
        })
      })
    }
  })

  return faces
}

/**
 * Generate faces with more variety by randomizing additional features
 */
export const generateVariedFaces = (): Array<{ url: string; config: FaceConfig }> => {
  const faces: Array<{ url: string; config: FaceConfig }> = []
  const skinTones: SkinTone[] = ['light', 'medium', 'dark']
  const hairStyles: HairStyle[] = ['short', 'medium', 'long', 'bald']

  skinTones.forEach((skinTone) => {
    for (let row = 0; row < 2; row++) {
      hairStyles.forEach((hairStyle) => {
        // More varied seeds for better diversity
        const randomSuffix = Math.random().toString(36).substring(7)
        const seed = `manager-${skinTone}-${hairStyle}-${row}-${randomSuffix}`
        const config: FaceConfig = {
          skinTone,
          hairStyle,
          seed
        }
        faces.push({
          url: generateFaceUrl(config),
          config
        })
      })
    }
  })

  return faces
}
