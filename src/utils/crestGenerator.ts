/**
 * Generate a school crest SVG based on selected colors and shapes
 */
import {
  OutsideShape,
  InsideShape,
  OUTSIDE_SHAPES,
  INSIDE_SHAPES
} from './crestConstants'

export const generateCrestSvg = (
  primaryColor: string,
  secondaryColor: string,
  accentColor: string,
  outsideShape: OutsideShape,
  insideShape: InsideShape
): string => {
  // Remove # from colors if present for SVG
  const cleanPrimary = primaryColor.replace('#', '')
  const cleanSecondary = secondaryColor.replace('#', '')
  const cleanAccent = accentColor.replace('#', '')

  // Generate outside shape path
  const outsidePath = getOutsideShapePath(outsideShape)

  // Generate inside shape SVG
  const insideSvg = getInsideShapeSvg(
    insideShape,
    cleanPrimary,
    cleanSecondary,
    cleanAccent
  )

  const svg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <!-- Outside shape -->
      <path d="${outsidePath}" 
            fill="#${cleanPrimary}" 
            stroke="#000000" 
            stroke-width="4"/>
      
      <!-- Secondary color band (inner border) -->
      <path d="${getInnerPath(outsideShape)}" 
            fill="none" 
            stroke="#${cleanSecondary}" 
            stroke-width="3"/>
      
      <!-- Inside shape -->
      ${insideSvg}
    </svg>
  `.trim()

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Get the path for the outside shape
 */
function getOutsideShapePath(shape: OutsideShape): string {
  switch (shape) {
    case 'circle':
      return 'M 100 20 A 80 80 0 0 1 180 100 A 80 80 0 0 1 100 180 A 80 80 0 0 1 20 100 A 80 80 0 0 1 100 20 Z'
    case 'shield':
      return 'M 100 20 L 160 40 L 180 100 L 160 160 L 100 180 L 40 160 L 20 100 L 40 40 Z'
    case 'wreath':
      // Simplified wreath - circular with decorative elements
      return 'M 100 20 A 80 80 0 0 1 180 100 A 80 80 0 0 1 100 180 A 80 80 0 0 1 20 100 A 80 80 0 0 1 100 20 Z'
    case 'square':
      return 'M 30 30 L 170 30 L 170 170 L 30 170 Z'
    case 'diamond':
      return 'M 100 20 L 180 100 L 100 180 L 20 100 Z'
    case 'hexagon':
      return 'M 100 20 L 160 45 L 180 100 L 160 155 L 100 180 L 40 155 L 20 100 L 40 45 Z'
    case 'oval':
      return 'M 100 30 A 70 90 0 0 1 170 100 A 70 90 0 0 1 100 170 A 70 90 0 0 1 30 100 A 70 90 0 0 1 100 30 Z'
    case 'star': {
      // 5-pointed star
      const points: string[] = []
      const centerX = 100
      const centerY = 100
      const outerRadius = 80
      const innerRadius = 35
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        points.push(`${x},${y}`)
      }
      return `M ${points[0]} ${points.map((p, i) => (i === 0 ? '' : 'L ') + p).join(' ')} Z`
    }
    default:
      return 'M 100 20 A 80 80 0 0 1 180 100 A 80 80 0 0 1 100 180 A 80 80 0 0 1 20 100 A 80 80 0 0 1 100 20 Z'
  }
}

/**
 * Get the inner path for secondary color border
 */
function getInnerPath(shape: OutsideShape): string {
  switch (shape) {
    case 'circle':
      return 'M 100 30 A 70 70 0 0 1 170 100 A 70 70 0 0 1 100 170 A 70 70 0 0 1 30 100 A 70 70 0 0 1 100 30'
    case 'shield':
      return 'M 100 30 L 150 47 L 167 100 L 150 153 L 100 170 L 50 153 L 33 100 L 50 47 Z'
    case 'wreath':
      return 'M 100 30 A 70 70 0 0 1 170 100 A 70 70 0 0 1 100 170 A 70 70 0 0 1 30 100 A 70 70 0 0 1 100 30'
    case 'square':
      return 'M 40 40 L 160 40 L 160 160 L 40 160 Z'
    case 'diamond':
      return 'M 100 35 L 165 100 L 100 165 L 35 100 Z'
    case 'hexagon':
      return 'M 100 35 L 150 55 L 165 100 L 150 145 L 100 165 L 50 145 L 35 100 L 50 55 Z'
    case 'oval':
      return 'M 100 40 A 60 80 0 0 1 160 100 A 60 80 0 0 1 100 160 A 60 80 0 0 1 40 100 A 60 80 0 0 1 100 40'
    case 'star': {
      // Inner path for star (smaller star)
      const points: string[] = []
      const centerX = 100
      const centerY = 100
      const outerRadius = 70
      const innerRadius = 30
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        points.push(`${x},${y}`)
      }
      return `M ${points[0]} ${points.map((p, i) => (i === 0 ? '' : 'L ') + p).join(' ')}`
    }
    default:
      return 'M 100 30 A 70 70 0 0 1 170 100 A 70 70 0 0 1 100 170 A 70 70 0 0 1 30 100 A 70 70 0 0 1 100 30'
  }
}

/**
 * Get the SVG for the inside shape
 */
function getInsideShapeSvg(
  shape: InsideShape,
  primary: string,
  secondary: string,
  accent: string
): string {
  const centerX = 100
  const centerY = 100

  switch (shape) {
    case 'torch':
      // Torch with flame
      return `
        <!-- Torch handle -->
        <rect x="95" y="120" width="10" height="40" fill="#${secondary}" stroke="#000000" stroke-width="2"/>
        <!-- Torch base -->
        <ellipse cx="100" cy="165" rx="8" ry="5" fill="#${secondary}" stroke="#000000" stroke-width="2"/>
        <!-- Flame -->
        <path d="M 100 80 Q 85 100 90 120 Q 95 110 100 120 Q 105 110 110 120 Q 115 100 100 80 Z" 
              fill="#${accent}" stroke="#000000" stroke-width="2"/>
      `
    case 'book':
      // Open book
      return `
        <!-- Book left page -->
        <rect x="60" y="85" width="40" height="50" fill="#${secondary}" stroke="#000000" stroke-width="2"/>
        <!-- Book right page -->
        <rect x="100" y="85" width="40" height="50" fill="#${accent}" stroke="#000000" stroke-width="2"/>
        <!-- Book spine -->
        <rect x="95" y="85" width="10" height="50" fill="#${secondary}" stroke="#000000" stroke-width="2"/>
        <!-- Book lines -->
        <line x1="70" y1="100" x2="95" y2="100" stroke="#000000" stroke-width="1"/>
        <line x1="70" y1="110" x2="95" y2="110" stroke="#000000" stroke-width="1"/>
        <line x1="105" y1="100" x2="135" y2="100" stroke="#000000" stroke-width="1"/>
        <line x1="105" y1="110" x2="135" y2="110" stroke="#000000" stroke-width="1"/>
      `
    case 'star': {
      // 5-pointed star
      const starPoints: string[] = []
      const starOuterRadius = 35
      const starInnerRadius = 15
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const radius = i % 2 === 0 ? starOuterRadius : starInnerRadius
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        starPoints.push(`${x},${y}`)
      }
      return `<polygon points="${starPoints.join(' ')}" fill="#${accent}" stroke="#000000" stroke-width="2"/>`
    }
    case 'cross':
      // Cross
      return `
        <rect x="85" y="70" width="30" height="60" fill="#${secondary}" stroke="#000000" stroke-width="2"/>
        <rect x="70" y="85" width="60" height="30" fill="#${secondary}" stroke="#000000" stroke-width="2"/>
      `
    case 'laurel':
      // Laurel wreath
      return `
        <ellipse cx="100" cy="100" rx="50" ry="40" fill="none" stroke="#${secondary}" stroke-width="3"/>
        <ellipse cx="100" cy="100" rx="45" ry="35" fill="none" stroke="#${accent}" stroke-width="2"/>
        <!-- Leaves -->
        <ellipse cx="80" cy="85" rx="8" ry="12" fill="#${secondary}" stroke="#000000" stroke-width="1" transform="rotate(-30 80 85)"/>
        <ellipse cx="120" cy="85" rx="8" ry="12" fill="#${secondary}" stroke="#000000" stroke-width="1" transform="rotate(30 120 85)"/>
        <ellipse cx="80" cy="115" rx="8" ry="12" fill="#${secondary}" stroke="#000000" stroke-width="1" transform="rotate(30 80 115)"/>
        <ellipse cx="120" cy="115" rx="8" ry="12" fill="#${secondary}" stroke="#000000" stroke-width="1" transform="rotate(-30 120 115)"/>
      `
    case 'crown':
      // Crown
      return `
        <!-- Crown base -->
        <rect x="60" y="110" width="80" height="20" fill="#${accent}" stroke="#000000" stroke-width="2"/>
        <!-- Crown points -->
        <path d="M 70 110 L 75 80 L 80 110 Z" fill="#${secondary}" stroke="#000000" stroke-width="2"/>
        <path d="M 85 110 L 90 70 L 95 110 Z" fill="#${secondary}" stroke="#000000" stroke-width="2"/>
        <path d="M 100 110 L 105 75 L 110 110 Z" fill="#${secondary}" stroke="#000000" stroke-width="2"/>
        <path d="M 115 110 L 120 70 L 125 110 Z" fill="#${secondary}" stroke="#000000" stroke-width="2"/>
        <path d="M 130 110 L 135 80 L 140 110 Z" fill="#${secondary}" stroke="#000000" stroke-width="2"/>
      `
    case 'scroll':
      // Scroll
      return `
        <!-- Scroll body -->
        <rect x="70" y="90" width="60" height="40" rx="5" fill="#${accent}" stroke="#000000" stroke-width="2"/>
        <!-- Scroll ends -->
        <ellipse cx="70" cy="110" rx="8" ry="20" fill="#${secondary}" stroke="#000000" stroke-width="2"/>
        <ellipse cx="130" cy="110" rx="8" ry="20" fill="#${secondary}" stroke="#000000" stroke-width="2"/>
        <!-- Scroll lines -->
        <line x1="80" y1="105" x2="120" y2="105" stroke="#000000" stroke-width="1"/>
        <line x1="80" y1="115" x2="120" y2="115" stroke="#000000" stroke-width="1"/>
      `
    case 'quill':
      // Quill pen
      return `
        <!-- Quill shaft -->
        <line x1="100" y1="70" x2="100" y2="130" stroke="#${secondary}" stroke-width="4" stroke-linecap="round"/>
        <!-- Quill tip -->
        <path d="M 100 130 L 110 125 L 105 120 Z" fill="#000000" stroke="#000000" stroke-width="1"/>
        <!-- Feather -->
        <ellipse cx="100" cy="85" rx="3" ry="20" fill="#${accent}" stroke="#000000" stroke-width="1" transform="rotate(45 100 85)"/>
      `
    case 'none':
    default:
      // Center circle with accent
      return `<circle cx="${centerX}" cy="${centerY}" r="30" fill="#${accent}" stroke="#000000" stroke-width="2"/>`
  }
}

/**
 * Generate all crest combinations
 */
export const generateCrestVariations = (
  primaryColor: string,
  secondaryColor: string,
  accentColor: string
): string[] => {
  const variations: string[] = []

  // Generate a selection of combinations (not all, to keep it manageable)
  const combinations = [
    { outside: 'circle' as OutsideShape, inside: 'torch' as InsideShape },
    { outside: 'shield' as OutsideShape, inside: 'book' as InsideShape },
    { outside: 'wreath' as OutsideShape, inside: 'star' as InsideShape },
    { outside: 'square' as OutsideShape, inside: 'cross' as InsideShape },
    { outside: 'diamond' as OutsideShape, inside: 'laurel' as InsideShape },
    { outside: 'hexagon' as OutsideShape, inside: 'crown' as InsideShape },
    { outside: 'oval' as OutsideShape, inside: 'scroll' as InsideShape },
    { outside: 'star' as OutsideShape, inside: 'quill' as InsideShape }
  ]

  for (const combo of combinations) {
    variations.push(
      generateCrestSvg(
        primaryColor,
        secondaryColor,
        accentColor,
        combo.outside,
        combo.inside
      )
    )
  }

  return variations
}
