import SaveIcon from '@mui/icons-material/Save'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import React from 'react'
import BackgroundImage from '../assets/tabletennisphoto.jpg'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { CommonStyles } from '../styles/common/CommonStyles'
import { theme } from '../theme/theme'
import GameButton from '../components/buttons/GameButton'
import GameCard from '../components/cards/GameCard'

const LoadScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const handleNewGame = () => {
    changeScreen(Screens.NEW_GAME)
  }

  const handleLoadGame = () => {
    changeScreen(Screens.SAVE_MANAGER)
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
          textAlign: 'center',
          maxWidth: '600px'
        }}
        glow
      >
        <div style={{ marginBottom: theme.spacing.xl }}>
          <h1
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize['5xl'],
              fontWeight: theme.typography.fontWeight.extrabold,
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: theme.spacing.md,
              textShadow: 'none'
            }}
          >
            🏓 Matchpoint Master
          </h1>
          <p
            style={{
              fontSize: theme.typography.fontSize.lg,
              color: theme.colors.text.secondary,
              lineHeight: theme.typography.lineHeight.relaxed,
              marginBottom: theme.spacing['2xl']
            }}
          >
            Lead your school squad to national glory as you train talented players,
            outsmart rival teams, and strategize your way to the top of the national
            championships.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.lg,
            width: '100%'
          }}
        >
          <GameButton
            variant="secondary"
            size="lg"
            onClick={handleLoadGame}
            icon={<SaveIcon />}
            fullWidth
            glow
          >
            Load Game
          </GameButton>
          <GameButton
            variant="primary"
            size="lg"
            onClick={handleNewGame}
            icon={<SportsEsportsIcon />}
            fullWidth
            glow
          >
            Start New Game
          </GameButton>
        </div>
      </GameCard>
    </div>
  )
}

export default LoadScreen
