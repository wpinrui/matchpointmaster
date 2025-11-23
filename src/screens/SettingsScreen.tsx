import React, { useState } from 'react'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { theme } from '../theme/theme'
import GameCard from '../components/cards/GameCard'
import GameButton from '../components/buttons/GameButton'
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog'

const SettingsScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { exportToJson, clearAllSaves } = useSaveDataContext()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageDialogTitle, setMessageDialogTitle] = useState('')
  const [messageDialogMessage, setMessageDialogMessage] = useState('')
  const [messageDialogVariant, setMessageDialogVariant] = useState<'primary' | 'danger'>(
    'primary'
  )

  const handleExport = async () => {
    const result = await exportToJson()
    setMessageDialogTitle(result.success ? 'Success' : 'Export Failed')
    setMessageDialogMessage(result.message)
    setMessageDialogVariant(result.success ? 'primary' : 'danger')
    setShowMessageDialog(true)
  }

  const handleClear = async () => {
    setShowClearConfirm(true)
  }

  const handleClearConfirm = async () => {
    try {
      await clearAllSaves()
      setMessageDialogTitle('Success')
      setMessageDialogMessage('All save data has been cleared successfully.')
      setMessageDialogVariant('primary')
      setShowMessageDialog(true)
      setShowClearConfirm(false)
      // Navigate to LOAD screen to show the cleared state
      changeScreen(Screens.LOAD)
    } catch (error) {
      setMessageDialogTitle('Error')
      setMessageDialogMessage('Failed to clear all save data. Please try again.')
      setMessageDialogVariant('danger')
      setShowMessageDialog(true)
      setShowClearConfirm(false)
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
        isOpen={showClearConfirm}
        title="Clear All Save Data"
        message="Are you sure you want to delete ALL save data? This will permanently delete all save slots and cannot be undone. This action will reset your game to the initial state."
        confirmText="Delete All"
        cancelText="Cancel"
        onConfirm={handleClearConfirm}
        onCancel={() => setShowClearConfirm(false)}
        variant="danger"
      />

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
