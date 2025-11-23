import React from 'react'
import {
  StyledPaginationContainer,
  StyledPaginationButton,
  StyledText
} from '../../styles'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPreviousPage: () => void
  onNextPage: () => void
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage
}) => {
  if (totalPages <= 1) {
    return null
  }

  return (
    <StyledPaginationContainer>
      <StyledPaginationButton onClick={onPreviousPage} disabled={currentPage === 1}>
        Previous
      </StyledPaginationButton>
      <StyledText size="sm" color="secondary">
        Page {currentPage} of {totalPages}
      </StyledText>
      <StyledPaginationButton onClick={onNextPage} disabled={currentPage === totalPages}>
        Next
      </StyledPaginationButton>
    </StyledPaginationContainer>
  )
}
