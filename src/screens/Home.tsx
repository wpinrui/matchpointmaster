import React from 'react'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { theme } from '../theme/theme'
import GameCard from '../components/cards/GameCard'
import GameButton from '../components/buttons/GameButton'
import { CommonStyles } from '../styles/common/CommonStyles'
import BackgroundImage from '../assets/tabletennisphoto.jpg'

const Home: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { manager, school, exportToJson, clearCurrentSave } = useSaveDataContext()

  const handleExport = () => {
    exportToJson()
  }

  const handleClear = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all current save data? This will reset your game to the initial state. This action cannot be undone.'
      )
    ) {
      clearCurrentSave()
    }
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
          textAlign: 'center'
        }}
        glow
      >
        <h1
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize['4xl'],
            fontWeight: theme.typography.fontWeight.extrabold,
            background: theme.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: theme.spacing['2xl']
          }}
        >
          Welcome to Matchpoint Master!
        </h1>
        {manager.fullName && (
          <div style={{ marginBottom: theme.spacing.xl }}>
            <h2
              style={{
                fontFamily: theme.typography.fontFamily.heading,
                fontSize: theme.typography.fontSize['2xl'],
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.md
              }}
            >
              Manager: {manager.fullName}
            </h2>
            {manager.imagePath && (
              <img
                src={manager.imagePath}
                alt="Manager"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: theme.borderRadius.full,
                  border: `3px solid ${theme.colors.primary.main}`,
                  objectFit: 'cover',
                  marginBottom: theme.spacing.lg
                }}
              />
            )}
          </div>
        )}
        {school.name && (
          <div>
            <h2
              style={{
                fontFamily: theme.typography.fontFamily.heading,
                fontSize: theme.typography.fontSize['2xl'],
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.md
              }}
            >
              School: {school.name}
            </h2>
            {school.crestPath && (
              <img
                src={school.crestPath}
                alt="School Crest"
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: theme.borderRadius.lg,
                  border: `3px solid ${theme.colors.secondary.main}`,
                  objectFit: 'contain',
                  background: theme.colors.neutral.white,
                  padding: theme.spacing.sm,
                  marginBottom: theme.spacing.lg
                }}
              />
            )}
          </div>
        )}
        <p
          style={{
            fontSize: theme.typography.fontSize.lg,
            color: theme.colors.text.secondary,
            marginTop: theme.spacing.xl
          }}
        >
          Your game is automatically saved! More features coming soon...
        </p>

        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            marginTop: theme.spacing.xl,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <GameButton
            variant="secondary"
            onClick={() => changeScreen(Screens.SAVE_MANAGER)}
            type="button"
          >
            Manage Saves
          </GameButton>
          <GameButton
            variant="secondary"
            onClick={handleExport}
            type="button"
          >
            Export Save
          </GameButton>
          <GameButton
            variant="secondary"
            onClick={handleClear}
            type="button"
          >
            Clear Data
          </GameButton>
        </div>
      </GameCard>
    </div>
  )
}

export default Home
