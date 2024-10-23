import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'

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

  useEffect(() => {
    const images = import.meta.glob('/src/assets/**/*.{png,jpg,jpeg}', {
      eager: true
    })
    const imageUrls = Object.keys(images).filter((imagePath) => imagePath.includes(path))
    setImagePaths(imageUrls)
  }, [path])

  const handleImageSelect = (imagePath: string) => {
    onSelectImage(imagePath)
    onClose()
  }

  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={imageGridStyle}>
          {imagePaths.map((imagePath) => (
            <img
              key={imagePath}
              src={imagePath}
              alt="Image"
              style={imageStyle}
              onClick={() => handleImageSelect(imagePath)}
            />
          ))}
        </div>
      </Modal.Body>
    </Modal>
  )
}

const imageGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
  gap: '10px',
  marginTop: '20px'
}

const imageStyle: React.CSSProperties = {
  width: '100%',
  cursor: 'pointer',
  borderRadius: '8px',
  transition: 'transform 0.2s'
}
