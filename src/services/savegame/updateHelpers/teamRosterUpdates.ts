import React from 'react'
import { SaveData } from '../types'

export function createTeamRosterUpdates(
  setSaveData: React.Dispatch<React.SetStateAction<SaveData>>
) {
  return {
    add: (playerId: string) => {
      setSaveData((prevData) => {
        // Don't add if already on team
        if (prevData.teamRoster.includes(playerId)) {
          return prevData
        }
        return {
          ...prevData,
          teamRoster: [...prevData.teamRoster, playerId]
        }
      })
    },
    remove: (playerId: string) => {
      setSaveData((prevData) => ({
        ...prevData,
        teamRoster: prevData.teamRoster.filter((id) => id !== playerId)
      }))
    },
    set: (playerIds: string[]) => {
      setSaveData((prevData) => ({
        ...prevData,
        teamRoster: playerIds
      }))
    },
    clear: () => {
      setSaveData((prevData) => ({
        ...prevData,
        teamRoster: []
      }))
    }
  }
}
