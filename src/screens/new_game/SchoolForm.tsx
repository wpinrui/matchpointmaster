import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { CONSTANTS } from '../../constants'
import { ImagePickerDialog } from '../../frontend/dialogs/ImagePickerDialog'
import { SchoolProfile } from './types'

const onSelectImage = (imagePath: string, data: SchoolProfile): void => {
  data.crestImagePath = imagePath
}

const SchoolForm: React.FC<{
  data: SchoolProfile
  onChange: (key: string, value: string) => void
  onStartGame: () => void
  onBack: () => void
}> = ({ data, onChange, onStartGame, onBack }) => {
  const [isDialogPickerOpen, setIsDialogPickerOpen] = useState(false)

  return (
    <div>
      {isDialogPickerOpen && (
        <ImagePickerDialog
          isOpen={isDialogPickerOpen}
          path={CONSTANTS.schoolCrestsPath}
          onSelectImage={(imagePath) => onSelectImage(imagePath, data)}
          onClose={() => setIsDialogPickerOpen(false)}
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
          {data.crestImagePath && <img src={data.crestImagePath} alt="schoolCrest" />}
          <Button
            variant="secondary"
            onClick={() => setIsDialogPickerOpen(true)}
            className="mb-2"
          >
            Pick School Crest
          </Button>
        </Form.Group>
        <Form.Group controlId="schoolColors">
          <Form.Control
            type="text"
            placeholder="School Colors"
            value={data.colors}
            onChange={(e) => onChange('colors', e.target.value)}
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
