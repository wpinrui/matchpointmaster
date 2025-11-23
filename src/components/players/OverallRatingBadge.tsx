import React from 'react'
import { getCardTierStyle } from '../../utils/cardTiers'
import { StyledRatingBadge, StyledRatingBadgeText } from '../../styles'

interface OverallRatingBadgeProps {
  overall: number
  tierStyle: ReturnType<typeof getCardTierStyle>
}

export const OverallRatingBadge: React.FC<OverallRatingBadgeProps> = ({
  overall,
  tierStyle
}) => {
  return (
    <StyledRatingBadge
      bgColor={tierStyle.overallBg}
      borderColor={tierStyle.borderColor}
      textColor={tierStyle.overallText}
    >
      <StyledRatingBadgeText textColor={tierStyle.overallText}>
        {overall}
      </StyledRatingBadgeText>
    </StyledRatingBadge>
  )
}
