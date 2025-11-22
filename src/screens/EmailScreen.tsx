import React, { useState, useMemo } from 'react'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { theme } from '../theme/theme'
import { EmailCard } from '../components/emails/EmailCard'
import { EmailView } from '../components/emails/EmailView'
import { Email } from '../services/savegame/types'
import GameButton from '../components/buttons/GameButton'

const EmailScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { emails, markEmailAsRead, season } = useSaveDataContext()

  const unreadEmails = useMemo(() => {
    return emails.filter((e) => !e.read).sort((a, b) => b.timestamp - a.timestamp)
  }, [emails])

  const sortedEmails = useMemo(() => {
    return [...emails].sort((a, b) => b.timestamp - a.timestamp)
  }, [emails])

  // Initialize with first unread email, or first email if all are read
  // Also check if an email ID was passed from navigation (e.g., clicking email card on home screen)
  const getInitialEmailId = () => {
    // Check if an email ID was passed from navigation
    const passedEmailId = sessionStorage.getItem('selectedEmailId')
    if (passedEmailId) {
      sessionStorage.removeItem('selectedEmailId') // Clear it after reading
      const emailExists = emails.find((e) => e.id === passedEmailId)
      if (emailExists) {
        return passedEmailId
      }
    }

    // Otherwise, default to first unread email, or first email if all are read
    const unread = emails.filter((e) => !e.read).sort((a, b) => b.timestamp - a.timestamp)
    if (unread.length > 0) {
      return unread[0].id
    }
    const sorted = [...emails].sort((a, b) => b.timestamp - a.timestamp)
    return sorted.length > 0 ? sorted[0].id : null
  }

  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(getInitialEmailId)

  // Mark initial email as read when component mounts if it was passed from navigation
  React.useEffect(() => {
    if (selectedEmailId) {
      const email = emails.find((e) => e.id === selectedEmailId)
      if (email && !email.read) {
        markEmailAsRead(selectedEmailId)
      }
    }
  }, [selectedEmailId, emails, markEmailAsRead])

  const selectedEmail = useMemo(() => {
    return emails.find((e) => e.id === selectedEmailId) || null
  }, [emails, selectedEmailId])

  const handleEmailClick = (email: Email) => {
    setSelectedEmailId(email.id)
    if (!email.read) {
      markEmailAsRead(email.id)
    }
  }

  // Find next unread email - any other unread email besides the current one
  const nextUnreadEmail = useMemo(() => {
    if (!selectedEmailId) return null

    // Get all emails that are unread and not the currently selected one
    // We check emails directly instead of unreadEmails to handle cases where
    // the current email was just marked as read but unreadEmails hasn't updated yet
    const otherUnreadEmails = emails
      .filter((e) => !e.read && e.id !== selectedEmailId)
      .sort((a, b) => b.timestamp - a.timestamp)

    // If there are other unread emails, return the first one (most recent)
    return otherUnreadEmails.length > 0 ? otherUnreadEmails[0] : null
  }, [emails, selectedEmailId])

  const handleNextUnread = () => {
    if (nextUnreadEmail) {
      setSelectedEmailId(nextUnreadEmail.id)
      if (!nextUnreadEmail.read) {
        markEmailAsRead(nextUnreadEmail.id)
      }
    } else {
      changeScreen(Screens.HOME)
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
          marginBottom: theme.spacing.md
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
          Inbox
          {unreadEmails.length > 0 && (
            <span
              style={{
                marginLeft: theme.spacing.sm,
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.primary.main,
                fontWeight: theme.typography.fontWeight.bold
              }}
            >
              ({unreadEmails.length} unread)
            </span>
          )}
        </h1>
        <GameButton variant="secondary" onClick={handleNextUnread} type="button">
          {nextUnreadEmail ? 'Next Unread' : 'Back to Home'}
        </GameButton>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '400px 1fr',
          gap: theme.spacing.lg,
          height: 'calc(100% - 100px)',
          overflow: 'hidden'
        }}
      >
        {/* Email List */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRight: `1px solid ${theme.colors.neutral.gray300}`,
            paddingRight: theme.spacing.lg
          }}
        >
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              paddingRight: theme.spacing.sm
            }}
          >
            {sortedEmails.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: theme.spacing.xl,
                  color: theme.colors.text.secondary
                }}
              >
                <p>No emails</p>
              </div>
            ) : (
              sortedEmails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  isSelected={email.id === selectedEmailId}
                  onClick={() => handleEmailClick(email)}
                  currentSeasonYear={season.year}
                  currentSeasonMonth={season.month}
                />
              ))
            )}
          </div>
        </div>

        {/* Email View */}
        <div
          style={{
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <EmailView email={selectedEmail} />
        </div>
      </div>
    </div>
  )
}

export default EmailScreen
