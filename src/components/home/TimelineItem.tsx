import React from 'react'
import { theme } from '../../theme/theme'

interface TimelineItemProps {
  month: number
  label: string
  currentMonth: number
  completed?: boolean
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  month,
  label,
  currentMonth,
  completed = false
}) => {
  const isCurrent = month === currentMonth
  const isPast = month < currentMonth || completed

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        background: isCurrent
          ? theme.colors.primary.light + '20'
          : isPast
            ? theme.colors.neutral.gray100
            : 'transparent',
        border: isCurrent ? `2px solid ${theme.colors.primary.main}` : 'none'
      }}
    >
      <div
        style={{
          minWidth: '80px',
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold,
          color: isCurrent
            ? theme.colors.primary.main
            : isPast
              ? theme.colors.text.secondary
              : theme.colors.text.primary
        }}
      >
        Month {month}
      </div>
      <div
        style={{
          flex: 1,
          fontSize: theme.typography.fontSize.base,
          color: isCurrent
            ? theme.colors.text.primary
            : isPast
              ? theme.colors.text.secondary
              : theme.colors.text.primary,
          textDecoration: isPast && !isCurrent ? 'line-through' : 'none',
          opacity: isPast && !isCurrent ? 0.6 : 1
        }}
      >
        {label}
      </div>
      {isCurrent && (
        <span
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.primary.main,
            fontWeight: theme.typography.fontWeight.bold
          }}
        >
          Current
        </span>
      )}
      {completed && month === currentMonth && (
        <span
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.success.main,
            fontWeight: theme.typography.fontWeight.bold
          }}
        >
          ✓ Completed
        </span>
      )}
    </div>
  )
}
