import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { imageGridStyle, imageStyle } from '../../styles/dialogs/ImagePickerDialogStyles'

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
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error ? (
          <div className="text-danger">{error}</div>
        ) : imagePaths.length === 0 ? (
          <div>No images found</div>
        ) : (
          <div style={imageGridStyle}>
            {imagePaths.map((imagePath) => (
              <img
                key={imagePath}
                src={imagePath}
                alt="Image"
                style={imageStyle}
                onClick={() => handleImageSelect(imagePath)}
                onError={() => setError('Failed to load some images')}
              />
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  )
}
