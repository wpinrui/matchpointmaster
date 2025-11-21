import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { imageGridStyle, imageStyle } from '../../styles/dialogs/ImagePickerDialogStyles'
import { theme } from '../../theme/theme'

type ImagePickerDialogProps = {
  path: string
  onSelectImage: (imagePath: string) => void
  isOpen: boolean
  onClose: () => void
}

export const ImagePickerDialog: React.FC<ImagePickerDialogProps> = ({
  path,
  onSelectImage,
  isOpen,
  onClose
}) => {
  const [imagePaths, setImagePaths] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setImagePaths([])
      setError(null)
      return
    }

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
    >
      <Modal.Header
        closeButton
        style={{
          background: theme.gradients.primary,
          color: theme.colors.text.inverse,
          borderBottom: 'none',
          borderRadius: `${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0`
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
          padding: theme.spacing.xl
        }}
      >
        {error ? (
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
          <div style={imageGridStyle}>
            {imagePaths.map((imagePath) => (
              <img
                key={imagePath}
                src={imagePath}
                alt="Image"
                style={{
                  ...imageStyle,
                  border: `2px solid ${theme.colors.neutral.gray300}`,
                  borderRadius: theme.borderRadius.md
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
    </Modal>
  )
}
