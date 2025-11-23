import React, { useState, useMemo, useEffect } from 'react'
import GameButton from '../components/buttons/GameButton'
import GameCard from '../components/cards/GameCard'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import {
  Gender,
  RoundRobinTeamType,
  RoundRobinData,
  Player
} from '../services/savegame/types'
import { theme } from '../theme/theme'
import {
  filterPlayersByRoundRobinTeamType,
  getAvailableTeamTypes
} from '../utils/roundRobinHelpers'
import { runRoundRobinTournament, getMaxGamesToWatch } from '../utils/roundRobinEngine'
import { PlayerCard } from '../components/players/PlayerCard'
import { ResultsMatrix } from '../components/roundRobin/ResultsMatrix'

type RoundRobinView = 'selection' | 'results' | 'ranking'

const RoundRobinScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { players, teamRoster, school, season, roundRobinData, updateRoundRobinData } =
    useSaveDataContext()

  // Get available teams based on school type
  const availableTeams = useMemo(
    () => getAvailableTeamTypes(school.teamType),
    [school.teamType]
  )

  // State
  const [currentTeam, setCurrentTeam] = useState<RoundRobinTeamType>(
    availableTeams[0] || 'C boys'
  )
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<
    Record<RoundRobinTeamType, string[]>
  >({
    'C boys': [],
    'C girls': [],
    'B boys': [],
    'B girls': []
  })
  const [currentView, setCurrentView] = useState<RoundRobinView>('selection')
  const [completedTeams, setCompletedTeams] = useState<Set<RoundRobinTeamType>>(new Set())

  // Initialize round-robin data if needed
  useEffect(() => {
    if (!roundRobinData && season.month === 5) {
      const initialData: RoundRobinData = {
        year: season.year,
        month: 5,
        teamResults: {
          'C boys': null,
          'C girls': null,
          'B boys': null,
          'B girls': null
        }
      }
      updateRoundRobinData.set(initialData)
    }
  }, [roundRobinData, season, updateRoundRobinData])

  // Load existing tournament data if available
  useEffect(() => {
    if (roundRobinData) {
      const teams: Set<RoundRobinTeamType> = new Set()
      const selections: Record<RoundRobinTeamType, string[]> = {
        'C boys': [],
        'C girls': [],
        'B boys': [],
        'B girls': []
      }

      Object.entries(roundRobinData.teamResults).forEach(([teamType, results]) => {
        if (results) {
          teams.add(teamType as RoundRobinTeamType)
          selections[teamType as RoundRobinTeamType] = results.selectedPlayerIds
          if (results.completed) {
            setCompletedTeams(
              (prev) => new Set([...prev, teamType as RoundRobinTeamType])
            )
          }
        }
      })

      setSelectedPlayerIds(selections)

      // Set view based on current team's status
      const currentTeamResult = roundRobinData.teamResults[currentTeam]
      if (currentTeamResult) {
        if (currentTeamResult.completed && currentTeamResult.coachRankings) {
          setCurrentView('ranking')
        } else if (currentTeamResult.completed) {
          setCurrentView('ranking')
        } else {
          setCurrentView('results')
        }
      }
    }
  }, [roundRobinData, currentTeam])

  // Get players on the team roster, filtered by current team type
  const eligiblePlayers = useMemo(() => {
    const teamPlayers = players.filter((p) => teamRoster.includes(p.id))
    return filterPlayersByRoundRobinTeamType(teamPlayers, currentTeam)
  }, [players, teamRoster, currentTeam])

  // Get selected players for current team
  const currentSelectedIds = useMemo(
    () => selectedPlayerIds[currentTeam] || [],
    [selectedPlayerIds, currentTeam]
  )

  // Handle player selection
  const handleTogglePlayer = (playerId: string) => {
    const current = selectedPlayerIds[currentTeam] || []
    if (current.includes(playerId)) {
      setSelectedPlayerIds({
        ...selectedPlayerIds,
        [currentTeam]: current.filter((id) => id !== playerId)
      })
    } else {
      if (current.length < 12) {
        setSelectedPlayerIds({
          ...selectedPlayerIds,
          [currentTeam]: [...current, playerId]
        })
      }
    }
  }

  // Handle start tournament for current team
  const handleStartTournament = () => {
    if (currentSelectedIds.length < 2) {
      alert('Please select at least 2 players for the tournament')
      return
    }

    // Run tournament
    const results = runRoundRobinTournament(players, currentSelectedIds)
    results.teamType = currentTeam

    // Update round-robin data
    const updatedData: RoundRobinData = {
      ...(roundRobinData || {
        year: season.year,
        month: 5,
        teamResults: {
          'C boys': null,
          'C girls': null,
          'B boys': null,
          'B girls': null
        }
      }),
      teamResults: {
        ...(roundRobinData?.teamResults || {
          'C boys': null,
          'C girls': null,
          'B boys': null,
          'B girls': null
        }),
        [currentTeam]: results
      }
    }

    updateRoundRobinData.set(updatedData)
    setCompletedTeams(new Set([...completedTeams, currentTeam]))
    setCurrentView('results')
  }

  // Get current team results
  const currentTeamResults = useMemo(() => {
    if (!roundRobinData) return null
    return roundRobinData.teamResults[currentTeam]
  }, [roundRobinData, currentTeam])

  // Check if all teams are completed
  const allTeamsCompleted = useMemo(() => {
    return availableTeams.every((team) => {
      if (completedTeams.has(team)) return true
      return roundRobinData?.teamResults[team]?.completed === true
    })
  }, [availableTeams, completedTeams, roundRobinData])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: theme.spacing.md
        }}
      >
        <h1
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize['3xl'],
            fontWeight: theme.typography.fontWeight.extrabold,
            background: theme.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0
          }}
        >
          Intra-Team Round-Robin Tournament
        </h1>
        <GameButton variant="secondary" onClick={() => changeScreen(Screens.HOME)}>
          Back to Home
        </GameButton>
      </div>

      {/* Team Selector */}
      <GameCard
        style={{
          padding: theme.spacing.md
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.sm,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <span
            style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.secondary,
              fontWeight: theme.typography.fontWeight.medium
            }}
          >
            Select Team:
          </span>
          {availableTeams.map((team) => {
            const isSelected = team === currentTeam
            const isCompleted =
              completedTeams.has(team) ||
              roundRobinData?.teamResults[team]?.completed === true
            return (
              <GameButton
                key={team}
                variant={isSelected ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setCurrentTeam(team)
                  setCurrentView('selection')
                }}
                style={{
                  position: 'relative'
                }}
              >
                {team}
                {isCompleted && (
                  <span
                    style={{
                      marginLeft: theme.spacing.xs,
                      fontSize: theme.typography.fontSize.xs
                    }}
                  >
                    ✓
                  </span>
                )}
              </GameButton>
            )
          })}
        </div>
      </GameCard>

      {/* Main Content */}
      {currentView === 'selection' && (
        <SelectionView
          eligiblePlayers={eligiblePlayers}
          selectedPlayerIds={currentSelectedIds}
          onTogglePlayer={handleTogglePlayer}
          onStartTournament={handleStartTournament}
          teamType={currentTeam}
        />
      )}

      {currentView === 'results' && currentTeamResults && (
        <ResultsView
          teamResults={currentTeamResults}
          players={players}
          onViewRanking={() => setCurrentView('ranking')}
          changeScreen={changeScreen}
          onWatchMatch={(player1Id, player2Id) => {
            // Store match info for MatchScreen
            sessionStorage.setItem(
              'roundRobinMatch',
              JSON.stringify({ player1Id, player2Id })
            )
            changeScreen(Screens.MATCH)
          }}
          onUpdateGamesWatched={(count) => {
            if (!roundRobinData) return
            const updatedData: RoundRobinData = {
              ...roundRobinData,
              teamResults: {
                ...roundRobinData.teamResults,
                [currentTeam]: {
                  ...currentTeamResults,
                  gamesWatched: count
                }
              }
            }
            updateRoundRobinData.set(updatedData)
          }}
        />
      )}

      {currentView === 'ranking' && currentTeamResults && (
        <RankingView
          teamResults={currentTeamResults}
          players={players}
          onUpdateRankings={(rankings) => {
            if (!roundRobinData) return
            const updatedData: RoundRobinData = {
              ...roundRobinData,
              teamResults: {
                ...roundRobinData.teamResults,
                [currentTeam]: {
                  ...currentTeamResults,
                  coachRankings: rankings,
                  completed: true
                }
              }
            }
            updateRoundRobinData.set(updatedData)
            setCompletedTeams(new Set([...completedTeams, currentTeam]))
          }}
        />
      )}

      {/* Continue Button (when all teams completed) */}
      {allTeamsCompleted && (
        <GameCard
          style={{
            padding: theme.spacing.lg,
            textAlign: 'center'
          }}
        >
          <p
            style={{
              fontSize: theme.typography.fontSize.lg,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.md
            }}
          >
            All teams have completed their round-robin tournaments.
          </p>
          <GameButton
            variant="success"
            size="lg"
            onClick={() => changeScreen(Screens.HOME)}
          >
            Continue to Next Phase
          </GameButton>
        </GameCard>
      )}
    </div>
  )
}

