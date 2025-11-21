import React, { useState } from 'react'
import Home from '../screens/Home'
import LoadScreen from '../screens/LoadScreen'
import NewGameScreen from '../screens/new_game/NewGameScreen'
import PlayersScreen from '../screens/PlayersScreen'
import SaveManagerScreen from '../screens/SaveManagerScreen'
import DraftScreen from '../screens/team/DraftScreen'
import TeamOverviewScreen from '../screens/team/TeamOverviewScreen'
import ProfileScreen from '../screens/ProfileScreen'
import SettingsScreen from '../screens/SettingsScreen'
import MainLayout from '../components/layout/MainLayout'
import { Screens } from './screens'

const ScreenManager: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screens>(Screens.LOAD)

  const changeScreen = (screen: Screens) => {
    setCurrentScreen(screen)
  }

  const screenComponents: {
    [key in Screens]: React.FC<{ changeScreen: (screen: Screens) => void }>
  } = {
    [Screens.LOAD]: LoadScreen,
    [Screens.NEW_GAME]: NewGameScreen,
    [Screens.HOME]: Home,
    [Screens.PLAYERS]: PlayersScreen,
    [Screens.SAVE_MANAGER]: SaveManagerScreen,
    [Screens.DRAFT]: DraftScreen,
    [Screens.TEAM_OVERVIEW]: TeamOverviewScreen,
    [Screens.PROFILE]: ProfileScreen,
    [Screens.SETTINGS]: SettingsScreen
  }

  const ScreenComponent = screenComponents[currentScreen]

  // Screens that use the main layout with sidebar
  const layoutScreens = [
    Screens.TEAM_OVERVIEW,
    Screens.PROFILE,
    Screens.SETTINGS,
    Screens.DRAFT
  ]

  if (layoutScreens.includes(currentScreen)) {
    return (
      <MainLayout currentScreen={currentScreen} changeScreen={changeScreen}>
        <ScreenComponent changeScreen={changeScreen} />
      </MainLayout>
    )
  }

  return <ScreenComponent changeScreen={changeScreen} />
}

export default ScreenManager
