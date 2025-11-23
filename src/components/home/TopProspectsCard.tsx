import React, { useMemo } from 'react'
import GameCard from '../cards/GameCard'
import { PlayerCard } from '../players/PlayerCard'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { theme } from '../../theme/theme'
import { Gender } from '../../services/savegame/types'
import { calculateOverallRating } from '../../utils/cardTiers'
import { StyledHeading, StyledText, StyledFlex } from '../../styles'

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
      <StyledHeading
        size="h5"
        margin={`0 0 ${theme.spacing.md} 0`}
        style={{ flexShrink: 0 }}
      >
        Top Prospects
      </StyledHeading>

      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {topProspects.length > 0 ? (
          <StyledFlex direction="column" gap="md">
            {topProspects.map((player) => (
              <div key={player.id}>
                <PlayerCard player={player} />
              </div>
            ))}
          </StyledFlex>
        ) : (
          <StyledFlex
            align="center"
            justify="center"
            style={{ textAlign: 'center', padding: theme.spacing.xl }}
          >
            <StyledText size="base" color="secondary" style={{ margin: 0 }}>
              {players.length === 0
                ? 'No players available yet. Visit the draft screen to see available prospects.'
                : 'All available players have been drafted or no players match your team type.'}
            </StyledText>
          </StyledFlex>
        )}
      </div>
    </GameCard>
  )
}
