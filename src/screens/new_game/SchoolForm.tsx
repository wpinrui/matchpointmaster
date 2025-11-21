import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { CONSTANTS } from '../../constants'
import { ImagePickerDialog } from '../../frontend/dialogs/ImagePickerDialog'
import { SaveData } from '../../services/savegame/types'

const SchoolForm: React.FC<{
  data: SaveData['school']
  onChange: (key: keyof SaveData['school'], value: string) => void
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
          onSelectImage={(imagePath) => {
            onChange('crestPath', imagePath)
            setIsDialogPickerOpen(false)
          }}
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
          {data.crestPath && <img src={data.crestPath} alt="schoolCrest" />}
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
