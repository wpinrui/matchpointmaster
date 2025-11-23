import React from 'react'
import { theme } from '../../theme/theme'
import { getCardTierStyle } from '../../utils/cardTiers'

interface OverallRatingBadgeProps {
  overall: number
  tierStyle: ReturnType<typeof getCardTierStyle>
}

export const OverallRatingBadge: React.FC<OverallRatingBadgeProps> = ({
  overall,
  tierStyle
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: theme.spacing.sm,
        left: theme.spacing.sm,
        width: '50px',
        height: '50px',
        background: tierStyle.overallBg,
        borderRadius: theme.borderRadius.md,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        border: `2px solid ${tierStyle.borderColor}`,
        boxShadow: `0 2px 8px rgba(0, 0, 0, 0.5)`
      }}
    >
      <span
        style={{
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.extrabold,
          color: tierStyle.overallText,
          fontFamily: theme.typography.fontFamily.heading,
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        }}
      >
        {overall}
      </span>
    </div>
  )
}