// Selection View Component
interface SelectionViewProps {
  eligiblePlayers: any[]
  selectedPlayerIds: string[]
  onTogglePlayer: (playerId: string) => void
  onStartTournament: () => void
  teamType: RoundRobinTeamType
}

const SelectionView: React.FC<SelectionViewProps> = ({
  eligiblePlayers,
  selectedPlayerIds,
  onTogglePlayer,
  onStartTournament,
  teamType
}) => {
  return (
    <>
      <GameCard
        style={{
          padding: theme.spacing.lg
        }}
      >
        <h2
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.md,
            marginTop: 0
          }}
        >
          Select Players for {teamType} Team (Max 12)
        </h2>
        <p
          style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.lg
          }}
        >
          Select up to 12 players to participate in the round-robin tournament. Each
          player will play a best-of-5 match against every other player.
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md
          }}
        >
          <span
            style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.secondary
            }}
          >
            Selected: {selectedPlayerIds.length} / 12
          </span>
          <GameButton
            variant="primary"
            onClick={onStartTournament}
            disabled={selectedPlayerIds.length < 2}
          >
            Start Tournament
          </GameButton>
        </div>
      </GameCard>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: theme.spacing.md,
          overflow: 'auto',
          flex: 1
        }}
      >
        {eligiblePlayers.map((player) => {
          const isSelected = selectedPlayerIds.includes(player.id)
          return (
            <div
              key={player.id}
              onClick={() => onTogglePlayer(player.id)}
              style={{
                cursor: 'pointer',
                opacity: isSelected ? 1 : 0.7,
                border: `2px solid ${isSelected ? theme.colors.primary.main : 'transparent'}`,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.xs,
                transition: 'all 0.2s'
              }}
            >
              <PlayerCard
                player={player}
                actionButton={
                  <GameButton
                    variant={isSelected ? 'danger' : 'primary'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onTogglePlayer(player.id)
                    }}
                    style={{ width: '100%' }}
                  >
                    {isSelected ? 'Remove' : 'Select'}
                  </GameButton>
                }
              />
            </div>
          )
        })}
      </div>
    </>
  )
}

