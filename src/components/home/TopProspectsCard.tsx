import React, { useMemo } from 'react'
import GameCard from '../cards/GameCard'
import { PlayerCard } from '../players/PlayerCard'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { theme } from '../../theme/theme'
import { Gender } from '../../services/savegame/types'
import { calculateOverallRating } from '../../utils/cardTiers'

export const TopProspectsCard: React.FC = () => {
  const { players, teamRoster, school } = useSaveDataContext()

  // Get available players (not on team) and filter by team type
  const topProspects = useMemo(() => {
    const available = players.filter((p) => !teamRoster.includes(p.id))

    // Filter by team type
    let filtered = available
    if (school.teamType === 'boys') {
      filtered = available.filter((p) => p.gender === Gender.MALE)
    } else if (school.teamType === 'girls') {
      filtered = available.filter((p) => p.gender === Gender.FEMALE)
    }

    // Sort by overall rating (highest first) and take top 3
    return filtered
      .sort((a, b) => calculateOverallRating(b.skills) - calculateOverallRating(a.skills))
      .slice(0, 3)
  }, [players, teamRoster, school.teamType])

  return (
    <GameCard
      style={{
        padding: theme.spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden'
      }}
    >
      <h2
        style={{
          fontFamily: theme.typography.fontFamily.heading,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.md,
          marginTop: 0,
          flexShrink: 0
        }}
      >
        Top Prospects
      </h2>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0
        }}
      >
        {topProspects.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.md
            }}
          >
            {topProspects.map((player) => (
              <div key={player.id}>
                <PlayerCard player={player} />
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: theme.spacing.xl,
              color: theme.colors.text.secondary
            }}
          >
            <p style={{ margin: 0, fontSize: theme.typography.fontSize.base }}>
              {players.length === 0
                ? 'No players available yet. Visit the draft screen to see available prospects.'
                : 'All available players have been drafted or no players match your team type.'}
            </p>
          </div>
        )}
      </div>
    </GameCard>
  )
}
