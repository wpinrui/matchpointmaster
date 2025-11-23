import React from 'react'
import { MatchState } from '../../utils/matchEngine'
import GameCard from '../cards/GameCard'
import { theme } from '../../theme/theme'

interface ScoreboardProps {
  matchState: MatchState
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ matchState }) => {
  return (
    <GameCard
      style={{
        padding: theme.spacing.xl,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Simple 4 Card Scoreboard */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: theme.spacing.md
        }}
      >
        {/* Player 1 Current Game (Large Outer Card) */}
        <div
          style={{
            width: '120px',
            height: '140px',
            background: '#000000',
            border: '2px solid #FFFFFF',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: matchState.currentGameScore[0] >= 11 ? '#FF3333' : '#FFFFFF'
            }}
          >
            {matchState.currentGameScore[0]}
          </span>
        </div>

        {/* Player 1 Sets (Small Inner Card) */}
        <div
          style={{
            width: '70px',
            height: '90px',
            background: '#000000',
            border: '2px solid #FFFFFF',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <span
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#FFFFFF'
            }}
          >
            {matchState.sets[0]}
          </span>
          {matchState.setScores[matchState.currentSet] && (
            <span
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#CCCCCC'
              }}
            >
              {matchState.setScores[matchState.currentSet][0]}
            </span>
          )}
        </div>

        {/* Player 2 Sets (Small Inner Card) */}
        <div
          style={{
            width: '70px',
            height: '90px',
            background: '#000000',
            border: '2px solid #FFFFFF',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <span
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#FFFFFF'
            }}
          >
            {matchState.sets[1]}
          </span>
          {matchState.setScores[matchState.currentSet] && (
            <span
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#CCCCCC'
              }}
            >
              {matchState.setScores[matchState.currentSet][1]}
            </span>
          )}
        </div>

        {/* Player 2 Current Game (Large Outer Card) */}
        <div
          style={{
            width: '120px',
            height: '140px',
            background: '#000000',
            border: '2px solid #FFFFFF',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: matchState.currentGameScore[1] >= 11 ? '#FF3333' : '#FFFFFF'
            }}
          >
            {matchState.currentGameScore[1]}
          </span>
        </div>
      </div>
    </GameCard>
  )
}
