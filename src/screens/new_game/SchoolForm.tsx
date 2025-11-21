import React from 'react'
import { Button, Form } from 'react-bootstrap'
import { CONSTANTS } from '../../constants'
import { ImagePickerDialog } from '../../frontend/dialogs/ImagePickerDialog'
import { useImagePicker } from '../../hooks/useImagePicker'
import { SaveData } from '../../services/savegame/types'

const SchoolForm: React.FC<{
  data: SaveData['school']
  onChange: (key: keyof SaveData['school'], value: string) => void
  onStartGame: () => void
  onBack: () => void
}> = ({ data, onChange, onStartGame, onBack }) => {
  const { isDialogOpen, openDialog, closeDialog } = useImagePicker()

  const handleImageSelect = (imagePath: string) => {
    onChange('crestPath', imagePath)
    closeDialog()
  }

  return (
    <div>
      {isDialogOpen && (
        <ImagePickerDialog
          isOpen={isDialogOpen}
          path={CONSTANTS.schoolCrestsPath}
          onSelectImage={handleImageSelect}
          onClose={closeDialog}
        />
      )}
      <h4>School Information</h4>
      <Form>
        <Form.Group controlId="schoolName">
          <Form.Control
            type="text"
            placeholder="School Name"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="mb-2"
          />
        </Form.Group>
        <Form.Group controlId="schoolCrest">
          {data.crestPath && <img src={data.crestPath} alt="schoolCrest" />}
          <Button
            variant="secondary"
            onClick={openDialog}
            className="mb-2"
          >
            Pick School Crest
          </Button>
        </Form.Group>
        <Form.Group controlId="schoolColors">
          <Form.Control
            type="text"
            placeholder="School Color"
            value={data.color}
            onChange={(e) => onChange('color', e.target.value)}
            className="mb-2"
          />
        </Form.Group>
        <Button onClick={onStartGame}>Start Game</Button>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
      </Form>
    </div>
  )
}

export default SchoolForm
