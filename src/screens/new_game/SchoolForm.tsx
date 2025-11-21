import React from 'react'
import { Form } from 'react-bootstrap'
import GameButton from '../../components/buttons/GameButton'
import GameInput from '../../components/forms/GameInput'
import { CONSTANTS } from '../../constants'
import { ImagePickerDialog } from '../../frontend/dialogs/ImagePickerDialog'
import { useImagePicker } from '../../hooks/useImagePicker'
import { SaveData } from '../../services/savegame/types'
import { theme } from '../../theme/theme'

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
      <Form>
        <GameInput
          type="text"
          placeholder="School Name"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          label="School Name"
        />
        <Form.Group style={{ marginBottom: theme.spacing.lg }}>
          {data.crestPath && (
            <div
              style={{
                marginBottom: theme.spacing.md,
                textAlign: 'center'
              }}
            >
              <img
                src={data.crestPath}
                alt="School Crest"
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: theme.borderRadius.lg,
                  border: `3px solid ${theme.colors.secondary.main}`,
                  objectFit: 'contain',
                  background: theme.colors.neutral.white,
                  padding: theme.spacing.sm,
                  boxShadow: theme.shadows.lg
                }}
              />
            </div>
          )}
          <GameButton
            variant="secondary"
            onClick={openDialog}
            fullWidth
          >
            {data.crestPath ? 'Change School Crest' : 'Pick School Crest'}
          </GameButton>
        </Form.Group>
        <GameInput
          type="text"
          placeholder="School Color (e.g., #FF6B35 or Blue)"
          value={data.color}
          onChange={(e) => onChange('color', e.target.value)}
          label="School Color"
          helperText="Enter a color name or hex code"
        />
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            marginTop: theme.spacing.xl
          }}
        >
          <GameButton variant="secondary" onClick={onBack} fullWidth>
            Back
          </GameButton>
          <GameButton variant="primary" onClick={onStartGame} fullWidth size="lg" glow>
            Start Game
          </GameButton>
        </div>
      </Form>
    </div>
  )
}

export default SchoolForm
