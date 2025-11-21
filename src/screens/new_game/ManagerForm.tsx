import React from 'react'
import { Form } from 'react-bootstrap'
import { CONSTANTS } from '../../constants'
import { ImagePickerDialog } from '../../frontend/dialogs/ImagePickerDialog'
import GameDropdown from '../../components/forms/GameDropdown'
import { SaveData } from '../../services/savegame/types'
import { useImagePicker } from '../../hooks/useImagePicker'
import { GENDER_OPTIONS } from '../../utils/constants'
import { theme } from '../../theme/theme'
import GameInput from '../../components/forms/GameInput'
import GameButton from '../../components/buttons/GameButton'
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
    <div className="slide-in">
      {isDialogOpen && (
        <ImagePickerDialog
          isOpen={isDialogOpen}
          path={CONSTANTS.managerFacesPath}
          onSelectImage={handleImageSelect}
          onClose={closeDialog}
          gender={data.gender}
        />
      )}
      <h4
        style={{
          fontFamily: theme.typography.fontFamily.heading,
          fontSize: theme.typography.fontSize['2xl'],
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.xl,
          textAlign: 'center'
        }}
      >
        Manager Information
      </h4>
      <Form>
        <GameInput
          type="text"
          placeholder="e.g., John Smith"
          value={data.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          label="Full Name"
          helperText="Your complete name (e.g., John Smith, Maria Garcia)"
        />
        <GameInput
          type="text"
          placeholder="e.g., John"
          value={data.shortName}
          onChange={(e) => onChange('shortName', e.target.value)}
          label="Short Name"
          helperText="A shorter version of your name used in game (e.g., John, Maria, Coach J)"
        />
        <Form.Group style={{ marginBottom: theme.spacing.lg }}>
          <Form.Label
            style={{
              display: 'block',
              marginBottom: theme.spacing.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.sm
            }}
          >
            Gender
          </Form.Label>
          <Form.Select
            value={data.gender}
            onChange={(e) => onChange('gender', e.target.value)}
            style={{
              background: theme.colors.neutral.white,
              border: `2px solid ${theme.colors.neutral.gray300}`,
              borderRadius: theme.borderRadius.md,
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.primary,
              transition: `all ${theme.transitions.fast}`,
              width: '100%',
              boxShadow: theme.shadows.sm
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme.colors.primary.main
              e.target.style.boxShadow = theme.shadows.md
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.neutral.gray300
              e.target.style.boxShadow = theme.shadows.sm
            }}
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group style={{ marginBottom: theme.spacing.lg }}>
          {data.imagePath && (
            <div
              style={{
                marginBottom: theme.spacing.md,
                textAlign: 'center'
              }}
            >
              <img
                src={data.imagePath}
                alt="Profile"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: theme.borderRadius.full,
                  border: `3px solid ${theme.colors.primary.main}`,
                  objectFit: 'cover',
                  boxShadow: theme.shadows.lg
                }}
              />
            </div>
          )}
          <GameButton
            variant="secondary"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openDialog()
            }}
            fullWidth
            type="button"
          >
            {data.imagePath ? 'Change Profile Image' : 'Pick Profile Image'}
          </GameButton>
        </Form.Group>
        <GameDropdown
          label="Handedness"
          options={newGameTextRecords.handednessDescriptions}
          selectedValue={data.handedness}
          onChange={(value) => onChange('handedness', value)}
          description="Your dominant hand affects coaching effectiveness"
        />
        <GameDropdown
          label="Forehand Rubber"
          options={newGameTextRecords.rubberDescriptions}
          selectedValue={data.forehandRubber}
          onChange={(value) => onChange('forehandRubber', value)}
          description="The rubber type used on your forehand side"
        />
        <GameDropdown
          label="Backhand Rubber"
          options={newGameTextRecords.rubberDescriptions}
          selectedValue={data.backhandRubber}
          onChange={(value) => onChange('backhandRubber', value)}
          description="The rubber type used on your backhand side"
        />
        <GameDropdown
          label="Grip Style"
          options={newGameTextRecords.gripDescriptions}
          selectedValue={data.gripStyle}
          onChange={(value) => onChange('gripStyle', value)}
          description="How you hold the paddle affects your playing style"
        />
        <GameDropdown
          label="Favors"
          options={newGameTextRecords.favoursDescriptions}
          selectedValue={data.forehandBackhandTendency}
          onChange={(value) => onChange('forehandBackhandTendency', value)}
          description="Your preference between forehand and backhand shots"
        />
        <GameDropdown
          label="Playing Style"
          options={newGameTextRecords.playStyleDescriptions}
          selectedValue={data.playStyle}
          onChange={(value) => onChange('playStyle', value)}
          description="Your overall approach to the game"
        />
        <div style={{ marginTop: theme.spacing.xl }}>
          <GameButton variant="primary" onClick={onNext} size="lg" fullWidth glow>
            Next
          </GameButton>
        </div>
      </Form>
    </div>
  )
}

export default ManagerForm
