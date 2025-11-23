import React, { useState, useMemo, useEffect, useCallback } from 'react'
import GameButton from '../components/buttons/GameButton'
import GameCard from '../components/cards/GameCard'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import {
  Gender,
  RoundRobinTeamType,
  RoundRobinData,
  RoundRobinMatchResult,
  Player
} from '../services/savegame/types'
import { theme } from '../theme/theme'
import {
  filterPlayersByRoundRobinTeamType,
  getAvailableTeamTypes
} from '../utils/roundRobinHelpers'
import {
  generateOrderedMatchups,
  getMatchKey,
  simulateMatch,
  calculatePlayerStats
} from '../utils/roundRobinTournamentSimulation'
import { getMaxGamesToWatch } from '../utils/roundRobinEngine'
import { RankingView } from '../components/roundRobin/RankingView'
import { ResultsMatrix } from '../components/roundRobin/ResultsMatrix'
import {
  generateRoundRobinCompletionEmail,
  areAllTeamsCompleted
} from '../utils/roundRobinCompletion'
import { advanceToNextPhase } from '../utils/phaseProgression'
import { GamePhase } from '../utils/gamePhases'

type RoundRobinView = 'matchSelection' | 'tournament' | 'ranking'

const RoundRobinScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const {
    players,
    teamRoster,
    school,
    season,
    roundRobinData,
    updateRoundRobinData,
    updateSeason,
    addEmail,
    manager,
    trainingPlan,
    skillSnapshots,
    aiSchools,
    updateAISchools
  } = useSaveDataContext()

  // Get available teams based on school type
  const availableTeams = useMemo(
    () => getAvailableTeamTypes(school.teamType),
    [school.teamType]
  )

  // State
  const [currentTeam, setCurrentTeam] = useState<RoundRobinTeamType>(
    availableTeams[0] || 'C boys'
  )
  const [currentView, setCurrentView] = useState<RoundRobinView>('matchSelection')
  const [simulationSpeed, setSimulationSpeed] = useState(1) // 1x, 2x, 4x, etc.
  const [isSimulating, setIsSimulating] = useState(false)

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

  // Check for completed match results on mount and whenever roundRobinData changes
  useEffect(() => {
    if (!roundRobinData) return

    const matchCompleted = sessionStorage.getItem('roundRobinMatchCompleted')
    const matchResultStr = sessionStorage.getItem('roundRobinMatchResult')

    if (matchCompleted === 'true' && matchResultStr) {
      try {
        const matchResult = JSON.parse(matchResultStr)

        // Find which team this match belongs to by checking all teams
        for (const teamType of availableTeams) {
          const teamResult = roundRobinData.teamResults[teamType]
          if (!teamResult || !teamResult.tournamentStarted) continue

          const tempOrderedMatchups = generateOrderedMatchups(
            teamResult.selectedPlayerIds
          )
          const currentMatchup = tempOrderedMatchups[teamResult.currentMatchIndex]

          if (currentMatchup && currentMatchup.matchKey === matchResult.matchKey) {
            // This is the match we're looking for - process the result
            const roundRobinMatchResult = {
              player1Id: matchResult.player1Id,
              player2Id: matchResult.player2Id,
              player1GamesWon: matchResult.player1GamesWon,
              player2GamesWon: matchResult.player2GamesWon,
              winnerId: matchResult.winnerId,
              gameResults: matchResult.gameResults || []
            }

            const newIndex = matchResult.currentMatchIndex + 1
            const updatedMatchResults = [
              ...teamResult.matchResults,
              roundRobinMatchResult
            ]
            const updatedStats = calculatePlayerStats(
              teamResult.selectedPlayerIds,
              updatedMatchResults
            )

            const updatedData: RoundRobinData = {
              ...roundRobinData,
              teamResults: {
                ...roundRobinData.teamResults,
                [teamType]: {
                  ...teamResult,
                  matchResults: updatedMatchResults,
                  playerStats: updatedStats,
                  currentMatchIndex: newIndex,
                  completed: newIndex >= tempOrderedMatchups.length
                }
              }
            }
            updateRoundRobinData.set(updatedData)

            // Clear session storage
            sessionStorage.removeItem('roundRobinMatchCompleted')
            sessionStorage.removeItem('roundRobinMatchResult')
            sessionStorage.removeItem('roundRobinMatch')

            // Check if all teams are complete
            if (newIndex >= tempOrderedMatchups.length) {
              if (areAllTeamsCompleted(updatedData)) {
                const completionEmail = generateRoundRobinCompletionEmail(
                  manager.fullName || 'Coach',
                  school.name || 'the school',
                  updatedData
                )
                addEmail(completionEmail)

                advanceToNextPhase(
                  {
                    currentMonth: season.month,
                    currentYear: season.year,
                    currentPhase: GamePhase.INTRA_CLUB,
                    players,
                    teamRoster,
                    school,
                    manager,
                    trainingPlan,
                    skillSnapshots,
                    aiSchools
                  },
                  {
                    updateSeason,
                    updatePlayers: { set: () => {} },
                    updateTrainingPlan: {
                      setCompleted: () => {},
                      setMonthAndYear: () => {}
                    },
                    updateSkillSnapshots: {
                      addMany: () => {}
                    },
                    updateAISchools,
                    addEmail
                  }
                )
              }
            }

            // Update view if needed
            if (teamType === currentTeam) {
              if (updatedData.teamResults[teamType]?.completed) {
                setCurrentView('ranking')
              } else {
                setCurrentView('tournament')
              }
            }

            break // Found and processed the match
          }
        }
      } catch (e) {
        console.error('Error processing match result:', e)
        // Clear invalid data
        sessionStorage.removeItem('roundRobinMatchCompleted')
        sessionStorage.removeItem('roundRobinMatchResult')
      }
    }
  }, [
    roundRobinData,
    availableTeams,
    currentTeam,
    players,
    teamRoster,
    school,
    manager,
    season,
    trainingPlan,
    skillSnapshots,
    aiSchools,
    updateRoundRobinData,
    updateSeason,
    addEmail,
    updateAISchools
  ])

  // Get players on the team roster, filtered by current team type
  const eligiblePlayers = useMemo(() => {
    const teamPlayers = players.filter((p) => teamRoster.includes(p.id))
    return filterPlayersByRoundRobinTeamType(teamPlayers, currentTeam)
  }, [players, teamRoster, currentTeam])

  // Get current team results
  const currentTeamResults = useMemo(() => {
    if (!roundRobinData) return null
    return roundRobinData.teamResults[currentTeam]
  }, [roundRobinData, currentTeam])

  // Generate ordered matchups
  const orderedMatchups = useMemo(() => {
    if (!currentTeamResults || eligiblePlayers.length < 2) return []
    return generateOrderedMatchups(currentTeamResults.selectedPlayerIds)
  }, [currentTeamResults, eligiblePlayers.length])

  // Get player map
  const playerMap = useMemo(() => {
    return new Map(players.map((p) => [p.id, p]))
  }, [players])

  // Initialize team result if needed and recover missing matches
  useEffect(() => {
    if (!roundRobinData || eligiblePlayers.length < 2) return

    const currentTeamResult = roundRobinData.teamResults[currentTeam]

    if (!currentTeamResult && eligiblePlayers.length >= 2) {
      const playerIds = eligiblePlayers.map((p) => p.id)
      const matchups = generateOrderedMatchups(playerIds)

      const newTeamResult = {
        teamType: currentTeam,
        selectedPlayerIds: playerIds,
        matchResults: [],
        playerStats: {},
        coachRankings: null,
        matchesToWatch: [],
        currentMatchIndex: 0,
        tournamentStarted: false,
        completed: false
      }

      const updatedData: RoundRobinData = {
        ...roundRobinData,
        teamResults: {
          ...roundRobinData.teamResults,
          [currentTeam]: newTeamResult
        }
      }
      updateRoundRobinData.set(updatedData)
    } else if (
      currentTeamResult &&
      currentTeamResult.tournamentStarted &&
      !currentTeamResult.completed
    ) {
      // Check for missing matches and recover them
      const playerIds = currentTeamResult.selectedPlayerIds
      const expectedMatchups = generateOrderedMatchups(playerIds)
      const existingMatchKeys = new Set(
        currentTeamResult.matchResults.map((r) => getMatchKey(r.player1Id, r.player2Id))
      )

      // Find matches that should exist but don't
      const missingMatches: RoundRobinMatchResult[] = []
      for (
        let i = 0;
        i < currentTeamResult.currentMatchIndex && i < expectedMatchups.length;
        i++
      ) {
        const matchup = expectedMatchups[i]
        const matchKey = matchup.matchKey
        if (!existingMatchKeys.has(matchKey)) {
          // This match should have been played but is missing
          const player1 = playerMap.get(matchup.player1Id)
          const player2 = playerMap.get(matchup.player2Id)
          if (player1 && player2) {
            // Simulate the missing match
            const matchResult = simulateMatch(player1, player2)
            missingMatches.push(matchResult)
          }
        }
      }

      // If we found missing matches, add them
      if (missingMatches.length > 0) {
        console.warn(`Found ${missingMatches.length} missing matches, recovering...`)
        const updatedMatchResults = [...currentTeamResult.matchResults, ...missingMatches]
        const updatedStats = calculatePlayerStats(playerIds, updatedMatchResults)

        updateRoundRobinData.set((prevData) => {
          if (!prevData) return prevData
          const prevTeamResult = prevData.teamResults[currentTeam]
          if (!prevTeamResult) return prevData

          return {
            ...prevData,
            teamResults: {
              ...prevData.teamResults,
              [currentTeam]: {
                ...prevTeamResult,
                matchResults: updatedMatchResults,
                playerStats: updatedStats
              }
            }
          }
        })
      }

      // Set view based on tournament state
      if (currentTeamResult.completed) {
        // Tournament complete - show ranking view
        setCurrentView('ranking')
      } else {
        setCurrentView('tournament')
        // Note: Match result processing is handled by the dedicated useEffect above
        // to ensure it runs on every mount, not just when this effect runs
      }
    } else if (currentTeamResult) {
      // Set view based on tournament state
      if (currentTeamResult.completed) {
        // Tournament complete - show ranking view
        setCurrentView('ranking')
      } else if (currentTeamResult.tournamentStarted) {
        setCurrentView('tournament')
        // Note: Match result processing is handled by the dedicated useEffect above
        // to ensure it runs on every mount, not just when this effect runs
      } else {
        setCurrentView('matchSelection')
      }
    }
  }, [
    roundRobinData,
    currentTeam,
    eligiblePlayers,
    players,
    playerMap,
    updateRoundRobinData,
    changeScreen,
    orderedMatchups,
    manager,
    school,
    season,
    teamRoster,
    trainingPlan,
    skillSnapshots,
    aiSchools,
    updateSeason,
    addEmail,
    updateAISchools
  ])

  if (!currentTeamResults || eligiblePlayers.length < 2) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        <GameCard
          style={{
            padding: theme.spacing.lg,
            textAlign: 'center'
          }}
        >
          <p
            style={{
              fontSize: theme.typography.fontSize.lg,
              color: theme.colors.text.secondary
            }}
          >
            Need at least 2 players for {currentTeam} team to run the round-robin
            tournament.
          </p>
        </GameCard>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.xl,
          gap: theme.spacing.lg
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize['4xl'],
              fontWeight: theme.typography.fontWeight.extrabold,
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              marginBottom: theme.spacing.sm,
              textAlign: 'left'
            }}
          >
            Intra-Team Round-Robin Tournament - {currentTeam}
          </h1>
        </div>
        <GameButton variant="secondary" onClick={() => changeScreen(Screens.HOME)}>
          Back to Home
        </GameButton>
      </div>

      {/* Team Selector - show when not in tournament simulation */}
      {(!currentTeamResults.tournamentStarted || currentView === 'ranking') && (
        <GameCard
          style={{
            padding: theme.spacing.md,
            marginBottom: theme.spacing.lg
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
              const teamResult = roundRobinData?.teamResults[team]
              const isCompleted = teamResult?.completed === true
              return (
                <GameButton
                  key={team}
                  variant={isSelected ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setCurrentTeam(team)}
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
      )}

      {/* Match Selection View */}
      {currentView === 'matchSelection' && (
        <MatchSelectionView
          orderedMatchups={orderedMatchups}
          playerMap={playerMap}
          matchesToWatch={currentTeamResults.matchesToWatch || []}
          maxMatchesToWatch={getMaxGamesToWatch()}
          tournamentStarted={currentTeamResults.tournamentStarted || false}
          onUpdateMatchesToWatch={(matches) => {
            if (!roundRobinData) return
            const updatedData: RoundRobinData = {
              ...roundRobinData,
              teamResults: {
                ...roundRobinData.teamResults,
                [currentTeam]: {
                  ...currentTeamResults,
                  matchesToWatch: matches
                }
              }
            }
            updateRoundRobinData.set(updatedData)
          }}
          onStartTournament={() => {
            if (!roundRobinData) return
            const updatedData: RoundRobinData = {
              ...roundRobinData,
              teamResults: {
                ...roundRobinData.teamResults,
                [currentTeam]: {
                  ...currentTeamResults,
                  tournamentStarted: true,
                  currentMatchIndex: 0
                }
              }
            }
            updateRoundRobinData.set(updatedData)
            setCurrentView('tournament')
          }}
        />
      )}

      {/* Tournament Simulation View */}
      {currentView === 'tournament' && currentTeamResults.tournamentStarted && (
        <TournamentSimulationView
          orderedMatchups={orderedMatchups}
          playerMap={playerMap}
          teamResults={currentTeamResults}
          players={eligiblePlayers}
          currentMatchIndex={currentTeamResults.currentMatchIndex}
          matchesToWatch={currentTeamResults.matchesToWatch || []}
          onMatchComplete={(matchResult, newIndex) => {
            // Use functional update to ensure we have the latest state
            // This prevents race conditions when multiple matches are simulated quickly
            // or when the page is refreshed during simulation
            updateRoundRobinData.set((prevData) => {
              if (!prevData) return prevData

              const prevTeamResult = prevData.teamResults[currentTeam]
              if (!prevTeamResult) return prevData

              const updatedMatchResults = [...prevTeamResult.matchResults, matchResult]
              const updatedStats = calculatePlayerStats(
                prevTeamResult.selectedPlayerIds,
                updatedMatchResults
              )

              const isComplete = newIndex >= orderedMatchups.length

              const updatedData: RoundRobinData = {
                ...prevData,
                teamResults: {
                  ...prevData.teamResults,
                  [currentTeam]: {
                    ...prevTeamResult,
                    matchResults: updatedMatchResults,
                    playerStats: updatedStats,
                    currentMatchIndex: newIndex,
                    completed: isComplete
                  }
                }
              }

              // Check if all teams are now complete
              if (isComplete) {
                if (areAllTeamsCompleted(updatedData)) {
                  // All teams complete - advance phase and send email
                  const completionEmail = generateRoundRobinCompletionEmail(
                    manager.fullName || 'Coach',
                    school.name || 'the school',
                    updatedData
                  )
                  addEmail(completionEmail)

                  // Advance to next phase (June - Zonal)
                  advanceToNextPhase(
                    {
                      currentMonth: season.month,
                      currentYear: season.year,
                      currentPhase: GamePhase.INTRA_CLUB,
                      players,
                      teamRoster,
                      manager,
                      school,
                      trainingPlan,
                      skillSnapshots,
                      aiSchools
                    },
                    {
                      updateSeason,
                      updatePlayers: { set: () => {} }, // Not needed for phase advancement
                      updateTrainingPlan: {
                        setCompleted: () => {},
                        setMonthAndYear: () => {}
                      },
                      updateSkillSnapshots: {
                        addMany: () => {}
                      },
                      updateAISchools,
                      addEmail
                    }
                  )

                  // Navigate to home after a brief delay to allow state updates
                  setTimeout(() => {
                    changeScreen(Screens.HOME)
                  }, 100)
                }
              }

              return updatedData
            })
          }}
          onSkipToNextWatched={(nextIndex) => {
            if (!roundRobinData) return
            const updatedData: RoundRobinData = {
              ...roundRobinData,
              teamResults: {
                ...roundRobinData.teamResults,
                [currentTeam]: {
                  ...currentTeamResults,
                  currentMatchIndex: nextIndex
                }
              }
            }
            updateRoundRobinData.set(updatedData)
          }}
          onSkipToEnd={() => {
            if (!roundRobinData) return
            // Simulate all remaining matches instantly
            const remainingMatchups = orderedMatchups.slice(
              currentTeamResults.currentMatchIndex
            )
            const allMatchResults = [...currentTeamResults.matchResults]

            remainingMatchups.forEach((matchup) => {
              const player1 = playerMap.get(matchup.player1Id)
              const player2 = playerMap.get(matchup.player2Id)
              if (player1 && player2) {
                const matchResult = simulateMatch(player1, player2)
                allMatchResults.push(matchResult)
              }
            })

            const updatedStats = calculatePlayerStats(
              currentTeamResults.selectedPlayerIds,
              allMatchResults
            )

            const updatedData: RoundRobinData = {
              ...roundRobinData,
              teamResults: {
                ...roundRobinData.teamResults,
                [currentTeam]: {
                  ...currentTeamResults,
                  matchResults: allMatchResults,
                  playerStats: updatedStats,
                  currentMatchIndex: orderedMatchups.length,
                  completed: true
                }
              }
            }
            updateRoundRobinData.set(updatedData)

            // Check if all teams are now complete
            if (areAllTeamsCompleted(updatedData)) {
              // All teams complete - advance phase and send email
              const completionEmail = generateRoundRobinCompletionEmail(
                manager.fullName || 'Coach',
                school.name || 'the school',
                updatedData
              )
              addEmail(completionEmail)

              // Advance to next phase (June - Zonal)
              advanceToNextPhase(
                {
                  currentMonth: season.month,
                  currentYear: season.year,
                  currentPhase: GamePhase.INTRA_CLUB,
                  players,
                  teamRoster,
                  manager,
                  school,
                  trainingPlan,
                  skillSnapshots,
                  aiSchools
                },
                {
                  updateSeason,
                  updatePlayers: { set: () => {} },
                  updateTrainingPlan: {
                    setCompleted: () => {},
                    setMonthAndYear: () => {}
                  },
                  updateSkillSnapshots: {
                    addMany: () => {}
                  },
                  updateAISchools,
                  addEmail
                }
              )
            }

            changeScreen(Screens.HOME)
          }}
          changeScreen={changeScreen}
        />
      )}

      {/* Ranking View - After tournament completion */}
      {currentView === 'ranking' && currentTeamResults.completed && (
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
                  coachRankings: rankings
                }
              }
            }
            updateRoundRobinData.set(updatedData)
          }}
          changeScreen={changeScreen}
        />
      )}
    </div>
  )
}

