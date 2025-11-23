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

  // Track which email IDs we've already handled (to prevent double-marking)
  const handledEmailIdsRef = React.useRef<Set<string>>(new Set())

  // Check for navigation email ID and handle it
  const checkAndHandleNavigationEmail = React.useCallback(() => {
    const passedEmailId = sessionStorage.getItem('selectedEmailId')
    if (passedEmailId && !handledEmailIdsRef.current.has(passedEmailId)) {
      sessionStorage.removeItem('selectedEmailId')
      const email = emails.find((e) => e.id === passedEmailId)
      if (email && !email.read) {
        markEmailAsRead(passedEmailId)
        handledEmailIdsRef.current.add(passedEmailId)
        return passedEmailId
      }
      handledEmailIdsRef.current.add(passedEmailId)
    }
    return null
  }, [emails, markEmailAsRead])

  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(() => {
    // First, check if an email ID was passed from navigation
    const navigationEmailId = checkAndHandleNavigationEmail()
    if (navigationEmailId) {
      return navigationEmailId
    }

    // Otherwise, default to oldest unread email, or newest email if all are read
    const unread = emails.filter((e) => !e.read).sort((a, b) => a.timestamp - b.timestamp)
    if (unread.length > 0) {
      return unread[0].id
    }
    const sorted = [...emails].sort((a, b) => b.timestamp - a.timestamp)
    return sorted.length > 0 ? sorted[0].id : null
  })

  // Check for navigation email ID on mount and when emails change
  // This handles both initial mount and cases where EmailScreen is already mounted
  // The checkAndHandleNavigationEmail function uses a ref to prevent double-handling
  React.useEffect(() => {
    const navigationEmailId = checkAndHandleNavigationEmail()
    if (navigationEmailId && navigationEmailId !== selectedEmailId) {
      setSelectedEmailId(navigationEmailId)
    }
  }, [checkAndHandleNavigationEmail, selectedEmailId]) // Run when dependencies change

  const selectedEmail = useMemo(() => {
    return emails.find((e) => e.id === selectedEmailId) || null
  }, [emails, selectedEmailId])

  const handleEmailClick = (email: Email) => {
    setSelectedEmailId(email.id)
    if (!email.read) {
      markEmailAsRead(email.id)
    }
  }

  // Find next unread email - the least recent (oldest) unread email
  const nextUnreadEmail = useMemo(() => {
    if (!selectedEmailId) {
      // If no email is selected, return the oldest unread email
      const unreadSorted = emails
        .filter((e) => !e.read)
        .sort((a, b) => a.timestamp - b.timestamp)
      return unreadSorted.length > 0 ? unreadSorted[0] : null
    }

    // Get all emails that are unread and not the currently selected one
    // We check emails directly instead of unreadEmails to handle cases where
    // the current email was just marked as read but unreadEmails hasn't updated yet
    const otherUnreadEmails = emails
      .filter((e) => !e.read && e.id !== selectedEmailId)
      .sort((a, b) => a.timestamp - b.timestamp)

    // Return the oldest unread email (first in ascending timestamp order)
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
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
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
          </h1>
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
        </div>
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
