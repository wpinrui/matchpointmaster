import React from 'react'
import { Button, Form } from 'react-bootstrap'
import { CONSTANTS } from '../../constants'
import { ImagePickerDialog } from '../../frontend/dialogs/ImagePickerDialog'
import DropdownWithTooltip from '../../frontend/forms/DropdownWithTooltip'
import { SaveData } from '../../services/savegame/types'
import { useImagePicker } from '../../hooks/useImagePicker'
import { GENDER_OPTIONS } from '../../utils/constants'
import { newGameTextRecords } from './newGameTextRecords'

const ManagerForm: React.FC<{
  data: SaveData['manager']
  onChange: (key: keyof SaveData['manager'], value: string | File | null) => void
  onNext: () => void
}> = ({ data, onChange, onNext }) => {
  const { isDialogOpen, openDialog, closeDialog } = useImagePicker()

  const handleImageSelect = (imagePath: string) => {
    onChange('imagePath', imagePath)
    closeDialog()
  }

  return (
    <div>
      {isDialogOpen && (
        <ImagePickerDialog
          isOpen={isDialogOpen}
          path={CONSTANTS.managerFacesPath}
          onSelectImage={handleImageSelect}
          onClose={closeDialog}
        />
      )}
      <h4>Manager Information</h4>
      <Form>
        <Form.Group controlId="managerName">
          <Form.Control
            type="text"
            placeholder="Manager Name"
            value={data.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
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
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group controlId="profileImage">
          {data.imagePath && <img src={data.imagePath} alt="Profile" />}
          <Button
            variant="secondary"
            onClick={openDialog}
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
          selectedValue={data.gripStyle}
          onChange={(value) => onChange('gripStyle', value)}
        />
        <DropdownWithTooltip
          label="Favors"
          options={newGameTextRecords.favoursDescriptions}
          selectedValue={data.forehandBackhandTendency}
          onChange={(value) => onChange('forehandBackhandTendency', value)}
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
