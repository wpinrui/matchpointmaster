import React, { useState, useMemo, useCallback } from 'react'
import { createAvatar } from '@dicebear/core'
import { avataaars } from '@dicebear/collection'
import { theme } from '../../theme/theme'
import { Gender } from '../../services/savegame/types'

interface FaceCustomizerProps {
  initialSeed?: string
  onFaceChange: (faceUrl: string) => void
  gender?: Gender
}

// Available options from DiceBear avataaars
// Colors should be hex strings without # for DiceBear API
const skinTones = [
  'FDB896', // Light
  'D08B5B', // Medium
  '8D5524', // Dark
  'C68642', // Tan
  'A0522D'  // Brown
]

// Hair styles categorized by gender appropriateness
const maleHairStyles = [
  'shortCurly',
  'shortFlat',
  'shortRound',
  'shortWaved',
  'theCaesar',
  'theCaesarAndSidePart',
  'frizzle',
  'shaggy',
  'shaggyMullet',
  'sides',
  'dreads01',
  'dreads02',
  'shavedSides',
  'bigHair',
  'hat',
  'turban',
  'winterHat1',
  'winterHat02',
  'winterHat03',
  'winterHat04'
]

const femaleHairStyles = [
  'bob',
  'bun',
  'curly',
  'curvy',
  'frida',
  'fro',
  'froBand',
  'longButNotTooLong',
  'miaWallace',
  'straight02',
  'straight01',
  'straightAndStrand',
  'dreads',
  'shavedSides',
  'bigHair',
  'hat',
  'hijab',
  'turban',
  'winterHat1',
  'winterHat02',
  'winterHat03',
  'winterHat04'
]

const hairColors = [
  'A55728', // Brown
  '2C1B18', // Black
  'B58143', // Blonde
  'D6B370', // Light Blonde
  '724133', // Dark Brown
  'C93305', // Red
  'E8E1E1'  // Gray
]

const accessories = [
  'blank',
  'kurt',
  'prescription01',
  'prescription02',
  'round',
  'sunglasses',
  'wayfarers'
]

const facialHair = [
  'blank',
  'beardMedium',
  'beardLight',
  'beardMagestic',
  'moustacheFancy',
  'moustacheMagnum'
]

const clothing = ['hoodie', 'shirtCrewNeck', 'graphicShirt', 'shirtVNeck', 'shirtScoopNeck']

/**
 * Generate a random face avatar
 */
const generateRandomFace = (seed: string, gender?: Gender): string => {
  try {
    // Get gender-appropriate hair styles
    const availableHairStyles = gender === Gender.FEMALE ? femaleHairStyles : maleHairStyles
    
    // Randomly select features
    const randomSkinTone = skinTones[Math.floor(Math.random() * skinTones.length)]
    const randomHairStyle = availableHairStyles[Math.floor(Math.random() * availableHairStyles.length)]
    const randomHairColor = hairColors[Math.floor(Math.random() * hairColors.length)]
    const randomAccessory = Math.random() > 0.5 ? accessories[Math.floor(Math.random() * accessories.length)] : 'blank'
    
    // Facial hair is more common for males, rare for females
    const facialHairProbability = gender === Gender.FEMALE ? 0.05 : 0.3
    const randomFacialHair = Math.random() < facialHairProbability ? facialHair[Math.floor(Math.random() * facialHair.length)] : 'blank'
    const randomClothing = clothing[Math.floor(Math.random() * clothing.length)]

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

const FaceCustomizer: React.FC<FaceCustomizerProps> = ({
  initialSeed,
  onFaceChange,
  gender
}) => {
  const [faceOptions, setFaceOptions] = useState<string[]>([])

  // Generate 6 random faces
  const generateFaces = useCallback(() => {
    const faces: string[] = []
    for (let i = 0; i < 6; i++) {
      const seed = `${initialSeed || 'manager'}-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`
      const faceUrl = generateRandomFace(seed, gender)
      if (faceUrl) {
        faces.push(faceUrl)
      }
    }
    setFaceOptions(faces)
    // Auto-select first face
    if (faces.length > 0) {
      onFaceChange(faces[0])
    }
  }, [initialSeed, onFaceChange, gender])

  // Generate initial faces on mount and when gender changes
  React.useEffect(() => {
    const faces: string[] = []
    for (let i = 0; i < 6; i++) {
      const seed = `${initialSeed || 'manager'}-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`
      const faceUrl = generateRandomFace(seed, gender)
      if (faceUrl) {
        faces.push(faceUrl)
      }
    }
    setFaceOptions(faces)
    // Auto-select first face
    if (faces.length > 0) {
      onFaceChange(faces[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender]) // Regenerate when gender changes

  const handleFaceSelect = (faceUrl: string) => {
    onFaceChange(faceUrl)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.lg,
        alignItems: 'center'
      }}
    >
      {/* Randomize Button */}
      <button
        onClick={generateFaces}
        style={{
          padding: `${theme.spacing.md} ${theme.spacing.xl}`,
          background: theme.gradients.primary,
          color: theme.colors.text.inverse,
          border: 'none',
          borderRadius: theme.borderRadius.lg,
          cursor: 'pointer',
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.semibold,
          boxShadow: theme.shadows.md,
          transition: `all ${theme.transitions.normal}`,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = theme.shadows.lg
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = theme.shadows.md
        }}
      >
        Randomize Faces
      </button>

      {/* Face Grid - 6 options in 2 rows of 3 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: theme.spacing.lg,
          width: '100%',
          maxWidth: '600px'
        }}
      >
        {faceOptions.map((faceUrl, index) => (
          <div
            key={index}
            onClick={() => handleFaceSelect(faceUrl)}
            style={{
              cursor: 'pointer',
              borderRadius: theme.borderRadius.md,
              border: `3px solid ${theme.colors.neutral.gray300}`,
              padding: theme.spacing.sm,
              background: theme.colors.neutral.white,
              transition: `all ${theme.transitions.normal}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary.main
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = theme.shadows.lg
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.colors.neutral.gray300
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <img
              src={faceUrl}
              alt={`Face option ${index + 1}`}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: theme.borderRadius.sm,
                display: 'block'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default FaceCustomizer
