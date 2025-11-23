/**
 * Email preview section for home screen
 */
import React from 'react'
import GameButton from '../buttons/GameButton'
import GameCard from '../cards/GameCard'
import { EmailCard } from '../emails/EmailCard'
import { theme } from '../../theme/theme'
import { Email } from '../../services/savegame/types'
import { Screens } from '../../screen_manager/screens'

interface EmailPreviewSectionProps {
  unreadEmails: Email[]
  currentSeasonYear: number
  currentSeasonMonth: number
  onEmailClick: (email: Email) => void
  onChangeScreen: (screen: Screens) => void
}

export const EmailPreviewSection: React.FC<EmailPreviewSectionProps> = ({
  unreadEmails,
  currentSeasonYear,
  currentSeasonMonth,
  onEmailClick,
  onChangeScreen
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.lg,
        overflow: 'hidden',
        borderRight: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
        paddingRight: theme.spacing.lg
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h2
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            margin: 0
          }}
        >
          Inbox
          {unreadEmails.length > 0 && (
            <span
              style={{
                marginLeft: theme.spacing.sm,
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.primary.main,
                fontWeight: theme.typography.fontWeight.bold
              }}
            >
              ({unreadEmails.length})
            </span>
          )}
        </h2>
        <GameButton
          variant="secondary"
          size="sm"
          onClick={() => onChangeScreen(Screens.EMAIL)}
          type="button"
        >
          View All
        </GameButton>
      </div>

      {unreadEmails.length > 0 ? (
        <div
          style={{
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm
          }}
        >
          {unreadEmails.slice(0, 5).map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              onClick={() => onEmailClick(email)}
              currentSeasonYear={currentSeasonYear}
              currentSeasonMonth={currentSeasonMonth}
            />
          ))}
          {unreadEmails.length > 5 && (
            <div
              style={{
                textAlign: 'center',
                padding: theme.spacing.md,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm
              }}
            >
              +{unreadEmails.length - 5} more unread email
              {unreadEmails.length - 5 !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      ) : (
        <GameCard
          style={{
            padding: theme.spacing.xl,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <p
            style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.secondary,
              margin: 0,
              marginBottom: theme.spacing.md
            }}
          >
            No unread emails
          </p>
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              margin: 0,
              marginBottom: theme.spacing.lg
            }}
          >
            Check your inbox for updates about the game world, tournaments, and important
            announcements.
          </p>
          <GameButton
            variant="primary"
            size="sm"
            onClick={() => onChangeScreen(Screens.EMAIL)}
            type="button"
          >
            Open Inbox
          </GameButton>
        </GameCard>
      )}
    </div>
  )
}
