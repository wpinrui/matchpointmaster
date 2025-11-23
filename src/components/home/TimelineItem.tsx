import React from 'react'
import { theme } from '../../theme/theme'
import { StyledFlex, StyledText } from '../../styles'

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
    <StyledFlex
      align="center"
      gap="md"
      style={{
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        background: isCurrent
          ? theme.colors.primary.light + '20'
          : isPast
            ? theme.colors.background.nested + '40'
            : 'transparent',
        border: isCurrent
          ? `${theme.borderWidth.default} solid ${theme.colors.primary.main}`
          : 'none'
      }}
    >
      <StyledText
        size="sm"
        weight="semibold"
        style={{
          minWidth: '80px',
          color: isCurrent
            ? theme.colors.primary.main
            : isPast
              ? theme.colors.text.secondary
              : theme.colors.text.primary
        }}
      >
        Month {month}
      </StyledText>
      <StyledText
        size="base"
        style={{
          flex: 1,
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
      </StyledText>
      {isCurrent && (
        <StyledText size="sm" weight="bold" style={{ color: theme.colors.primary.main }}>
          Current
        </StyledText>
      )}
      {completed && month === currentMonth && (
        <StyledText size="sm" weight="bold" style={{ color: theme.colors.success.main }}>
          ✓ Completed
        </StyledText>
      )}
    </StyledFlex>
  )
}
