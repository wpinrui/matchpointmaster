import React from 'react'
import { SaveData } from '../types'

export function createPlayerUpdates(
  setSaveData: React.Dispatch<React.SetStateAction<SaveData>>
) {
  return {
    add: (player: SaveData['players'][0]) => {
      setSaveData((prevData) => ({
        ...prevData,
        players: [...prevData.players, player]
      }))
    },
    remove: (playerId: string) => {
      setSaveData((prevData) => ({
        ...prevData,
        players: prevData.players.filter((p) => p.id !== playerId),
        teamRoster: prevData.teamRoster.filter((id) => id !== playerId)
      }))
    },
    set: (players: SaveData['players']) => {
      setSaveData((prevData) => ({
        ...prevData,
        players
      }))
    },
    update: (playerId: string, updates: Partial<SaveData['players'][0]>) => {
      setSaveData((prevData) => ({
        ...prevData,
        players: prevData.players.map((p) =>
          p.id === playerId ? { ...p, ...updates } : p
        )
      }))
    }
  }
}
