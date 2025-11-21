import React, { ReactNode } from 'react'
import { Screens } from '../../screen_manager/screens'
import { theme } from '../../theme/theme'
import BackgroundImage from '../../assets/tabletennisphoto.jpg'
import { CommonStyles } from '../../styles/common/CommonStyles'
import GameCard from '../cards/GameCard'

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
  const sidebarItems = [
    { screen: Screens.HOME, label: 'Home', icon: '🏠' },
    { screen: Screens.EMAIL, label: 'Email', icon: '📧' },
    { screen: Screens.TEAM_OVERVIEW, label: 'Team Overview', icon: '👥' },
    { screen: Screens.PROFILE, label: 'Profile', icon: '👤' },
    { screen: Screens.SETTINGS, label: 'Settings', icon: '⚙️' }
  ]

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
        overflow: 'hidden'
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

      {/* Left Sidebar Card */}
      <GameCard
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
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.92)',
          overflowY: 'auto'
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
                currentScreen === item.screen
                  ? theme.gradients.primary
                  : 'rgba(255, 255, 255, 0.5)',
              border: `2px solid ${
                currentScreen === item.screen
                  ? theme.colors.primary.main
                  : 'rgba(0, 0, 0, 0.1)'
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
              gap: theme.spacing.sm,
              boxShadow:
                currentScreen === item.screen ? theme.shadows.glow : theme.shadows.sm
            }}
            onMouseEnter={(e) => {
              if (currentScreen !== item.screen) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)'
              }
            }}
            onMouseLeave={(e) => {
              if (currentScreen !== item.screen) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'
              }
            }}
          >
            <span style={{ fontSize: theme.typography.fontSize.xl }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </GameCard>

      {/* Main Content Area Card */}
      <GameCard
        style={{
          flex: 1,
          height: '100%',
          position: 'relative',
          zIndex: 1,
          minWidth: 0,
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.92)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
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
      </GameCard>
    </div>
  )
}

export default MainLayout
