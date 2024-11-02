import React from 'react'
import { useEffectOnce } from 'react-use'
import { ScreenProps } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'

const Home: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { saveToFile } = useSaveDataContext()
  useEffectOnce(() => {
    console.log('Home screen mounted')
    saveToFile()
  })

  return (
    <div>
      <h1>Home</h1>
    </div>
  )
}

export default Home
