/**
 * Email preview section for home screen
 */
import React, { useMemo } from 'react'
import GameButton from '../buttons/GameButton'
import GameCard from '../cards/GameCard'
import { EmailCard } from '../emails/EmailCard'
import { theme } from '../../theme/theme'
import { Email } from '../../services/savegame/types'
import { Screens } from '../../screen_manager/screens'
import { StyledHeading, StyledText, StyledFlex } from '../../styles'

interface EmailPreviewSectionProps {
  allEmails: Email[]
  currentSeasonYear: number
  currentSeasonMonth: number
  onEmailClick: (email: Email) => void
  onChangeScreen: (screen: Screens) => void
}

export const EmailPreviewSection: React.FC<EmailPreviewSectionProps> = ({
  allEmails,
  currentSeasonYear,
  currentSeasonMonth,
  onEmailClick,
  onChangeScreen
}) => {
  const unreadEmails = useMemo(() => {
    return allEmails.filter((e) => !e.read)
  }, [allEmails])

  const sortedEmails = useMemo(() => {
    return [...allEmails].sort((a, b) => b.timestamp - a.timestamp)
  }, [allEmails])

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
        <StyledFlex align="center" gap="sm">
          <StyledHeading size="h3" margin="0">
            Inbox
          </StyledHeading>
          {unreadEmails.length > 0 && (
            <span
              style={{
                backgroundColor: theme.colors.primary.main,
                color: theme.colors.primary.contrast,
                borderRadius: '12px',
                minWidth: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.bold,
                padding: `0 ${theme.spacing.xs}`,
                lineHeight: 1
              }}
            >
              {unreadEmails.length > 99 ? '99+' : unreadEmails.length}
            </span>
          )}
        </StyledFlex>
        <GameButton
          variant="secondary"
          size="sm"
          onClick={() => onChangeScreen(Screens.EMAIL)}
          type="button"
        >
          View All
        </GameButton>
      </StyledFlex>

      {sortedEmails.length > 0 ? (
        <StyledFlex
          direction="column"
          gap="sm"
          style={{
            overflowY: 'auto',
            flex: 1
          }}
        >
          {sortedEmails.slice(0, 10).map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              onClick={() => onEmailClick(email)}
              currentSeasonYear={currentSeasonYear}
              currentSeasonMonth={currentSeasonMonth}
            />
          ))}
          {sortedEmails.length > 10 && (
            <StyledText
              size="sm"
              color="secondary"
              style={{ textAlign: 'center', padding: theme.spacing.md }}
            >
              +{sortedEmails.length - 10} more email
              {sortedEmails.length - 10 !== 1 ? 's' : ''}
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
            No emails
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