// Match Selection View Component
interface MatchSelectionViewProps {
  orderedMatchups: ReturnType<typeof generateOrderedMatchups>
  playerMap: Map<string, Player>
  matchesToWatch: string[]
  maxMatchesToWatch: number
  onUpdateMatchesToWatch: (matches: string[]) => void
  onStartTournament: () => void
  tournamentStarted: boolean
}

const MatchSelectionView: React.FC<MatchSelectionViewProps> = ({
  orderedMatchups,
  playerMap,
  matchesToWatch,
  maxMatchesToWatch,
  onUpdateMatchesToWatch,
  onStartTournament,
  tournamentStarted
}) => {
  const handleToggleMatch = (matchKey: string) => {
    if (matchesToWatch.includes(matchKey)) {
      onUpdateMatchesToWatch(matchesToWatch.filter((m) => m !== matchKey))
    } else {
      if (matchesToWatch.length < maxMatchesToWatch) {
        onUpdateMatchesToWatch([...matchesToWatch, matchKey])
      }
    }
  }

  return (
    <>
      <GameCard
        style={{
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.lg
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
          Select Matches to Watch
        </h2>
        <p
          style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.lg
          }}
        >
          Choose up to {maxMatchesToWatch} matches to watch during the tournament. The
          simulation will automatically pause when a selected match is reached. Selected:{' '}
          {matchesToWatch.length} / {maxMatchesToWatch}
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: theme.spacing.md
          }}
        >
          <GameButton variant="primary" size="lg" onClick={onStartTournament}>
            {tournamentStarted ? 'Continue Tournament' : 'Start Tournament'}
          </GameButton>
        </div>
      </GameCard>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: theme.spacing.md,
          overflow: 'auto',
          flex: 1
        }}
      >
        {orderedMatchups.map((matchup, index) => {
          const player1 = playerMap.get(matchup.player1Id)
          const player2 = playerMap.get(matchup.player2Id)
          if (!player1 || !player2) return null

          const isSelected = matchesToWatch.includes(matchup.matchKey)

          return (
            <GameCard
              key={matchup.matchKey}
              style={{
                padding: theme.spacing.md,
                cursor: 'pointer',
                marginBottom: theme.spacing.md
              }}
              onClick={() => handleToggleMatch(matchup.matchKey)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: theme.spacing.sm
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                    fontWeight: theme.typography.fontWeight.medium
                  }}
                >
                  Match #{index + 1}
                </span>
                {isSelected && (
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.primary.main,
                      fontWeight: theme.typography.fontWeight.bold
                    }}
                  >
                    ✓ Selected
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary
                }}
              >
                {player1.shortName || player1.firstName} vs{' '}
                {player2.shortName || player2.firstName}
              </div>
              {matchesToWatch.length >= maxMatchesToWatch && !isSelected && (
                <div
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.light,
                    marginTop: theme.spacing.xs
                  }}
                >
                  Maximum matches selected
                </div>
              )}
            </GameCard>
          )
        })}
      </div>
    </>
  )
}

