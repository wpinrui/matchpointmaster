import React, { useState, useEffect } from 'react'
import { theme } from '../../theme/theme'
import { generateCrestSvg } from '../../utils/crestGenerator'
import {
  OUTSIDE_SHAPES,
  INSIDE_SHAPES,
  OutsideShape,
  InsideShape
} from '../../utils/crestConstants'
import { ColorPicker } from './ColorPicker'
import { ShapePicker } from './ShapePicker'
import { StyledFlex, StyledCard } from '../../styles'

interface CrestCustomizerProps {
  initialPrimaryColor?: string
  initialSecondaryColor?: string
  initialAccentColor?: string
  onCrestChange: (crestUrl: string) => void
  onColorsChange?: (primary: string, secondary: string, accent: string) => void
  storedCrestOptions?: string[]
  onCrestOptionsChange?: (crests: string[]) => void
  currentSelectedCrest?: string // Currently selected crest URL (for restoring state)
}

export const CrestCustomizer: React.FC<CrestCustomizerProps> = ({
  initialPrimaryColor = '#FF6B35',
  initialSecondaryColor = '#004E89',
  initialAccentColor = '#FFD23F',
  onCrestChange,
  onColorsChange,
  storedCrestOptions = [],
  onCrestOptionsChange,
  currentSelectedCrest
}) => {
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor)
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor)
  const [accentColor, setAccentColor] = useState(initialAccentColor)
  const [outsideShape, setOutsideShape] = useState<OutsideShape>('circle')
  const [insideShape, setInsideShape] = useState<InsideShape>('torch')
  const [selectedCrestUrl, setSelectedCrestUrl] = useState<string>('')

  // Generate crest when colors or shapes change
  useEffect(() => {
    const crestUrl = generateCrestSvg(
      primaryColor,
      secondaryColor,
      accentColor,
      outsideShape,
      insideShape
    )
    setSelectedCrestUrl(crestUrl)
    onCrestChange(crestUrl)
    onColorsChange?.(primaryColor, secondaryColor, accentColor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryColor, secondaryColor, accentColor, outsideShape, insideShape])

  // Generate initial crest on mount
  useEffect(() => {
    const crestUrl = generateCrestSvg(
      primaryColor,
      secondaryColor,
      accentColor,
      outsideShape,
      insideShape
    )
    setSelectedCrestUrl(crestUrl)
    onCrestChange(crestUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <StyledFlex direction="column" gap="xl" align="center" style={{ width: '100%' }}>
      {/* Color Pickers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: theme.spacing.lg,
          width: '100%',
          maxWidth: '900px'
        }}
      >
        <ColorPicker
          label="Primary Color"
          color={primaryColor}
          onChange={setPrimaryColor}
        />
        <ColorPicker
          label="Secondary Color"
          color={secondaryColor}
          onChange={setSecondaryColor}
        />
        <ColorPicker label="Accent Color" color={accentColor} onChange={setAccentColor} />
      </div>

      {/* Shape Pickers */}
      <StyledFlex
        direction="column"
        gap="lg"
        style={{ width: '100%', maxWidth: '900px' }}
      >
        <ShapePicker
          label="Outside Shape"
          shapes={OUTSIDE_SHAPES}
          selectedShape={outsideShape}
          onSelectShape={(shape) => setOutsideShape(shape as OutsideShape)}
        />
        <ShapePicker
          label="Inside Shape"
          shapes={INSIDE_SHAPES}
          selectedShape={insideShape}
          onSelectShape={(shape) => setInsideShape(shape as InsideShape)}
        />
      </StyledFlex>

      {/* Crest Preview */}
      <StyledCard
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: theme.spacing.xl,
          background: theme.colors.neutral.white,
          boxShadow: theme.shadows.lg,
          border: `3px solid ${theme.colors.primary.main}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {selectedCrestUrl && (
          <img
            src={selectedCrestUrl}
            alt="Crest Preview"
            style={{
              width: '200px',
              height: '200px',
              objectFit: 'contain'
            }}
          />
        )}
      </StyledCard>
    </StyledFlex>
  )
}
