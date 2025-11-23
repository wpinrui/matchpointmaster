import React from 'react'
import { theme } from '../../theme/theme'
import { StyledLabel } from '../../styles'
import styled from '@emotion/styled'

interface ShapePickerProps {
  label: string
  shapes: string[]
  selectedShape: string
  onSelectShape: (shape: string) => void
}

const ShapeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: ${theme.spacing.sm};
  width: 100%;
`

interface ShapeButtonProps {
  selected: boolean
}

const ShapeButton = styled.button<ShapeButtonProps>`
  padding: ${theme.spacing.md};
  border: 2px solid
    ${({ selected }) =>
      selected ? theme.colors.primary.main : theme.colors.neutral.gray300};
  border-radius: ${theme.borderRadius.md};
  background: ${({ selected }) =>
    selected ? theme.colors.primary.light + '20' : theme.colors.neutral.white};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${({ selected }) =>
    selected ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  text-transform: capitalize;
  box-shadow: ${({ selected }) => (selected ? theme.shadows.md : 'none')};
  font-family: ${theme.typography.fontFamily.primary};

  &:hover {
    border-color: ${({ selected }) =>
      selected ? theme.colors.primary.main : theme.colors.primary.light};
    box-shadow: ${({ selected }) => (selected ? theme.shadows.md : theme.shadows.sm)};
  }
`

export const ShapePicker: React.FC<ShapePickerProps> = ({
  label,
  shapes,
  selectedShape,
  onSelectShape
}) => {
  return (
    <div style={{ marginBottom: theme.spacing.lg }}>
      <StyledLabel>{label}</StyledLabel>
      <ShapeGrid>
        {shapes.map((shape) => {
          const isSelected = shape === selectedShape
          return (
            <ShapeButton
              key={shape}
              type="button"
              onClick={() => onSelectShape(shape)}
              selected={isSelected}
            >
              {shape}
            </ShapeButton>
          )
        })}
      </ShapeGrid>
    </div>
  )
}
