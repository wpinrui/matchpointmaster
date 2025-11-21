import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Email, EmailTag } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import GameCard from '../cards/GameCard'
import { formatEmailDate } from '../../utils/emailDateFormatter'

interface EmailViewProps {
  email: Email | null
}

const tagColors: Record<EmailTag, string> = {
  [EmailTag.WELCOME]: theme.colors.primary.main,
  [EmailTag.NEWS]: theme.colors.secondary.main,
  [EmailTag.DRAFT]: theme.colors.warning.main,
  [EmailTag.TOURNAMENT]: theme.colors.success.main,
  [EmailTag.TRAINING]: theme.colors.secondary.main,
  [EmailTag.ADMINISTRATIVE]: theme.colors.neutral.gray600,
  [EmailTag.SOCIAL]: theme.colors.accent.main
}

export const EmailView: React.FC<EmailViewProps> = ({ email }) => {
  if (!email) {
    return (
      <GameCard
        style={{
          padding: theme.spacing.xl,
          textAlign: 'center',
          color: theme.colors.text.secondary,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <p style={{ fontSize: theme.typography.fontSize.lg, margin: 0 }}>
          Select an email to view its contents
        </p>
      </GameCard>
    )
  }

  return (
    <GameCard
      style={{
        padding: theme.spacing.xl,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto'
      }}
    >
      <div style={{ marginBottom: theme.spacing.lg }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: theme.spacing.md
          }}
        >
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontFamily: theme.typography.fontFamily.heading,
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                margin: 0,
                marginBottom: theme.spacing.sm
              }}
            >
              {email.subject}
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.md,
                marginBottom: theme.spacing.sm
              }}
            >
              <span
                style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.secondary,
                  fontWeight: theme.typography.fontWeight.medium
                }}
              >
                From: {email.from}
              </span>
            </div>
            <span
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary
              }}
            >
              {formatEmailDate(email.timestamp)}
            </span>
          </div>
          {email.tags.length > 0 && (
            <div style={{ display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
              {email.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    borderRadius: theme.borderRadius.md,
                    backgroundColor: tagColors[tag] + '20',
                    color: tagColors[tag],
                    fontWeight: theme.typography.fontWeight.medium
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div
          style={{
            height: 1,
            backgroundColor: theme.colors.neutral.gray300,
            marginBottom: theme.spacing.lg
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          fontSize: theme.typography.fontSize.base,
          lineHeight: 1.8,
          color: theme.colors.text.primary
        }}
      >
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1
                style={{
                  fontFamily: theme.typography.fontFamily.heading,
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary,
                  marginTop: theme.spacing.lg,
                  marginBottom: theme.spacing.md
                }}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                style={{
                  fontFamily: theme.typography.fontFamily.heading,
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary,
                  marginTop: theme.spacing.lg,
                  marginBottom: theme.spacing.md
                }}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                style={{
                  fontFamily: theme.typography.fontFamily.heading,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary,
                  marginTop: theme.spacing.md,
                  marginBottom: theme.spacing.sm
                }}
              >
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p
                style={{
                  marginBottom: theme.spacing.md,
                  marginTop: 0
                }}
              >
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul
                style={{
                  marginBottom: theme.spacing.md,
                  paddingLeft: theme.spacing.xl,
                  marginTop: 0
                }}
              >
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol
                style={{
                  marginBottom: theme.spacing.md,
                  paddingLeft: theme.spacing.xl,
                  marginTop: 0
                }}
              >
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li
                style={{
                  marginBottom: theme.spacing.xs
                }}
              >
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong
                style={{
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary
                }}
              >
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em
                style={{
                  fontStyle: 'italic'
                }}
              >
                {children}
              </em>
            ),
            hr: () => (
              <hr
                style={{
                  border: 'none',
                  borderTop: `1px solid ${theme.colors.neutral.gray300}`,
                  marginTop: theme.spacing.lg,
                  marginBottom: theme.spacing.lg
                }}
              />
            )
          }}
        >
          {email.body}
        </ReactMarkdown>
      </div>
    </GameCard>
  )
}
