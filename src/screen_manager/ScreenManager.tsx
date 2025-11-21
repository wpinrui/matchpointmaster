import React, { useState } from 'react'
import Home from '../screens/Home'
import LoadScreen from '../screens/LoadScreen'
import NewGameScreen from '../screens/new_game/NewGameScreen'
import SaveManagerScreen from '../screens/SaveManagerScreen'
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
    [Screens.SAVE_MANAGER]: SaveManagerScreen
  }

  const ScreenComponent = screenComponents[currentScreen]

  return <ScreenComponent changeScreen={changeScreen} />
}

export default ScreenManager
