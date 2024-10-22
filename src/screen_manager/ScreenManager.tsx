import React, { useState } from 'react'
import LoadScreen from '../screens/LoadScreen'
import { Screens } from './screens'

const ScreenManager: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screens>(Screens.LOAD)

  const changeScreen = (screen: Screens) => {
    setCurrentScreen(screen)
  }

  const screenComponents: {
    [key in Screens]: React.FC<{ changeScreen: (screen: Screens) => void }>
  } = {
    [Screens.LOAD]: LoadScreen
  }

  const ScreenComponent = screenComponents[currentScreen]

  return <ScreenComponent changeScreen={changeScreen} />
}

export default ScreenManager
