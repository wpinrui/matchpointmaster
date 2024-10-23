import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { CONSTANTS } from '../../constants'
import { ImagePickerDialog } from '../../frontend/dialogs/ImagePickerDialog'
import DropdownWithTooltip from '../../frontend/forms/DropdownWithTooltip'
import { newGameTextRecords } from './newGameTextRecords'
import { ManagerProfile } from './types'

const onSelectImage = (imagePath: string, data: ManagerProfile): void => {
  data.profileImagePath = imagePath
}

const ManagerForm: React.FC<{
  data: ManagerProfile
  onChange: (key: string, value: string | File | null) => void
  onNext: () => void
}> = ({ data, onChange, onNext }) => {
  const [isDialogPickerOpen, setIsDialogPickerOpen] = useState(false)
  return (
    <div>
      {isDialogPickerOpen && (
        <ImagePickerDialog
          isOpen={isDialogPickerOpen}
          path={CONSTANTS.managerFacesPath}
          onSelectImage={(imagePath) => onSelectImage(imagePath, data)}
          onClose={() => setIsDialogPickerOpen(false)}
        />
      )}
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
          {data.profileImagePath && <img src={data.profileImagePath} alt="Profile" />}
          <Button
            variant="secondary"
            onClick={() => setIsDialogPickerOpen(true)}
            className="mb-2"
          >
            Pick Profile Image
          </Button>
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
}

export default ManagerForm
