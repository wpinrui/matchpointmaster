import { createContext, ReactNode, useContext } from 'react'
import { useSaveData } from './useSaveData'

const SaveDataContext = createContext<ReturnType<typeof useSaveData> | null>(null)

export const SaveDataProvider = ({ children }: { children: ReactNode }) => {
  const saveDataContext = useSaveData()

  return (
    <SaveDataContext.Provider value={saveDataContext}>
      {children}
    </SaveDataContext.Provider>
  )
}

export const useSaveDataContext = () => {
  const context = useContext(SaveDataContext)
  if (!context) {
    throw new Error('useSaveDataContext must be used within a SaveDataProvider')
  }
  return context
}
