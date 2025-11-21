import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useImageLoader } from '../../hooks/useImageLoader'
import { Gender } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import FaceCustomizer from '../forms/FaceCustomizer'
import { CrestCustomizer } from '../crests/CrestCustomizer'
import { ImagePickerDialogFooter } from './ImagePickerDialogFooter'

type ImagePickerDialogProps = {
  path: string
  onSelectImage: (imagePath: string) => void
  isOpen: boolean
  onClose: () => void
  gender?: Gender
  currentImagePath?: string // Currently selected image path (for restoring state)
  storedFaceOptions?: string[] // Previously generated face options (to restore)
  onFaceOptionsChange?: (faces: string[]) => void // Callback to store face options
  // Crest customizer props
  initialPrimaryColor?: string
  initialSecondaryColor?: string
  initialAccentColor?: string
  storedCrestOptions?: string[]
  onCrestOptionsChange?: (crests: string[]) => void
  onColorsChange?: (primary: string, secondary: string, accent: string) => void
}

export const ImagePickerDialog: React.FC<ImagePickerDialogProps> = ({
  path,
  onSelectImage,
  isOpen,
  onClose,
  gender,
  currentImagePath,
  storedFaceOptions = [],
  onFaceOptionsChange,
  initialPrimaryColor,
  initialSecondaryColor,
  initialAccentColor,
  storedCrestOptions = [],
  onCrestOptionsChange,
  onColorsChange
}) => {
  const [selectedFaceUrl, setSelectedFaceUrl] = useState<string>('')
  const [selectedCrestUrl, setSelectedCrestUrl] = useState<string>('')
  const { imagePaths, error, setError } = useImageLoader(path, isOpen)

  const handleFaceChange = (faceUrl: string) => {
    setSelectedFaceUrl(faceUrl)
  }

  const handleCrestChange = (crestUrl: string) => {
    setSelectedCrestUrl(crestUrl)
  }

  const handleConfirm = () => {
    if (selectedFaceUrl || selectedCrestUrl) {
      onSelectImage(selectedFaceUrl || selectedCrestUrl)
    }
  }

  const handleImageSelect = (imagePath: string) => {
    onSelectImage(imagePath)
  }

  const handleClose = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation()
    }
    onClose()
  }

  const isManagerFaces = path.includes('manager_faces')
  const isSchoolCrests = path.includes('school_crests')

  return (
    <Modal
      show={isOpen}
      onHide={handleClose}
      backdrop
      keyboard
      style={{
        zIndex: theme.zIndex.modal
      }}
      contentClassName="image-picker-modal-content"
    >
      <Modal.Header
        closeButton
        style={{
          background: theme.gradients.primary,
          color: theme.colors.text.inverse,
          borderBottom: 'none',
          borderRadius: `${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0`,
          padding: theme.spacing.lg
        }}
      >
        <Modal.Title
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontWeight: theme.typography.fontWeight.bold,
            fontSize: theme.typography.fontSize.xl
          }}
        >
          Select Image
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          background: theme.colors.background.primary,
          padding: theme.spacing.xl,
          borderRadius: `0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg}`
        }}
      >
        {isManagerFaces ? (
          <FaceCustomizer
            initialSeed={`manager-${Date.now()}`}
            onFaceChange={handleFaceChange}
            gender={gender}
            currentSelectedFace={currentImagePath}
            storedFaceOptions={storedFaceOptions}
            onFaceOptionsChange={onFaceOptionsChange}
          />
        ) : isSchoolCrests ? (
          <CrestCustomizer
            initialPrimaryColor={initialPrimaryColor}
            initialSecondaryColor={initialSecondaryColor}
            initialAccentColor={initialAccentColor}
            onCrestChange={handleCrestChange}
            onColorsChange={onColorsChange}
            storedCrestOptions={storedCrestOptions}
            onCrestOptionsChange={onCrestOptionsChange}
            currentSelectedCrest={currentImagePath}
          />
        ) : error ? (
          <div
            style={{
              color: theme.colors.error.main,
              textAlign: 'center',
              padding: theme.spacing.lg
            }}
          >
            {error}
          </div>
        ) : imagePaths.length === 0 ? (
          <div
            style={{
              color: theme.colors.text.secondary,
              textAlign: 'center',
              padding: theme.spacing.lg
            }}
          >
            No images found
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '12px',
              marginTop: '20px'
            }}
          >
            {imagePaths.map((imagePath) => (
              <img
                key={imagePath}
                src={imagePath}
                alt="Image"
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  borderRadius: theme.borderRadius.md,
                  transition: 'transform 0.2s',
                  border: `2px solid ${theme.colors.neutral.gray300}`
                }}
                onClick={() => handleImageSelect(imagePath)}
                onError={() => setError('Failed to load some images')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary.main
                  e.currentTarget.style.transform = 'scale(1.1)'
                  e.currentTarget.style.boxShadow = theme.shadows.lg
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.neutral.gray300
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            ))}
          </div>
        )}
      </Modal.Body>
      {(isManagerFaces || isSchoolCrests) && (
        <ImagePickerDialogFooter
          selectedFaceUrl={selectedFaceUrl || selectedCrestUrl}
          onConfirm={handleConfirm}
          onCancel={handleClose}
        />
      )}
    </Modal>
  )
}
