import React from 'react'
import { Email } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import GameCard from '../cards/GameCard'
import { formatEmailDateShort } from '../../utils/emailDateFormatter'
import { emailTagColors } from './emailTagColors'

interface EmailCardProps {
  email: Email
  isSelected?: boolean
  onClick: () => void
  currentSeasonYear?: number
  currentSeasonMonth?: number
}

export const EmailCard: React.FC<EmailCardProps> = ({
  email,
  isSelected,
  onClick,
  currentSeasonYear = new Date().getFullYear(),
  currentSeasonMonth = new Date().getMonth() + 1
}) => {
  const [isHovered, setIsHovered] = React.useState(false)

  const backgroundColor = isSelected
    ? theme.colors.primary.light + '10'
    : isHovered
      ? theme.colors.primary.light + '15'
      : email.read
        ? theme.colors.background.primary
        : theme.colors.primary.light + '20'

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ marginBottom: theme.spacing.sm }}
    >
      <GameCard
        onClick={onClick}
        style={{
          padding: theme.spacing.md,
          cursor: 'pointer',
          border: isSelected ? `2px solid ${theme.colors.primary.main}` : undefined,
          backgroundColor,
          transition: 'all 0.2s ease'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                marginBottom: theme.spacing.xs
              }}
            >
              {!email.read && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: theme.colors.primary.main,
                    flexShrink: 0
                  }}
                />
              )}
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: email.read
                    ? theme.typography.fontWeight.normal
                    : theme.typography.fontWeight.bold,
                  color: theme.colors.text.secondary
                }}
              >
                {email.from}
              </span>
            </div>
            <h3
              style={{
                fontFamily: theme.typography.fontFamily.heading,
                fontSize: theme.typography.fontSize.base,
                fontWeight: email.read
                  ? theme.typography.fontWeight.medium
                  : theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                margin: 0,
                marginBottom: theme.spacing.xs,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {email.subject}
            </h3>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {email.body.split('\n')[0]}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: theme.spacing.xs,
              marginLeft: theme.spacing.sm
            }}
          >
            <span
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.secondary,
                whiteSpace: 'nowrap'
              }}
            >
              {formatEmailDateShort(
                email.timestamp,
                currentSeasonYear,
                currentSeasonMonth
              )}
            </span>
            {email.tags.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: theme.spacing.xs,
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end'
                }}
              >
                {email.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      borderRadius: theme.borderRadius.sm,
                    backgroundColor: emailTagColors[tag] + '20',
                    color: emailTagColors[tag],
                      fontWeight: theme.typography.fontWeight.medium
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </GameCard>
    </div>
  )
}
