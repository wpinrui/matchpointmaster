/**
 * Custom markdown components for email rendering
 */

import React from 'react'
import { Components } from 'react-markdown'
import { theme } from '../../theme/theme'

export const emailMarkdownComponents: Components = {
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
}
