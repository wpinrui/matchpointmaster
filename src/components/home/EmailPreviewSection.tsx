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
import { StyledHeading, StyledText, StyledFlex } from '../../styles'

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
    <StyledFlex
      direction="column"
      gap="lg"
      style={{
        overflow: 'hidden',
        borderRight: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
        paddingRight: theme.spacing.lg
      }}
    >
      <StyledFlex justify="space-between" align="center">
        <StyledHeading size="h3" margin="0">
          Inbox
          {unreadEmails.length > 0 && (
            <StyledText
              size="base"
              weight="bold"
              style={{ marginLeft: theme.spacing.sm, color: theme.colors.primary.main }}
            >
              ({unreadEmails.length})
            </StyledText>
          )}
        </StyledHeading>
        <GameButton
          variant="secondary"
          size="sm"
          onClick={() => onChangeScreen(Screens.EMAIL)}
          type="button"
        >
          View All
        </GameButton>
      </StyledFlex>

      {unreadEmails.length > 0 ? (
        <StyledFlex
          direction="column"
          gap="sm"
          style={{
            overflowY: 'auto',
            flex: 1
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
            <StyledText
              size="sm"
              color="secondary"
              style={{ textAlign: 'center', padding: theme.spacing.md }}
            >
              +{unreadEmails.length - 5} more unread email
              {unreadEmails.length - 5 !== 1 ? 's' : ''}
            </StyledText>
          )}
        </StyledFlex>
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
          <StyledText
            size="base"
            color="secondary"
            style={{ margin: `0 0 ${theme.spacing.md} 0` }}
          >
            No unread emails
          </StyledText>
          <StyledText
            size="sm"
            color="secondary"
            style={{ margin: `0 0 ${theme.spacing.lg} 0` }}
          >
            Check your inbox for updates about the game world, tournaments, and important
            announcements.
          </StyledText>
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
    </StyledFlex>
  )
}
