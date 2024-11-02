import React from 'react'
import './App.scss'
import ScreenManager from './screen_manager/ScreenManager'
import { SaveDataProvider } from './services/savegame/SaveDataContext'

const App: React.FC = () => {
  return (
    <div>
      <SaveDataProvider>
        <ScreenManager />
      </SaveDataProvider>
    </div>
  )
}

export default App