// Results View Component
interface ResultsViewProps {
  teamResults: any
  players: any[]
  onViewRanking: () => void
  changeScreen: (screen: Screens) => void
  onWatchMatch: (player1Id: string, player2Id: string) => void
  onUpdateGamesWatched: (count: number) => void
}

const ResultsView: React.FC<ResultsViewProps> = ({
  teamResults,
  players,
  onViewRanking,
  changeScreen,
  onWatchMatch,
  onUpdateGamesWatched
}) => {
  const maxGames = getMaxGamesToWatch()
  const currentWatched = teamResults.gamesWatched || 0

  const handleWatchMatch = (player1Id: string, player2Id: string) => {
    if (currentWatched >= maxGames) {
      alert(`You have already watched ${maxGames} games. This is the maximum allowed.`)
      return
    }
    onUpdateGamesWatched(currentWatched + 1)
    onWatchMatch(player1Id, player2Id)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.lg,
        flex: 1,
        overflow: 'hidden'
      }}
    >
      <ResultsMatrix
        teamResults={teamResults}
        players={players}
        onWatchMatch={handleWatchMatch}
        gamesWatched={currentWatched}
        maxGamesToWatch={maxGames}
      />
      <div
        style={{
          display: 'flex',
          gap: theme.spacing.md,
          justifyContent: 'flex-end'
        }}
      >
        <GameButton variant="primary" onClick={onViewRanking}>
          Assign Rankings
        </GameButton>
      </div>
    </div>
  )
}

// Ranking View Component
interface RankingViewProps {
  teamResults: any
  players: any[]
  onUpdateRankings: (rankings: string[]) => void
}

