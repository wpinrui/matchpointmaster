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
    try {
      const images = import.meta.glob('/src/assets/**/*.{png,jpg,jpeg}', {
        eager: true
      })
      const imageUrls = Object.keys(images).filter((imagePath) =>
        imagePath.includes(path)
      )
      setImagePaths(imageUrls)
      setError(null)
    } catch (err) {
      setError('Failed to load images')
      console.error('Error loading images:', err)
    }
  }, [path])

  const handleImageSelect = (imagePath: string) => {
    onSelectImage(imagePath)
  }

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
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
