import React, { ReactNode, useMemo } from 'react'
import { Screens } from '../../screen_manager/screens'
import { theme } from '../../theme/theme'
import BackgroundImage from '../../assets/tabletennisphoto.jpg'
import { CommonStyles } from '../../styles/common/CommonStyles'
import GameCard from '../cards/GameCard'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { GamePhase } from '../../utils/gamePhases'

interface MainLayoutProps {
  currentScreen: Screens
  changeScreen: (screen: Screens) => void
  children: ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({
  currentScreen,
  changeScreen,
  children
}) => {
  const { season } = useSaveDataContext()

  // Check if we're in a training phase
  const isTrainingPhase =
    season.phase === GamePhase.TRAINING || season.phase === GamePhase.TRAINING_2

  // Build sidebar items conditionally
  const sidebarItems = useMemo(() => {
    const items = [
      { screen: Screens.HOME, label: 'Home', icon: '🏠' },
      { screen: Screens.EMAIL, label: 'Email', icon: '📧' },
      { screen: Screens.TEAM_OVERVIEW, label: 'Team Overview', icon: '👥' }
    ]

    // Add Training item only during training phase
    if (isTrainingPhase) {
      items.push({
        screen: Screens.TRAINING,
        label: 'Training',
        icon: '💪'
      })
    }

    items.push(
      { screen: Screens.PROFILE, label: 'Profile', icon: '👤' },
      { screen: Screens.SETTINGS, label: 'Settings', icon: '⚙️' }
    )

    return items
  }, [isTrainingPhase])

  return (
    <div
      style={{
        ...CommonStyles.containerStyle,
        display: 'flex',
        flexDirection: 'row',
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: theme.colors.background.primary
      }}
    >
      {/* Background Image */}
      <img
        src={BackgroundImage}
        alt="Background"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }}
      />
      <div style={CommonStyles.blurStyle} />

      {/* Left Sidebar Container */}
      <div
        style={{
          width: '240px',
          minWidth: '240px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.sm,
          position: 'relative',
          zIndex: 1,
          padding: theme.spacing.md,
          overflowY: 'auto',
          background: `${theme.colors.background.primary}99`, // Add transparency (60% opacity)
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
          borderRadius: theme.borderRadius.lg
        }}
      >
        {sidebarItems.map((item) => (
          <button
            key={item.screen}
            onClick={() => changeScreen(item.screen)}
            type="button"
            style={{
              padding: theme.spacing.md,
              background:
                currentScreen === item.screen ? theme.gradients.primary : 'transparent',
              border: `${theme.borderWidth.default} solid ${
                currentScreen === item.screen
                  ? theme.colors.primary.main
                  : theme.colors.border.default
              }`,
              borderRadius: theme.borderRadius.lg,
              color:
                currentScreen === item.screen
                  ? theme.colors.neutral.white
                  : theme.colors.text.primary,
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize.base,
              fontWeight:
                currentScreen === item.screen
                  ? theme.typography.fontWeight.bold
                  : theme.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${theme.transitions.normal}`,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm
            }}
            onMouseEnter={(e) => {
              if (currentScreen !== item.screen) {
                e.currentTarget.style.borderColor = theme.colors.border.hover
              }
            }}
            onMouseLeave={(e) => {
              if (currentScreen !== item.screen) {
                e.currentTarget.style.borderColor = theme.colors.border.default
              }
            }}
          >
            <span style={{ fontSize: theme.typography.fontSize.xl }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area Container */}
      <div
        style={{
          flex: 1,
          height: '100%',
          position: 'relative',
          zIndex: 1,
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: `${theme.colors.background.primary}99`, // Add transparency (60% opacity)
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
          borderRadius: theme.borderRadius.lg
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: theme.spacing.lg
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default MainLayout