// Tournament Simulation View Component
interface TournamentSimulationViewProps {
  orderedMatchups: ReturnType<typeof generateOrderedMatchups>
  playerMap: Map<string, Player>
  teamResults: any
  players: Player[]
  currentMatchIndex: number
  matchesToWatch: string[]
  onMatchComplete: (matchResult: RoundRobinMatchResult, newIndex: number) => void
  onSkipToNextWatched: (nextIndex: number) => void
  onSkipToEnd: () => void
  changeScreen: (screen: Screens) => void
}

const TournamentSimulationView: React.FC<TournamentSimulationViewProps> = ({
  orderedMatchups,
  playerMap,
  teamResults,
  players,
  currentMatchIndex,
  matchesToWatch,
  onMatchComplete,
  onSkipToNextWatched,
  onSkipToEnd,
  changeScreen
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [viewMode, setViewMode] = useState<'matchOrder' | 'matrix'>('matchOrder')

  const currentMatchup = orderedMatchups[currentMatchIndex]
  const isComplete = currentMatchIndex >= orderedMatchups.length

  // Find next watched match index
  const nextWatchedMatchIndex = useMemo(() => {
    if (currentMatchIndex >= orderedMatchups.length - 1) return -1
    for (let i = currentMatchIndex + 1; i < orderedMatchups.length; i++) {
      if (matchesToWatch.includes(orderedMatchups[i].matchKey)) {
        return i
      }
    }
    return -1
  }, [currentMatchIndex, orderedMatchups, matchesToWatch])

  // Handle simulation progression
  const handleSimulateCurrentMatch = useCallback(() => {
    if (!currentMatchup) return

    const player1 = playerMap.get(currentMatchup.player1Id)
    const player2 = playerMap.get(currentMatchup.player2Id)

    if (!player1 || !player2) return

    const matchResult = simulateMatch(player1, player2)
    const newIndex = currentMatchIndex + 1
    onMatchComplete(matchResult, newIndex)
  }, [currentMatchup, playerMap, currentMatchIndex, onMatchComplete])

  // Auto-simulate when playing
  useEffect(() => {
    if (!isPlaying || isComplete || !currentMatchup) return

    const isCurrentMatchWatched = matchesToWatch.includes(currentMatchup.matchKey)

    // If current match should be watched, pause and wait for user
    if (isCurrentMatchWatched) {
      setIsPlaying(false)
      // TODO: Navigate to match screen
      return
    }

    // Otherwise, simulate after a delay based on speed
    const baseDelay = 500 // 500ms base delay
    const delay = baseDelay / speed

    const timer = setTimeout(() => {
      handleSimulateCurrentMatch()
    }, delay)

    return () => clearTimeout(timer)
  }, [
    isPlaying,
    isComplete,
    currentMatchup,
    matchesToWatch,
    speed,
    handleSimulateCurrentMatch
  ])

  if (isComplete) {
    return (
      <GameCard
        style={{
          padding: theme.spacing.xl,
          textAlign: 'center'
        }}
      >
        <h2
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.md
          }}
        >
          Tournament Complete!
        </h2>
        <p
          style={{
            fontSize: theme.typography.fontSize.lg,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.lg
          }}
        >
          All matches have been simulated. Results are available on the home screen.
        </p>
        <GameButton
          variant="primary"
          size="lg"
          onClick={() => changeScreen(Screens.HOME)}
        >
          Return to Home
        </GameButton>
      </GameCard>
    )
  }

  if (!currentMatchup) {
    return null
  }

  const player1 = playerMap.get(currentMatchup.player1Id)
  const player2 = playerMap.get(currentMatchup.player2Id)

  if (!player1 || !player2) {
    return null
  }

  const isCurrentMatchWatched = matchesToWatch.includes(currentMatchup.matchKey)
  const completedMatches = teamResults.matchResults.length
  const totalMatches = orderedMatchups.length

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
      {/* Progress Bar */}
      <GameCard
        style={{
          padding: theme.spacing.md
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.sm
          }}
        >
          <span
            style={{
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary
            }}
          >
            Match {completedMatches + 1} of {totalMatches}
          </span>
          <span
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary
            }}
          >
            {Math.round((completedMatches / totalMatches) * 100)}% Complete
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: theme.colors.background.nested,
            borderRadius: theme.borderRadius.sm,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${(completedMatches / totalMatches) * 100}%`,
              height: '100%',
              backgroundColor: theme.colors.primary.main,
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </GameCard>

      {/* Current Match Info */}
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
          {isCurrentMatchWatched ? (
            <>
              👁 Watching: {player1.shortName} vs {player2.shortName}
            </>
          ) : (
            <>
              Simulating: {player1.shortName} vs {player2.shortName}
            </>
          )}
        </h2>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          {!isCurrentMatchWatched && (
            <>
              <GameButton
                variant={isPlaying ? 'secondary' : 'success'}
                onClick={() => setIsPlaying(!isPlaying)}
                size="md"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </GameButton>
              <GameButton
                variant="secondary"
                onClick={() => {
                  const speeds = [0.5, 1, 2, 4, 8]
                  const currentIndex = speeds.indexOf(speed)
                  const newIndex = Math.max(0, currentIndex - 1)
                  setSpeed(speeds[newIndex])
                }}
                size="md"
                disabled={speed <= 0.5 || isPlaying}
              >
                ⏪ Slow Down ({speed}x)
              </GameButton>
              <GameButton
                variant="secondary"
                onClick={() => {
                  const speeds = [0.5, 1, 2, 4, 8]
                  const currentIndex = speeds.indexOf(speed)
                  const newIndex = Math.min(speeds.length - 1, currentIndex + 1)
                  setSpeed(speeds[newIndex])
                }}
                size="md"
                disabled={speed >= 8 || isPlaying}
              >
                ⏩ Speed Up ({speed}x)
              </GameButton>
            </>
          )}

          {isCurrentMatchWatched && (
            <GameButton
              variant="primary"
              size="md"
              onClick={() => {
                // Navigate to match screen to watch
                sessionStorage.setItem(
                  'roundRobinMatch',
                  JSON.stringify({
                    player1Id: player1.id,
                    player2Id: player2.id,
                    matchKey: currentMatchup.matchKey,
                    returnTo: Screens.ROUND_ROBIN,
                    currentMatchIndex
                  })
                )
                changeScreen(Screens.MATCH)
              }}
            >
              {sessionStorage.getItem('matchpointMaster_matchState')
                ? 'Continue Match'
                : 'Watch Match'}
            </GameButton>
          )}

          <GameButton
            variant="secondary"
            onClick={() => {
              // Skip current match (simulate instantly)
              handleSimulateCurrentMatch()
            }}
            size="md"
            disabled={isPlaying}
          >
            Skip Match
          </GameButton>

          {nextWatchedMatchIndex > 0 && (
            <GameButton
              variant="secondary"
              onClick={() => {
                // Skip to next watched match
                // Simulate all matches in between
                let index = currentMatchIndex
                while (index < nextWatchedMatchIndex) {
                  const matchup = orderedMatchups[index]
                  const p1 = playerMap.get(matchup.player1Id)
                  const p2 = playerMap.get(matchup.player2Id)
                  if (p1 && p2) {
                    const matchResult = simulateMatch(p1, p2)
                    // Call onMatchComplete for each match - it now uses functional updates
                    // so each call will use the latest state from the previous update
                    onMatchComplete(matchResult, index + 1)
                  }
                  index++
                }
                // Then skip to the next watched match index
                onSkipToNextWatched(nextWatchedMatchIndex)
              }}
              size="md"
              disabled={isPlaying}
            >
              Skip to Next Watched
            </GameButton>
          )}

          <GameButton
            variant="secondary"
            onClick={onSkipToEnd}
            size="md"
            disabled={isPlaying}
          >
            Skip to End
          </GameButton>
        </div>
      </GameCard>

      {/* View Toggle */}
      <GameCard
        style={{
          padding: theme.spacing.md
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.sm,
            justifyContent: 'center'
          }}
        >
          <GameButton
            variant={viewMode === 'matchOrder' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('matchOrder')}
          >
            Match Order
          </GameButton>
          <GameButton
            variant={viewMode === 'matrix' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('matrix')}
          >
            Results Matrix
          </GameButton>
        </div>
      </GameCard>

      {/* Match List View */}
      {viewMode === 'matchOrder' && (
        <GameCard
          style={{
            padding: theme.spacing.md,
            flex: 1,
            overflow: 'auto'
          }}
        >
          <h3
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.md
            }}
          >
            Match Schedule
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.xs
            }}
          >
            {orderedMatchups.map((matchup, index) => {
              const p1 = playerMap.get(matchup.player1Id)
              const p2 = playerMap.get(matchup.player2Id)
              if (!p1 || !p2) return null

              const isPast = index < currentMatchIndex
              const isCurrent = index === currentMatchIndex
              const isFuture = index > currentMatchIndex
              const matchResult = teamResults.matchResults[index]
              const isWatched = matchesToWatch.includes(matchup.matchKey)

              return (
                <div
                  key={matchup.matchKey}
                  style={{
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    backgroundColor: isCurrent
                      ? theme.colors.primary.light + '30'
                      : isPast
                        ? theme.colors.background.nested
                        : theme.colors.background.secondary,
                    border: `2px solid ${
                      isCurrent
                        ? theme.colors.primary.main
                        : isPast
                          ? theme.colors.success.main
                          : 'transparent'
                    }`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.secondary,
                        marginRight: theme.spacing.sm
                      }}
                    >
                      #{index + 1}
                    </span>
                    <span
                      style={{
                        fontWeight: isCurrent
                          ? theme.typography.fontWeight.bold
                          : theme.typography.fontWeight.normal,
                        color: theme.colors.text.primary
                      }}
                    >
                      {p1.shortName || p1.firstName} vs {p2.shortName || p2.firstName}
                    </span>
                    {isWatched && (
                      <span
                        style={{
                          marginLeft: theme.spacing.sm,
                          fontSize: theme.typography.fontSize.xs,
                          color: theme.colors.primary.main
                        }}
                      >
                        👁
                      </span>
                    )}
                  </div>
                  <div>
                    {matchResult ? (
                      <span
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text.secondary
                        }}
                      >
                        {matchResult.player1GamesWon}-{matchResult.player2GamesWon} (
                        {playerMap.get(matchResult.winnerId)?.shortName || 'Winner'} wins)
                      </span>
                    ) : isCurrent ? (
                      <span
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.primary.main,
                          fontWeight: theme.typography.fontWeight.bold
                        }}
                      >
                        {isCurrentMatchWatched ? 'Match in progress' : 'Simulating...'}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text.light
                        }}
                      >
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </GameCard>
      )}

      {/* Results Matrix View */}
      {viewMode === 'matrix' && (
        <ResultsMatrix
          teamResults={teamResults}
          players={players}
          gamesWatched={matchesToWatch.length}
          maxGamesToWatch={getMaxGamesToWatch()}
        />
      )}
    </div>
  )
}

export default RoundRobinScreen
