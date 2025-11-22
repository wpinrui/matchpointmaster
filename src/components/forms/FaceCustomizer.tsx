import React, { useCallback, useState } from 'react'
import { Gender } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import { generateFaceSet } from '../../utils/faceGeneration'
import { FaceGrid } from '../faces/FaceGrid'
import { RandomizeButton } from '../faces/RandomizeButton'

interface FaceCustomizerProps {
  initialSeed?: string
  onFaceChange: (faceUrl: string) => void
  gender?: Gender
  currentSelectedFace?: string // The currently selected face URL (if reopening dialog)
  storedFaceOptions?: string[] // Previously generated face options (to restore)
  onFaceOptionsChange?: (faces: string[]) => void // Callback to store face options
}

const FaceCustomizer: React.FC<FaceCustomizerProps> = ({
  initialSeed,
  onFaceChange,
  gender,
  currentSelectedFace,
  storedFaceOptions = [],
  onFaceOptionsChange
}) => {
  const [faceOptions, setFaceOptions] = useState<string[]>(storedFaceOptions)
  const [selectedFaceUrl, setSelectedFaceUrl] = useState<string>('')

  // Generate 6 random faces
  const generateFaces = useCallback(() => {
    const faces = generateFaceSet(6, initialSeed || 'manager', gender)
    setFaceOptions(faces)
    // Store faces in parent component
    onFaceOptionsChange?.(faces)
    // Auto-select first face (or previously selected if it exists in new set)
    if (faces.length > 0) {
      const previousSelection =
        currentSelectedFace && faces.includes(currentSelectedFace)
          ? currentSelectedFace
          : faces[0]
      setSelectedFaceUrl(previousSelection)
      onFaceChange(previousSelection)
    }
  }, [initialSeed, onFaceChange, gender, currentSelectedFace, onFaceOptionsChange])

  // Track previous gender to detect changes
  const prevGenderRef = React.useRef<Gender | undefined>(gender)

  // Initialize faces: use stored options if available, otherwise generate new ones
  // When gender changes, always regenerate faces and reset selection
  React.useEffect(() => {
    const genderChanged = prevGenderRef.current !== gender
    prevGenderRef.current = gender

    // If gender changed, always reset and generate new faces
    if (genderChanged) {
      setSelectedFaceUrl('')
      const faces = generateFaceSet(6, initialSeed || 'manager', gender)
      setFaceOptions(faces)
      onFaceOptionsChange?.(faces)
      // Always select first face when gender changes
      if (faces.length > 0) {
        setSelectedFaceUrl(faces[0])
        onFaceChange(faces[0])
      }
      return
    }

    // Normal initialization: use stored options if available
    if (storedFaceOptions.length > 0) {
      // Restore stored faces
      setFaceOptions(storedFaceOptions)
      // Select the previously selected face if it's in the stored options
      if (currentSelectedFace && storedFaceOptions.includes(currentSelectedFace)) {
        setSelectedFaceUrl(currentSelectedFace)
        onFaceChange(currentSelectedFace)
      } else if (storedFaceOptions.length > 0) {
        // Otherwise select first face
        setSelectedFaceUrl(storedFaceOptions[0])
        onFaceChange(storedFaceOptions[0])
      }
    } else {
      // Generate new faces only if we don't have stored ones
      const faces = generateFaceSet(6, initialSeed || 'manager', gender)
      setFaceOptions(faces)
      onFaceOptionsChange?.(faces)

      // Select face: prefer currentSelectedFace if it exists in new set, otherwise first
      if (faces.length > 0) {
        let faceToSelect = faces[0]
        if (currentSelectedFace && faces.includes(currentSelectedFace)) {
          faceToSelect = currentSelectedFace
        }
        setSelectedFaceUrl(faceToSelect)
        onFaceChange(faceToSelect)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender, storedFaceOptions]) // Regenerate when gender changes or stored options change

  const handleFaceSelect = (faceUrl: string) => {
    setSelectedFaceUrl(faceUrl)
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
      <RandomizeButton onClick={generateFaces} />
      <FaceGrid
        faceOptions={faceOptions}
        selectedFaceUrl={selectedFaceUrl}
        onFaceSelect={handleFaceSelect}
      />
    </div>
  )
}

export default FaceCustomizer
