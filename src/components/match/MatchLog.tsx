import React, { useEffect, useRef } from 'react'
import { RallyEvent } from '../../utils/matchEngine'
import GameCard from '../cards/GameCard'
import { theme } from '../../theme/theme'

interface MatchLogProps {
  logEvents: RallyEvent[]
}

export const MatchLog: React.FC<MatchLogProps> = ({ logEvents }) => {
  const logEndRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll log to bottom when new events are added
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logEvents])

  return (
    <GameCard
      style={{
        padding: 0,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
        height: '100%'
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: theme.colors.background.dark,
          padding: theme.spacing.md,
          fontFamily: theme.typography.fontFamily.primary,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%'
        }}
      >
        {logEvents.length === 0 ? (
          <div
            style={{
              color: theme.colors.text.light,
              fontStyle: 'italic',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Match log will appear here...
          </div>
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}
          >
            {logEvents.map((event, index) => (
              <div
                key={index}
                style={{
                  color:
                    event.type === 'point'
                      ? theme.colors.success.main
                      : event.type === 'error'
                        ? theme.colors.error.main
                        : event.type === 'lucky_bounce'
                          ? theme.colors.accent.main
                          : event.type === 'ball'
                            ? theme.colors.text.primary
                            : theme.colors.text.secondary,
                  fontSize:
                    event.type === 'ball'
                      ? theme.typography.fontSize.xs
                      : theme.typography.fontSize.sm,
                  padding: event.type === 'ball' ? theme.spacing.xs : 0,
                  borderLeft:
                    event.type === 'ball'
                      ? `2px solid ${theme.colors.border.default}`
                      : 'none',
                  paddingLeft: event.type === 'ball' ? theme.spacing.sm : 0
                }}
              >
                {event.description}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </GameCard>
  )
}
