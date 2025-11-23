import React from 'react'
import { StyledToggleContainer, StyledToggleButton } from '../../styles'

interface ViewModeToggleProps {
  viewMode: 'month' | 'year'
  onViewModeChange: (mode: 'month' | 'year') => void
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <StyledToggleContainer>
      <StyledToggleButton
        active={viewMode === 'month'}
        onClick={() => onViewModeChange('month')}
      >
        Past Month
      </StyledToggleButton>
      <StyledToggleButton
        active={viewMode === 'year'}
        onClick={() => onViewModeChange('year')}
      >
        Year-to-Date
      </StyledToggleButton>
    </StyledToggleContainer>
  )
}
