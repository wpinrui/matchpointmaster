import React from 'react'
import { Form } from 'react-bootstrap'
import GameButton from '../../components/buttons/GameButton'
import GameInput from '../../components/forms/GameInput'
import { CONSTANTS } from '../../constants'
import { ImagePickerDialog } from '../../components/dialogs/ImagePickerDialog'
import { useImagePicker } from '../../hooks/useImagePicker'
import { SaveData } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import { SchoolValidationErrors } from '../../utils/validation'
import { CrestImagePicker } from '../../components/forms/CrestImagePicker'

const SchoolForm: React.FC<{
  data: SaveData['school']
  onChange: (key: keyof SaveData['school'], value: string) => void
  onStartGame: () => void
  onBack: () => void
  errors: SchoolValidationErrors
}> = ({ data, onChange, onStartGame, onBack, errors }) => {
  const { isDialogOpen, openDialog, closeDialog } = useImagePicker()

  const handleImageSelect = (imagePath: string) => {
    onChange('crestPath', imagePath)
    closeDialog()
  }

  return (
    <div className="slide-in">
      {isDialogOpen && (
        <ImagePickerDialog
          isOpen={isDialogOpen}
          path={CONSTANTS.schoolCrestsPath}
          onSelectImage={handleImageSelect}
          onClose={closeDialog}
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
        School Information
      </h4>
      <Form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <div className={errors.name ? 'validation-error' : ''}>
          <GameInput
            type="text"
            placeholder="School Name"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            label="School Name"
            error={errors.name}
          />
        </div>
        <div className={errors.crestPath ? 'validation-error' : ''}>
          <CrestImagePicker
            crestPath={data.crestPath}
            onPickCrest={openDialog}
            error={errors.crestPath}
          />
        </div>
        <div className={errors.color ? 'validation-error' : ''}>
          <GameInput
            type="text"
            placeholder="School Color (e.g., #FF6B35 or Blue)"
            value={data.color}
            onChange={(e) => onChange('color', e.target.value)}
            label="School Color"
            helperText="Enter a color name or hex code"
            error={errors.color}
          />
        </div>
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            marginTop: theme.spacing.xl
          }}
        >
          <GameButton
            variant="secondary"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onBack()
            }}
            fullWidth
            type="button"
          >
            Back
          </GameButton>
          <GameButton
            variant="primary"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onStartGame()
            }}
            fullWidth
            size="lg"
            glow
            type="button"
          >
            Start Game
          </GameButton>
        </div>
      </Form>
    </div>
  )
}

export default SchoolForm
