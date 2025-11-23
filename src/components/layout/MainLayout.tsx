import React, { ReactNode, useMemo } from 'react'
import { Screens } from '../../screen_manager/screens'
import { theme } from '../../theme/theme'
import BackgroundImage from '../../assets/tabletennisphoto.jpg'
import { CommonStyles } from '../../styles/common/CommonStyles'
import GameCard from '../cards/GameCard'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { GamePhase } from '../../utils/gamePhases'
import { StyledFlex, StyledSidebarButton } from '../../styles'

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
  const { season, emails } = useSaveDataContext()

  // Check if we're in a training phase
  const isTrainingPhase =
    season.phase === GamePhase.TRAINING || season.phase === GamePhase.TRAINING_2

  // Get unread email count
  const unreadCount = useMemo(() => {
    return emails.filter((e) => !e.read).length
  }, [emails])

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
      <StyledFlex
        direction="column"
        gap="sm"
        style={{
          width: '240px',
          minWidth: '240px',
          height: '100%',
          position: 'relative',
          zIndex: 1,
          padding: theme.spacing.md,
          overflowY: 'auto',
          background: `${theme.colors.background.primary}99`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
          borderRadius: theme.borderRadius.lg
        }}
      >
        {sidebarItems.map((item) => (
          <StyledSidebarButton
            key={item.screen}
            onClick={() => changeScreen(item.screen)}
            type="button"
            active={currentScreen === item.screen}
            style={{ position: 'relative' }}
          >
            <span style={{ fontSize: theme.typography.fontSize.xl }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.screen === Screens.EMAIL && unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: theme.colors.primary.main,
                  color: theme.colors.primary.contrast,
                  borderRadius: '10px',
                  minWidth: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: theme.typography.fontWeight.bold,
                  padding: `0 ${theme.spacing.xs}`,
                  lineHeight: 1
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </StyledSidebarButton>
        ))}
      </StyledFlex>

      {/* Main Content Area Container */}
      <StyledFlex
        direction="column"
        style={{
          flex: 1,
          height: '100%',
          position: 'relative',
          zIndex: 1,
          minWidth: 0,
          overflow: 'hidden',
          background: `${theme.colors.background.primary}99`,
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
      </StyledFlex>
    </div>
  )
}

export default MainLayout
