import React, { useMemo, useState } from 'react'
import GameButton from '../../components/buttons/GameButton'
import GameCard from '../../components/cards/GameCard'
import { PlayerCard } from '../../components/players/PlayerCard'
import { ScreenProps } from '../../screen_manager/screens'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { Gender } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import { calculateMaxTeamSize } from '../../utils/schoolReputation'
import { calculateOverallRating } from '../../utils/cardTiers'

type TeamType = 'C boys' | 'C girls' | 'B boys' | 'B girls'

const TeamOverviewScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { players, teamRoster, updateTeamRoster, school, aiSchools } =
    useSaveDataContext()

  // State for selected school and team
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('user') // 'user' or AI school ID
  const [selectedTeam, setSelectedTeam] = useState<TeamType>('C boys')

  // Calculate school rankings (mean of reputation and funding, lower is better)
  const schoolRankings = useMemo(() => {
    if (!aiSchools) return new Map<string, number>()

    // Collect all schools with their mean ranking
    const schoolsWithRanking: Array<{
      id: string
      meanRanking: number
    }> = []

    // Add user school
    schoolsWithRanking.push({
      id: 'user',
      meanRanking: (school.reputation + school.funding) / 2
    })

    // Add AI schools
    aiSchools.forEach((aiSchool) => {
      schoolsWithRanking.push({
        id: aiSchool.id.toString(),
        meanRanking: (aiSchool.reputation + aiSchool.funding) / 2
      })
    })

    // Sort by mean ranking (ascending - lower is better)
    schoolsWithRanking.sort((a, b) => a.meanRanking - b.meanRanking)

    // Create map of school ID to rank (1-indexed)
    const rankings = new Map<string, number>()
    schoolsWithRanking.forEach((school, index) => {
      rankings.set(school.id, index + 1)
    })

    return rankings
  }, [school, aiSchools])

  // Get all available schools (user's school + AI schools), sorted alphabetically
  const allSchools = useMemo(() => {
    const userSchool = {
      id: 'user',
      name: school.name || 'Your School',
      teamType: school.teamType,
      isUser: true
    }

    const aiSchoolList = aiSchools
      ? aiSchools.map((aiSchool) => ({
          id: aiSchool.id.toString(),
          name: aiSchool.name,
          teamType: aiSchool.teamType,
          isUser: false
        }))
      : []

    // Sort AI schools alphabetically by name
    aiSchoolList.sort((a, b) => a.name.localeCompare(b.name))

    // User school always first, then sorted AI schools
    return [userSchool, ...aiSchoolList]
  }, [school, aiSchools])

  // Get selected school data
  const selectedSchool = useMemo(() => {
    if (selectedSchoolId === 'user') {
      return {
        id: 'user',
        name: school.name || 'Your School',
        teamType: school.teamType,
        players: players,
        teamRoster: teamRoster,
        funding: school.funding,
        crestPath: school.crestPath,
        isUser: true
      }
    } else {
      const aiSchool = aiSchools?.find((s) => s.id.toString() === selectedSchoolId)
      if (!aiSchool) return null
      return {
        id: aiSchool.id.toString(),
        name: aiSchool.name,
        teamType: aiSchool.teamType,
        players: aiSchool.players,
        teamRoster: aiSchool.teamRoster,
        funding: aiSchool.funding,
        crestPath: aiSchool.crestPath,
        isUser: false
      }
    }
  }, [selectedSchoolId, school, players, teamRoster, aiSchools])

  // Get available teams based on selected school
  const availableTeams = useMemo(() => {
    if (!selectedSchool) return []
    const teams: TeamType[] = []
    if (selectedSchool.teamType === 'boys' || selectedSchool.teamType === 'both') {
      teams.push('C boys', 'B boys')
    }
    if (selectedSchool.teamType === 'girls' || selectedSchool.teamType === 'both') {
      teams.push('C girls', 'B girls')
    }
    return teams
  }, [selectedSchool])

  // Update selected team if current selection is invalid
  React.useEffect(() => {
    if (selectedSchool && !availableTeams.includes(selectedTeam)) {
      setSelectedTeam(availableTeams[0] || 'C boys')
    }
  }, [selectedSchool, availableTeams, selectedTeam])

  // Filter players based on selected school and team
  const filteredPlayers = useMemo(() => {
    if (!selectedSchool) return []

    // Get players from selected school
    const schoolPlayers = selectedSchool.players.filter((p) =>
      selectedSchool.teamRoster.includes(p.id)
    )

    // Parse team selection
    const isLowerSecondary = selectedTeam.startsWith('C')
    const isUpperSecondary = selectedTeam.startsWith('B')
    const isBoys = selectedTeam.includes('boys')
    const isGirls = selectedTeam.includes('girls')

    // Filter by year level
    let yearFiltered = schoolPlayers
    if (isLowerSecondary) {
      yearFiltered = schoolPlayers.filter((p) => p.year === 1 || p.year === 2)
    } else if (isUpperSecondary) {
      yearFiltered = schoolPlayers.filter((p) => p.year === 3 || p.year === 4)
    }

    // Filter by gender
    let genderFiltered = yearFiltered
    if (isBoys) {
      genderFiltered = yearFiltered.filter((p) => p.gender === Gender.MALE)
    } else if (isGirls) {
      genderFiltered = yearFiltered.filter((p) => p.gender === Gender.FEMALE)
    }

    // Sort by overall rating (highest first)
    return genderFiltered.sort(
      (a, b) => calculateOverallRating(b.skills) - calculateOverallRating(a.skills)
    )
  }, [selectedSchool, selectedTeam])

  // Calculate team statistics
  const teamStats = useMemo(() => {
    if (filteredPlayers.length === 0) {
      return {
        totalPlayers: 0,
        byYear: { 1: 0, 2: 0, 3: 0, 4: 0 },
        lowerSecondary: 0,
        upperSecondary: 0
      }
    }

    // Calculate average rating (average of all skills)
    const totalRating = filteredPlayers.reduce((sum, p) => {
      const playerRating =
        (p.skills.forehand +
          p.skills.backhand +
          p.skills.footwork +
          p.skills.serve +
          p.skills.receive +
          p.skills.spin +
          p.skills.placement +
          p.skills.consistency) /
        8
      return sum + playerRating
    }, 0)
    const averageRating = Math.round(totalRating / filteredPlayers.length)

    const byYear = filteredPlayers.reduce(
      (acc, p) => {
        acc[p.year] = (acc[p.year] || 0) + 1
        return acc
      },
      { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<number, number>
    )

    // Calculate Lower Secondary (Year 1-2) and Upper Secondary (Year 3-4)
    const lowerSecondary = (byYear[1] || 0) + (byYear[2] || 0)
    const upperSecondary = (byYear[3] || 0) + (byYear[4] || 0)

    return {
      averageRating,
      totalPlayers: filteredPlayers.length,
      byYear,
      lowerSecondary,
      upperSecondary
    }
  }, [filteredPlayers])

  // Calculate max team size based on funding
  const maxTeamSize = useMemo(() => {
    if (!selectedSchool) return 0
    return calculateMaxTeamSize(selectedSchool.funding, selectedSchool.teamType)
  }, [selectedSchool])

  const handleRemoveFromTeam = (playerId: string) => {
    // Only allow removing from user's team
    if (selectedSchoolId === 'user') {
      updateTeamRoster.remove(playerId)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.lg,
        height: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.xl,
          flexWrap: 'wrap',
          gap: theme.spacing.md
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.extrabold,
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              marginBottom: theme.spacing.xs
            }}
          >
            Team Overview
          </h1>
          {selectedSchool && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.md,
                flexWrap: 'wrap'
              }}
            >
              {selectedSchool.crestPath && (
                <img
                  src={selectedSchool.crestPath}
                  alt="School Crest"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: theme.borderRadius.lg,
                    border: `${theme.borderWidth.default} solid ${theme.colors.secondary.light}`,
                    objectFit: 'contain',
                    background: 'transparent',
                    padding: theme.spacing.xs,
                    flexShrink: 0
                  }}
                />
              )}
              <div>
                <p
                  style={{
                    fontSize: theme.typography.fontSize.xl,
                    color: theme.colors.text.secondary,
                    margin: 0,
                    fontWeight: theme.typography.fontWeight.bold
                  }}
                >
                  {selectedSchool.name}
                </p>
                {schoolRankings.has(selectedSchool.id) && (
                  <p
                    style={{
                      fontSize: theme.typography.fontSize.lg,
                      color: theme.colors.text.light,
                      margin: 0,
                      marginTop: theme.spacing.xs,
                      fontWeight: theme.typography.fontWeight.medium
                    }}
                  >
                    #{schoolRankings.get(selectedSchool.id)} ranked school
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* School and Team Selection */}
      <GameCard
        style={{
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.lg
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label
              style={{
                display: 'block',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.xs
              }}
            >
              School
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              style={{
                width: '100%',
                padding: theme.spacing.sm,
                fontSize: theme.typography.fontSize.base,
                fontFamily: theme.typography.fontFamily.primary,
                border: `1px solid ${theme.colors.neutral.gray300}`,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.colors.background.primary,
                color: theme.colors.text.primary,
                cursor: 'pointer'
              }}
            >
              {allSchools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label
              style={{
                display: 'block',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.xs
              }}
            >
              Team
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value as TeamType)}
              style={{
                width: '100%',
                padding: theme.spacing.sm,
                fontSize: theme.typography.fontSize.base,
                fontFamily: theme.typography.fontFamily.primary,
                border: `1px solid ${theme.colors.neutral.gray300}`,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.colors.background.primary,
                color: theme.colors.text.primary,
                cursor: 'pointer'
              }}
            >
              {availableTeams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GameCard>

      {/* Team Statistics */}
      {selectedSchool && (
        <GameCard
          style={{
            padding: theme.spacing.md,
            marginBottom: theme.spacing.lg
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: theme.spacing.lg,
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary
                }}
              >
                Team Size:
              </span>
              <span
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.primary.main
                }}
              >
                {teamStats.totalPlayers} / {maxTeamSize}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary
                }}
              >
                Avg Rating:
              </span>
              <span
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.accent.light
                }}
              >
                {teamStats.averageRating || 'N/A'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary
                }}
              >
                Lower Sec:
              </span>
              <span
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.secondary.light
                }}
              >
                {teamStats.lowerSecondary}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary
                }}
              >
                Upper Sec:
              </span>
              <span
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.secondary.light
                }}
              >
                {teamStats.upperSecondary}
              </span>
            </div>
          </div>
        </GameCard>
      )}

      {/* Team Roster */}
      {!selectedSchool ? (
        <div
          style={{
            textAlign: 'center',
            padding: theme.spacing.xl,
            color: theme.colors.text.secondary
          }}
        >
          <p style={{ fontSize: theme.typography.fontSize.lg }}>No school selected.</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: theme.spacing.xl,
            color: theme.colors.text.secondary
          }}
        >
          <p style={{ fontSize: theme.typography.fontSize.lg }}>
            No players found for {selectedTeam} team.
          </p>
        </div>
      ) : (
        <div>
          <h2
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.lg
            }}
          >
            {selectedTeam} Roster ({filteredPlayers.length})
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: theme.spacing.md
            }}
          >
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                actionButton={
                  selectedSchoolId === 'user' ? (
                    <GameButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveFromTeam(player.id)}
                      type="button"
                      style={{
                        width: '100%'
                      }}
                    >
                      Remove
                    </GameButton>
                  ) : null
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamOverviewScreen
