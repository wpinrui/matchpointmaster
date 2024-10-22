import React from 'react'
import { Button, Form } from 'react-bootstrap'

const SchoolForm: React.FC<{
  data: any // use a more specific type in production
  onChange: (key: string, value: string) => void
  onStartGame: () => void
  onBack: () => void
}> = ({ data, onChange, onStartGame, onBack }) => (
  <div>
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
        <Form.Label>School Crest</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={(e: any) =>
            onChange('crest', e.target.files ? e.target.files[0] : null)
          }
          className="mb-2"
        />
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

export default SchoolForm
