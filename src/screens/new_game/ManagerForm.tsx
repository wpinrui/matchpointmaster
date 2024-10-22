import React from 'react'
import { Button, Form } from 'react-bootstrap'
import DropdownWithTooltip from '../../frontend/forms/DropdownWithTooltip'
import { newGameTextRecords } from './newGameTextRecords'

const ManagerForm: React.FC<{
  data: any // use a more specific type in production
  onChange: (key: string, value: string | File | null) => void
  onNext: () => void
}> = ({ data, onChange, onNext }) => (
  <div>
    <h4>Manager Information</h4>
    <Form>
      <Form.Group controlId="managerName">
        <Form.Control
          type="text"
          placeholder="Manager Name"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="mb-2"
        />
      </Form.Group>
      <Form.Group controlId="shortName">
        <Form.Control
          type="text"
          placeholder="Short Name"
          value={data.shortName}
          onChange={(e) => onChange('shortName', e.target.value)}
          className="mb-2"
        />
      </Form.Group>
      <Form.Group controlId="genderSelect">
        <Form.Select
          value={data.gender}
          onChange={(e) => onChange('gender', e.target.value)}
          className="mb-2"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Form.Select>
      </Form.Group>
      <Form.Group controlId="profileImage">
        <Form.Label>Profile Image</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={(e: any) =>
            onChange('profileImage', e.target.files ? e.target.files[0] : null)
          }
          className="mb-2"
        />
      </Form.Group>
      <DropdownWithTooltip
        label="Handedness"
        options={newGameTextRecords.handednessDescriptions}
        selectedValue={data.handedness}
        onChange={(value) => onChange('handedness', value)}
      />
      <DropdownWithTooltip
        label="Forehand Rubber"
        options={newGameTextRecords.rubberDescriptions}
        selectedValue={data.forehandRubber}
        onChange={(value) => onChange('forehandRubber', value)}
      />
      <DropdownWithTooltip
        label="Backhand Rubber"
        options={newGameTextRecords.rubberDescriptions}
        selectedValue={data.backhandRubber}
        onChange={(value) => onChange('backhandRubber', value)}
      />
      <DropdownWithTooltip
        label="Grip Style"
        options={newGameTextRecords.gripDescriptions}
        selectedValue={data.grip}
        onChange={(value) => onChange('grip', value)}
      />
      <DropdownWithTooltip
        label="Favors"
        options={newGameTextRecords.favoursDescriptions}
        selectedValue={data.favors}
        onChange={(value) => onChange('favors', value)}
      />
      <DropdownWithTooltip
        label="Playing Style"
        options={newGameTextRecords.playStyleDescriptions}
        selectedValue={data.playStyle}
        onChange={(value) => onChange('playStyle', value)}
      />
      <Button onClick={onNext}>Next</Button>
    </Form>
  </div>
)

export default ManagerForm
