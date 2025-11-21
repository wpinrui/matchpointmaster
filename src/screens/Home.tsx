import React from 'react'
import { useEffectOnce } from 'react-use'
import { ScreenProps } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { theme } from '../theme/theme'
import GameCard from '../components/cards/GameCard'
import { CommonStyles } from '../styles/common/CommonStyles'
import BackgroundImage from '../assets/tabletennisphoto.jpg'

const Home: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { saveToFile, manager, school } = useSaveDataContext()
  useEffectOnce(() => {
    console.log('Home screen mounted')
    saveToFile()
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
          Your game has been saved! More features coming soon...
        </p>
      </GameCard>
    </div>
  )
}

export default Home
