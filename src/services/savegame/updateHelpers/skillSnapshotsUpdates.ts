import React from 'react'
import { SaveData } from '../types'

export function createSkillSnapshotsUpdates(
  setSaveData: React.Dispatch<React.SetStateAction<SaveData>>
) {
  return {
    add: (snapshot: SaveData['skillSnapshots'][0]) => {
      setSaveData((prevData) => ({
        ...prevData,
        skillSnapshots: [...prevData.skillSnapshots, snapshot]
      }))
    },
    addMany: (snapshots: SaveData['skillSnapshots']) => {
      setSaveData((prevData) => ({
        ...prevData,
        skillSnapshots: [...prevData.skillSnapshots, ...snapshots]
      }))
    },
    clear: () => {
      setSaveData((prevData) => ({
        ...prevData,
        skillSnapshots: []
      }))
    }
  }
}
