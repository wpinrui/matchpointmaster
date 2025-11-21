/**
 * Generate a school crest SVG based on selected colors and shapes
 * Uses high-quality SVG templates instead of generated paths
 */
import {
  OutsideShape,
  InsideShape,
  OUTSIDE_SHAPES,
  INSIDE_SHAPES
} from './crestConstants'
import {
  OUTSIDE_SHAPE_TEMPLATES,
  INSIDE_SHAPE_TEMPLATES,
  applyColorsToTemplate
} from './crestTemplates'

export const generateCrestSvg = (
  primaryColor: string,
  secondaryColor: string,
  accentColor: string,
  outsideShape: OutsideShape,
  insideShape: InsideShape
): string => {
  // Get templates for outside and inside shapes
  const outsideTemplate =
    OUTSIDE_SHAPE_TEMPLATES[outsideShape] ||
    OUTSIDE_SHAPE_TEMPLATES.circle
  const insideTemplate =
    INSIDE_SHAPE_TEMPLATES[insideShape] || INSIDE_SHAPE_TEMPLATES.none

  // Apply colors to templates
  const outsideSvg = applyColorsToTemplate(
    outsideTemplate,
    primaryColor,
    secondaryColor,
    accentColor
  )
  const insideSvg = applyColorsToTemplate(
    insideTemplate,
    primaryColor,
    secondaryColor,
    accentColor
  )

  const svg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      ${outsideSvg}
      ${insideSvg}
    </svg>
  `.trim()

  return `data:image/svg+xml;base64,${btoa(svg)}`
}
