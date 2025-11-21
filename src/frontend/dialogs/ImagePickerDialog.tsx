import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { theme } from '../../theme/theme'
import FaceCustomizer from '../../components/forms/FaceCustomizer'
import { Gender } from '../../services/savegame/types'

type ImagePickerDialogProps = {
  path: string
  onSelectImage: (imagePath: string) => void
  isOpen: boolean
  onClose: () => void
  gender?: Gender
}

export const ImagePickerDialog: React.FC<ImagePickerDialogProps> = ({
  path,
  onSelectImage,
  isOpen,
  onClose,
  gender
}) => {
  const [imagePaths, setImagePaths] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedFaceUrl, setSelectedFaceUrl] = useState<string>('')

  useEffect(() => {
    if (!isOpen) {
      setImagePaths([])
      setError(null)
      setSelectedFaceUrl('')
      return
    }

    // Use face customizer for manager faces
    if (path.includes('manager_faces')) {
      return
    }

    // Load from assets for other paths (like school crests)
    try {
      const images = import.meta.glob('/src/assets/**/*.{png,jpg,jpeg}', {
        eager: true
      })
      
      // Filter by path and extract the actual image URLs
      // With eager: true, Vite returns the imported modules directly
      const imageUrls: string[] = []
      Object.entries(images).forEach(([filePath, module]) => {
        if (filePath.includes(path)) {
          // For images, the module is typically a string URL or an object with default
          let imageUrl: string | undefined
          
          if (typeof module === 'string') {
            imageUrl = module
          } else if (typeof module === 'object' && module !== null) {
            // Check for default export
            if ('default' in module) {
              imageUrl = (module as { default: string }).default
            } else if ('src' in module) {
              imageUrl = (module as { src: string }).src
            }
          }
          
          if (imageUrl && typeof imageUrl === 'string') {
            imageUrls.push(imageUrl)
          }
        }
      })
      
      console.log('Loaded images:', imageUrls.length, 'for path:', path)
      setImagePaths(imageUrls)
      setError(imageUrls.length === 0 ? 'No images found in this folder' : null)
    } catch (err) {
      console.error('Error loading images:', err)
      setError('Failed to load images')
      setImagePaths([])
    }
  }, [path, isOpen])

  const handleFaceChange = (faceUrl: string) => {
    setSelectedFaceUrl(faceUrl)
  }

  const handleConfirm = () => {
    if (selectedFaceUrl) {
      onSelectImage(selectedFaceUrl)
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

  return (
    <Modal
      show={isOpen}
      onHide={handleClose}
      backdrop={true}
      keyboard={true}
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
        {path.includes('manager_faces') ? (
          <FaceCustomizer
            initialSeed={`manager-${Date.now()}`}
            onFaceChange={handleFaceChange}
            gender={gender}
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
      {path.includes('manager_faces') && (
        <Modal.Footer
          style={{
            background: theme.colors.background.primary,
            borderTop: `1px solid ${theme.colors.neutral.gray300}`,
            borderRadius: `0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg}`
          }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.xl}`,
              background: theme.colors.neutral.gray300,
              color: theme.colors.text.primary,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.medium,
              marginRight: theme.spacing.md
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedFaceUrl}
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.xl}`,
              background: selectedFaceUrl
                ? theme.gradients.primary
                : theme.colors.neutral.gray300,
              color: selectedFaceUrl
                ? theme.colors.text.inverse
                : theme.colors.text.secondary,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              cursor: selectedFaceUrl ? 'pointer' : 'not-allowed',
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.medium,
              opacity: selectedFaceUrl ? 1 : 0.6
            }}
          >
            Confirm
          </button>
        </Modal.Footer>
      )}
    </Modal>
  )
}
