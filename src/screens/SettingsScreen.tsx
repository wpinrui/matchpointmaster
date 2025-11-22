import React, { useState } from 'react'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { theme } from '../theme/theme'
import GameCard from '../components/cards/GameCard'
import GameButton from '../components/buttons/GameButton'
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog'

const SettingsScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { exportToJson, clearCurrentSave } = useSaveDataContext()
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageDialogTitle, setMessageDialogTitle] = useState('')
  const [messageDialogMessage, setMessageDialogMessage] = useState('')
  const [messageDialogVariant, setMessageDialogVariant] = useState<'primary' | 'danger'>(
    'primary'
  )

  const handleExport = () => {
    const result = exportToJson()
    setMessageDialogTitle(result.success ? 'Success' : 'Export Failed')
    setMessageDialogMessage(result.message)
    setMessageDialogVariant(result.success ? 'primary' : 'danger')
    setShowMessageDialog(true)
  }

  const handleClear = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all current save data? This will reset your game to the initial state. This action cannot be undone.'
      )
    ) {
      clearCurrentSave()
      // Navigate to LOAD screen to show the cleared state
      changeScreen(Screens.LOAD)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.lg,
        height: '100%'
      }}
    >
      <h1
        style={{
          fontFamily: theme.typography.fontFamily.heading,
          fontSize: theme.typography.fontSize['3xl'],
          fontWeight: theme.typography.fontWeight.extrabold,
          background: theme.gradients.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: theme.spacing.xl,
          textAlign: 'left'
        }}
      >
        Settings
      </h1>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.lg
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.md
            }}
          >
            Save Management
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.md
            }}
          >
            <GameButton
              variant="primary"
              onClick={() => changeScreen(Screens.SAVE_MANAGER)}
              type="button"
            >
              Manage Saves
            </GameButton>
            <GameButton variant="secondary" onClick={handleExport} type="button">
              Export Save
            </GameButton>
            <GameButton variant="danger" onClick={handleClear} type="button">
              Clear Data
            </GameButton>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showMessageDialog}
        title={messageDialogTitle}
        message={messageDialogMessage}
        confirmText="OK"
        cancelText={null}
        onConfirm={() => setShowMessageDialog(false)}
        onCancel={() => setShowMessageDialog(false)}
        variant={messageDialogVariant}
      />
    </div>
  )
}

export default SettingsScreen
