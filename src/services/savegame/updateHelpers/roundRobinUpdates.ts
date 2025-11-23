import React from 'react'
import { SaveData, RoundRobinData } from '../types'

export function createRoundRobinUpdates(
  setSaveData: React.Dispatch<React.SetStateAction<SaveData>>
) {
  return {
    set: (
      data:
        | RoundRobinData
        | null
        | ((prev: RoundRobinData | null) => RoundRobinData | null)
    ) => {
      setSaveData((prevData) => {
        const newData = typeof data === 'function' ? data(prevData.roundRobinData) : data
        return {
          ...prevData,
          roundRobinData: newData
        }
      })
    }
  }
}
