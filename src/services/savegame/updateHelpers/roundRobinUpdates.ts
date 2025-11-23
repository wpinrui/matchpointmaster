import React from 'react'
import { SaveData, RoundRobinData } from '../types'

export function createRoundRobinUpdates(
  setSaveData: React.Dispatch<React.SetStateAction<SaveData>>
) {
  return {
    set: (data: RoundRobinData | null) => {
      setSaveData((prevData) => ({
        ...prevData,
        roundRobinData: data
      }))
    }
  }
}
