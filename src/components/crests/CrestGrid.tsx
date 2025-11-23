import React from 'react'
import { theme } from '../../theme/theme'
import { StyledGrid } from '../../styles'
import styled from '@emotion/styled'

interface CrestGridProps {
  crestOptions: string[]
  selectedCrestUrl: string
  onCrestSelect: (crestUrl: string) => void
}

interface CrestItemProps {
  selected: boolean
}

const CrestItem = styled.div<CrestItemProps>`
  cursor: pointer;
  border-radius: ${theme.borderRadius.md};
  border: 3px solid
    ${({ selected }) =>
      selected ? theme.colors.primary.main : theme.colors.neutral.gray300};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.neutral.white};
  transition: all ${theme.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ selected }) => (selected ? theme.shadows.lg : 'none')};

  &:hover {
    border-color: ${({ selected }) =>
      selected ? theme.colors.primary.main : theme.colors.primary.light};
    box-shadow: ${({ selected }) => (selected ? theme.shadows.lg : theme.shadows.md)};
  }

  img {
    width: 100%;
    height: auto;
    border-radius: ${theme.borderRadius.sm};
    display: block;
  }
`

export const CrestGrid: React.FC<CrestGridProps> = ({
  crestOptions,
  selectedCrestUrl,
  onCrestSelect
}) => {
  return (
    <StyledGrid columns={3} gap="lg" style={{ width: '100%', maxWidth: '600px' }}>
      {crestOptions.map((crestUrl, index) => {
        const isSelected = crestUrl === selectedCrestUrl
        return (
          <CrestItem
            key={index}
            onClick={() => onCrestSelect(crestUrl)}
            selected={isSelected}
          >
            <img src={crestUrl} alt={`Crest option ${index + 1}`} />
          </CrestItem>
        )
      })}
    </StyledGrid>
  )
}
