import React, { useState, useEffect } from 'react'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { theme } from '../theme/theme'
import { CommonStyles } from '../styles/common/CommonStyles'
import GameCard from '../components/cards/GameCard'
import GameButton from '../components/buttons/GameButton'
import {
  getAllSaveSlots,
  deleteSaveSlot,
  getCurrentSaveId,
  setCurrentSaveId,
  importSaveSlotFromJson,
  saveAllSaveSlots,
  SaveSlot
} from '../services/savegame/saveManager'
import BackgroundImage from '../assets/tabletennisphoto.jpg'

const SaveManagerScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { loadSaveSlot, createNewSave, currentSaveId } = useSaveDataContext()
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([])
  const [fileInputRef] = useState<React.RefObject<HTMLInputElement>>(
    React.createRef<HTMLInputElement>()
  )

  useEffect(() => {
    refreshSaveSlots()
  }, [])

  const refreshSaveSlots = () => {
    setSaveSlots(getAllSaveSlots())
  }

  const handleLoadSave = (slotId: string) => {
    loadSaveSlot(slotId)
    changeScreen(Screens.HOME)
  }

  const handleDeleteSave = (slotId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this save? This action cannot be undone.'
      )
    ) {
      deleteSaveSlot(slotId)
      refreshSaveSlots()
    }
  }

  const handleImportSave = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string
        const importedSlot = importSaveSlotFromJson(json)
        if (importedSlot) {
          // Add the imported slot to the save slots
          const allSlots = getAllSaveSlots()
          // Check if slot with same ID already exists
          const existingIndex = allSlots.findIndex((s) => s.id === importedSlot.id)
          if (existingIndex !== -1) {
            // Update existing slot
            allSlots[existingIndex] = importedSlot
          } else {
            // Add new slot
            allSlots.push(importedSlot)
          }
          // Save all slots
          saveAllSaveSlots(allSlots)
          refreshSaveSlots()
          alert('Save imported successfully!')
        } else {
          alert('Invalid save file format.')
        }
      } catch (error) {
        console.error('Error importing save:', error)
        alert('Failed to import save file. Please check the file format.')
      }
    }
    reader.readAsText(file)
    // Reset file input
    event.target.value = ''
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
  }

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
          <GameButton variant="secondary" onClick={handleImportSave} type="button">
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
              <div
                key={slot.id}
                style={{
                  padding: theme.spacing.lg,
                  border:
                    currentSaveId === slot.id
                      ? `2px solid ${theme.colors.primary.main}`
                      : `1px solid ${theme.colors.neutral.gray300}`,
                  backgroundColor:
                    currentSaveId === slot.id
                      ? theme.colors.primary.light + '20'
                      : theme.colors.neutral.white,
                  cursor: 'pointer',
                  borderRadius: theme.borderRadius.lg,
                  boxShadow: theme.shadows.lg,
                  background: theme.gradients.card,
                  backdropFilter: 'blur(20px)',
                  transition: `all ${theme.transitions.normal}`
                }}
                onClick={(e) => {
                  // Only load if not clicking on buttons
                  const target = e.target as HTMLElement
                  if (!target.closest('button')) {
                    handleLoadSave(slot.id)
                  }
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: theme.spacing.sm
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontFamily: theme.typography.fontFamily.heading,
                        fontSize: theme.typography.fontSize.xl,
                        fontWeight: theme.typography.fontWeight.bold,
                        color: theme.colors.text.primary,
                        marginBottom: theme.spacing.xs
                      }}
                    >
                      {slot.name}
                      {currentSaveId === slot.id && (
                        <span
                          style={{
                            marginLeft: theme.spacing.sm,
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.primary.main,
                            fontWeight: theme.typography.fontWeight.medium
                          }}
                        >
                          (Current)
                        </span>
                      )}
                    </h3>
                    <p
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.secondary,
                        marginBottom: theme.spacing.xs
                      }}
                    >
                      Created: {formatDate(slot.createdAt)}
                    </p>
                    <p
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.secondary
                      }}
                    >
                      Last Played: {formatDate(slot.lastPlayed)}
                    </p>
                    {slot.data.manager.fullName && (
                      <p
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text.primary,
                          marginTop: theme.spacing.xs,
                          fontWeight: theme.typography.fontWeight.medium
                        }}
                      >
                        Manager: {slot.data.manager.fullName}
                      </p>
                    )}
                    {slot.data.school.name && (
                      <p
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text.primary,
                          fontWeight: theme.typography.fontWeight.medium
                        }}
                      >
                        School: {slot.data.school.name}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: theme.spacing.sm,
                      flexDirection: 'column'
                    }}
                    onClick={(e) => {
                      // Prevent card click when clicking buttons
                      e.stopPropagation()
                    }}
                  >
                    {currentSaveId !== slot.id && (
                      <GameButton
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLoadSave(slot.id)
                        }}
                        type="button"
                      >
                        Load
                      </GameButton>
                    )}
                    <GameButton
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteSave(slot.id)
                      }}
                      type="button"
                    >
                      Delete
                    </GameButton>
                  </div>
                </div>
              </div>
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
    </div>
  )
}

export default SaveManagerScreen