const RankingView: React.FC<RankingViewProps> = ({
  teamResults,
  players,
  onUpdateRankings
}) => {
  const playerMap = new Map(players.map((p) => [p.id, p]))
  const selectedPlayers = teamResults.selectedPlayerIds
    .map((id: string) => playerMap.get(id))
    .filter((p: Player | undefined): p is Player => p !== undefined)

  const [rankings, setRankings] = useState<string[]>(
    teamResults.coachRankings || teamResults.selectedPlayerIds
  )

  const handleMovePlayer = (playerId: string, newIndex: number) => {
    const newRankings = [...rankings]
    const currentIndex = newRankings.indexOf(playerId)
    if (currentIndex === -1) return

    newRankings.splice(currentIndex, 1)
    newRankings.splice(newIndex, 0, playerId)
    setRankings(newRankings)
  }

  const handleSaveRankings = () => {
    onUpdateRankings(rankings)
    alert('Rankings saved!')
  }

  return (
    <GameCard
      style={{
        padding: theme.spacing.lg,
        flex: 1,
        overflow: 'auto'
      }}
    >
      <h2
        style={{
          fontFamily: theme.typography.fontFamily.heading,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.md,
          marginTop: 0
        }}
      >
        Assign Player Rankings
      </h2>
      <p
        style={{
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.lg
        }}
      >
        Arrange players in your preferred ranking order. You can reference the automatic
        ranking based on tournament results, but you may choose to rank players
        differently based on your observations.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: theme.spacing.lg,
          marginBottom: theme.spacing.lg
        }}
      >
        {/* Ranking Slots */}
        <div>
          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              marginBottom: theme.spacing.md
            }}
          >
            Your Rankings
          </h3>
          {rankings.map((playerId, index) => {
            const player = playerMap.get(playerId)
            if (!player) return null
            const stats = teamResults.playerStats[playerId]
            const autoRank = stats.automaticRanking

            return (
              <div
                key={playerId}
                style={{
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.sm,
                  border: `2px solid ${theme.colors.primary.main}`,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.colors.primary.light,
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.md
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.primary.dark,
                    minWidth: '30px'
                  }}
                >
                  #{index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: theme.typography.fontWeight.bold }}>
                    {player.shortName || player.firstName}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary
                    }}
                  >
                    {stats.wins}W-{stats.losses}L | Auto Rank: #{autoRank}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                  {index > 0 && (
                    <button
                      onClick={() => handleMovePlayer(playerId, index - 1)}
                      style={{
                        padding: theme.spacing.xs,
                        border: 'none',
                        backgroundColor: theme.colors.secondary.main,
                        color: theme.colors.text.primary,
                        borderRadius: theme.borderRadius.sm,
                        cursor: 'pointer'
                      }}
                    >
                      ↑
                    </button>
                  )}
                  {index < rankings.length - 1 && (
                    <button
                      onClick={() => handleMovePlayer(playerId, index + 1)}
                      style={{
                        padding: theme.spacing.xs,
                        border: 'none',
                        backgroundColor: theme.colors.secondary.main,
                        color: theme.colors.text.primary,
                        borderRadius: theme.borderRadius.sm,
                        cursor: 'pointer'
                      }}
                    >
                      ↓
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Automatic Rankings Reference */}
        <div>
          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              marginBottom: theme.spacing.md
            }}
          >
            Automatic Rankings (Reference)
          </h3>
          {[...selectedPlayers]
            .sort((a, b) => {
              const aRank = teamResults.playerStats[a.id].automaticRanking
              const bRank = teamResults.playerStats[b.id].automaticRanking
              return aRank - bRank
            })
            .map((player, index) => {
              const stats = teamResults.playerStats[player.id]
              return (
                <div
                  key={player.id}
                  style={{
                    padding: theme.spacing.md,
                    marginBottom: theme.spacing.sm,
                    border: `1px solid ${theme.colors.neutral.gray300}`,
                    borderRadius: theme.borderRadius.md,
                    backgroundColor: theme.colors.neutral.gray50
                  }}
                >
                  <div style={{ fontWeight: theme.typography.fontWeight.bold }}>
                    #{stats.automaticRanking} - {player.shortName || player.firstName}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary
                    }}
                  >
                    {stats.wins}W-{stats.losses}L | Games: {stats.gamesWon}-
                    {stats.gamesLost}
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.md }}>
        <GameButton variant="primary" onClick={handleSaveRankings}>
          Save Rankings
        </GameButton>
      </div>
    </GameCard>
  )
}

export default RoundRobinScreen
