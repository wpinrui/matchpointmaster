import React, { useState, useEffect } from 'react'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { theme } from '../theme/theme'
import { CommonStyles } from '../styles/common/CommonStyles'
import GameCard from '../components/cards/GameCard'
import GameButton from '../components/buttons/GameButton'
import { SaveSlotCard } from '../components/save/SaveSlotCard'
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog'
import {
  getAllSaveSlots,
  deleteSaveSlot,
  getCurrentSaveId,
  importSaveSlotFromJson,
  SaveSlot
} from '../services/savegame/saveManager'
import { useFileImport } from '../hooks/useFileImport'
import BackgroundImage from '../assets/tabletennisphoto.jpg'

const SaveManagerScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { loadSaveSlot, currentSaveId } = useSaveDataContext()
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([])
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<string | null>(null)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageDialogTitle, setMessageDialogTitle] = useState('')
  const [messageDialogMessage, setMessageDialogMessage] = useState('')
  const [messageDialogVariant, setMessageDialogVariant] = useState<'primary' | 'danger'>(
    'primary'
  )

  useEffect(() => {
    refreshSaveSlots()
  }, [])

  const refreshSaveSlots = async () => {
    const slots = await getAllSaveSlots()
    setSaveSlots(slots)
  }

  const handleLoadSave = async (slotId: string) => {
    await loadSaveSlot(slotId)
    changeScreen(Screens.HOME)
  }

  const handleDeleteClick = (slotId: string) => {
    setDeleteConfirmSlot(slotId)
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirmSlot) {
      await deleteSaveSlot(deleteConfirmSlot)
      await refreshSaveSlots()
      setDeleteConfirmSlot(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmSlot(null)
  }

  const handleFileImport = async (json: string) => {
    try {
      const importedSlot = await importSaveSlotFromJson(json)
      if (importedSlot) {
        // Slot is already saved to IndexedDB by importSaveSlotFromJson
        await refreshSaveSlots()
        setMessageDialogTitle('Success')
        setMessageDialogMessage('Save imported successfully!')
        setMessageDialogVariant('primary')
        setShowMessageDialog(true)
      } else {
        setMessageDialogTitle('Invalid File')
        setMessageDialogMessage('Invalid save file format.')
        setMessageDialogVariant('danger')
        setShowMessageDialog(true)
      }
    } catch {
      setMessageDialogTitle('Import Failed')
      setMessageDialogMessage('Failed to import save file. Please check the file format.')
      setMessageDialogVariant('danger')
      setShowMessageDialog(true)
    }
  }

  const { fileInputRef, handleImport, handleFileChange } = useFileImport({
    onImport: handleFileImport,
    onError: () => {
      setMessageDialogTitle('Import Failed')
      setMessageDialogMessage('Failed to import save file. Please check the file format.')
      setMessageDialogVariant('danger')
      setShowMessageDialog(true)
    }
  })

  return (
    <div
      style={CommonStyles.containerStyle}
      className="d-flex justify-content-center align-items-center fade-in"
    >
      <img
        src={BackgroundImage}
        alt="Background image"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }}
      />
      <div style={CommonStyles.blurStyle} />
      <GameCard
        style={{
          ...CommonStyles.dialogStyle,
          maxWidth: '900px',
          width: '100%'
        }}
        glow
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
            textAlign: 'center'
          }}
        >
          Save Manager
        </h1>

        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            marginBottom: theme.spacing.xl,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <GameButton
            variant="primary"
            onClick={() => changeScreen(Screens.NEW_GAME)}
            type="button"
          >
            New Game
          </GameButton>
          <GameButton variant="secondary" onClick={handleImport} type="button">
            Import Save
          </GameButton>
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        {saveSlots.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: theme.spacing.xl,
              color: theme.colors.text.secondary
            }}
          >
            <p style={{ fontSize: theme.typography.fontSize.lg }}>
              No save games found. Start a new game to create your first save!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.md,
              maxHeight: '500px',
              overflowY: 'auto',
              paddingRight: theme.spacing.sm
            }}
          >
            {saveSlots.map((slot) => (
              <SaveSlotCard
                key={slot.id}
                slot={slot}
                isCurrent={currentSaveId === slot.id}
                onLoad={handleLoadSave}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        <div style={{ marginTop: theme.spacing.xl, textAlign: 'center' }}>
          <GameButton
            variant="secondary"
            onClick={() => changeScreen(Screens.LOAD)}
            type="button"
          >
            Back
          </GameButton>
        </div>
      </GameCard>

      <ConfirmDialog
        isOpen={deleteConfirmSlot !== null}
        title="Delete Save?"
        message="Are you sure you want to delete this save? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
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

export default SaveManagerScreen
