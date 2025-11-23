import React, { useMemo } from 'react'
import { RallyEvent } from '../../utils/matchEngine'
import { theme } from '../../theme/theme'
import { StyledText } from '../../styles'

interface CommentaryBoxProps {
  logEvents: RallyEvent[]
}

/**
 * Simplify point descriptions for commentary
 * Converts technical descriptions to more readable commentary
 */
function simplifyCommentary(description: string): string {
  // Extract player name and action
  const pointMatch = description.match(/^(.+?) wins the point \((.+)\)$/)
  if (pointMatch) {
    const playerName = pointMatch[1]
    const reason = pointMatch[2]

    // Simplify different types of reasons
    if (reason.includes('overwhelming advantage')) {
      // Extract the primary skill from "overwhelming advantage through X" or "overwhelming advantage (X and Y)"
      if (reason.includes('through')) {
        const skill = reason.split('through')[1].trim()
        // Simplify skill descriptions
        if (skill.includes('placement')) {
          return `${playerName} wins with excellent placement`
        } else if (skill.includes('spin')) {
          return `${playerName} wins with heavy spin`
        } else if (skill.includes('serve')) {
          return `${playerName} wins with a powerful serve`
        } else if (skill.includes('forehand') || skill.includes('backhand')) {
          return `${playerName} wins with a strong shot`
        }
      } else if (reason.includes('and')) {
        // Multiple skills - pick the primary one
        const skills = reason.match(/\((.+)\)/)?.[1] || ''
        if (skills.includes('placement')) {
          return `${playerName} wins with excellent placement`
        } else if (skills.includes('spin')) {
          return `${playerName} wins with heavy spin`
        } else {
          return `${playerName} wins with a strong shot`
        }
      }
    } else if (reason.includes('won with strong') || reason.includes('won with good')) {
      const skill = reason.replace(/won with (strong|good) /, '')
      if (skill.includes('placement')) {
        return `${playerName} wins with good placement`
      } else if (skill.includes('spin')) {
        return `${playerName} wins with strong spin`
      } else if (skill.includes('serve')) {
        return `${playerName} wins with a strong serve`
      } else {
        return `${playerName} wins with a strong shot`
      }
    } else if (reason.includes('lost to')) {
      const skill = reason.replace('lost to ', '')
      if (skill.includes('placement')) {
        return `${playerName} loses to opponent's placement`
      } else if (skill.includes('spin')) {
        return `${playerName} loses to opponent's spin`
      } else if (skill.includes('serve')) {
        return `${playerName} loses to opponent's serve`
      } else {
        return `${playerName} loses the point`
      }
    } else if (reason === 'serve error') {
      return `${playerName} wins (opponent serve error)`
    } else if (reason === 'receive error') {
      return `${playerName} wins (opponent receive error)`
    } else if (reason === 'error') {
      return `${playerName} wins (opponent error)`
    }

    // Fallback: return simplified version
    return `${playerName} wins the point`
  }

  // For non-point events, return as-is
  return description
}

export const CommentaryBox: React.FC<CommentaryBoxProps> = ({ logEvents }) => {
  // Get the latest significant events (point, error, lucky_bounce, serve)
  const latestCommentary = useMemo(() => {
    const significantEvents = logEvents.filter(
      (e) =>
        e.type === 'point' ||
        e.type === 'error' ||
        e.type === 'lucky_bounce' ||
        e.type === 'serve'
    )
    // Get last 3 significant events and simplify them
    return significantEvents.slice(-3).map((e) => simplifyCommentary(e.description))
  }, [logEvents])

  return (
    <div
      style={{
        padding: theme.spacing.md,
        background: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.md,
        border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}
    >
      {latestCommentary.length > 0 ? (
        <StyledText
          size="base"
          style={{
            color: theme.colors.text.primary,
            lineHeight: theme.typography.lineHeight.relaxed
          }}
        >
          {latestCommentary.join(' • ')}
        </StyledText>
      ) : (
        <StyledText size="sm" color="secondary" style={{ fontStyle: 'italic' }}>
          Commentary will appear here...
        </StyledText>
      )}
    </div>
  )
}
