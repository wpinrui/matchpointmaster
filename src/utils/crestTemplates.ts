/**
 * High-quality SVG templates for crest shapes
 * These templates use placeholders that will be replaced with actual colors
 * Designed to look professional and suitable for school crests
 */

export const OUTSIDE_SHAPE_TEMPLATES: Record<string, string> = {
  circle: `
    <circle cx="100" cy="100" r="88" fill="#PRIMARY" stroke="#000000" stroke-width="4"/>
    <circle cx="100" cy="100" r="78" fill="none" stroke="#SECONDARY" stroke-width="3"/>
    <circle cx="100" cy="100" r="68" fill="none" stroke="#000000" stroke-width="1" opacity="0.3"/>
  `,
  shield: `
    <!-- Classic heraldic shield shape -->
    <path d="M 100 15 L 175 45 L 185 100 L 175 155 L 100 185 L 25 155 L 15 100 L 25 45 Z" 
          fill="#PRIMARY" stroke="#000000" stroke-width="4"/>
    <!-- Inner border -->
    <path d="M 100 25 L 165 50 L 173 100 L 165 150 L 100 175 L 35 150 L 27 100 L 35 50 Z" 
          fill="none" stroke="#SECONDARY" stroke-width="3"/>
    <!-- Decorative corner elements -->
    <path d="M 100 15 L 110 30 L 100 40 L 90 30 Z" fill="#SECONDARY" stroke="#000000" stroke-width="1.5"/>
  `,
  wreath: `
    <!-- Circular base -->
    <circle cx="100" cy="100" r="88" fill="#PRIMARY" stroke="#000000" stroke-width="4"/>
    <circle cx="100" cy="100" r="78" fill="none" stroke="#SECONDARY" stroke-width="3"/>
    <!-- Decorative leaves around the circle -->
    <ellipse cx="100" cy="15" rx="12" ry="18" fill="#SECONDARY" stroke="#000000" stroke-width="1.5" transform="rotate(0 100 15)"/>
    <ellipse cx="185" cy="100" rx="12" ry="18" fill="#SECONDARY" stroke="#000000" stroke-width="1.5" transform="rotate(90 185 100)"/>
    <ellipse cx="100" cy="185" rx="12" ry="18" fill="#SECONDARY" stroke="#000000" stroke-width="1.5" transform="rotate(180 100 185)"/>
    <ellipse cx="15" cy="100" rx="12" ry="18" fill="#SECONDARY" stroke="#000000" stroke-width="1.5" transform="rotate(270 15 100)"/>
    <!-- Additional smaller leaves -->
    <ellipse cx="140" cy="50" rx="8" ry="12" fill="#SECONDARY" stroke="#000000" stroke-width="1" transform="rotate(45 140 50)"/>
    <ellipse cx="60" cy="50" rx="8" ry="12" fill="#SECONDARY" stroke="#000000" stroke-width="1" transform="rotate(-45 60 50)"/>
    <ellipse cx="140" cy="150" rx="8" ry="12" fill="#SECONDARY" stroke="#000000" stroke-width="1" transform="rotate(-45 140 150)"/>
    <ellipse cx="60" cy="150" rx="8" ry="12" fill="#SECONDARY" stroke="#000000" stroke-width="1" transform="rotate(45 60 150)"/>
  `,
  square: `
    <!-- Rounded square with decorative corners -->
    <rect x="20" y="20" width="160" height="160" rx="20" fill="#PRIMARY" stroke="#000000" stroke-width="4"/>
    <rect x="30" y="30" width="140" height="140" rx="15" fill="none" stroke="#SECONDARY" stroke-width="3"/>
    <!-- Corner decorations -->
    <circle cx="40" cy="40" r="8" fill="#SECONDARY" stroke="#000000" stroke-width="1.5"/>
    <circle cx="160" cy="40" r="8" fill="#SECONDARY" stroke="#000000" stroke-width="1.5"/>
    <circle cx="40" cy="160" r="8" fill="#SECONDARY" stroke="#000000" stroke-width="1.5"/>
    <circle cx="160" cy="160" r="8" fill="#SECONDARY" stroke="#000000" stroke-width="1.5"/>
  `,
  diamond: `
    <!-- Diamond shape -->
    <path d="M 100 12 L 188 100 L 100 188 L 12 100 Z" fill="#PRIMARY" stroke="#000000" stroke-width="4"/>
    <path d="M 100 25 L 175 100 L 100 175 L 25 100 Z" fill="none" stroke="#SECONDARY" stroke-width="3"/>
    <!-- Center accent -->
    <circle cx="100" cy="100" r="15" fill="#SECONDARY" stroke="#000000" stroke-width="2"/>
  `,
  hexagon: `
    <!-- Hexagonal shape -->
    <path d="M 100 10 L 170 40 L 190 100 L 170 160 L 100 190 L 30 160 L 10 100 L 30 40 Z" 
          fill="#PRIMARY" stroke="#000000" stroke-width="4"/>
    <path d="M 100 25 L 160 50 L 175 100 L 160 150 L 100 175 L 40 150 L 25 100 L 40 50 Z" 
          fill="none" stroke="#SECONDARY" stroke-width="3"/>
  `,
  oval: `
    <!-- Oval/ellipse shape -->
    <ellipse cx="100" cy="100" rx="88" ry="70" fill="#PRIMARY" stroke="#000000" stroke-width="4"/>
    <ellipse cx="100" cy="100" rx="78" ry="60" fill="none" stroke="#SECONDARY" stroke-width="3"/>
    <!-- Decorative horizontal lines -->
    <line x1="30" y1="100" x2="170" y2="100" stroke="#SECONDARY" stroke-width="2" opacity="0.5"/>
  `,
  star: `
    <!-- 5-pointed star -->
    <path d="M 100 10 L 125 75 L 190 75 L 140 115 L 160 180 L 100 145 L 40 180 L 60 115 L 10 75 L 75 75 Z" 
          fill="#PRIMARY" stroke="#000000" stroke-width="4"/>
    <path d="M 100 20 L 120 70 L 180 70 L 135 105 L 152 165 L 100 135 L 48 165 L 65 105 L 20 70 L 80 70 Z" 
          fill="none" stroke="#SECONDARY" stroke-width="3"/>
  `
}

export const INSIDE_SHAPE_TEMPLATES: Record<string, string> = {
  torch: `
    <!-- Flame -->
    <path d="M 100 55 Q 80 75 85 100 Q 90 85 100 95 Q 110 85 115 100 Q 120 75 100 55 Z" 
          fill="#ACCENT" stroke="#000000" stroke-width="2"/>
    <path d="M 100 60 Q 88 75 92 95 Q 95 85 100 90 Q 105 85 108 95 Q 112 75 100 60 Z" 
          fill="#ACCENT" stroke="#000000" stroke-width="1" opacity="0.8"/>
    <!-- Torch handle -->
    <rect x="96" y="95" width="8" height="55" fill="#SECONDARY" stroke="#000000" stroke-width="2" rx="2"/>
    <!-- Torch base -->
    <ellipse cx="100" cy="155" rx="12" ry="8" fill="#SECONDARY" stroke="#000000" stroke-width="2"/>
    <!-- Handle grip lines -->
    <line x1="100" y1="110" x2="100" y2="110" stroke="#000000" stroke-width="1" opacity="0.3"/>
    <line x1="100" y1="125" x2="100" y2="125" stroke="#000000" stroke-width="1" opacity="0.3"/>
    <line x1="100" y1="140" x2="100" y2="140" stroke="#000000" stroke-width="1" opacity="0.3"/>
  `,
  book: `
    <!-- Open book with pages -->
    <rect x="50" y="75" width="50" height="70" fill="#SECONDARY" stroke="#000000" stroke-width="2" rx="2"/>
    <rect x="100" y="75" width="50" height="70" fill="#ACCENT" stroke="#000000" stroke-width="2" rx="2"/>
    <!-- Book spine -->
    <rect x="95" y="75" width="10" height="70" fill="#SECONDARY" stroke="#000000" stroke-width="2"/>
    <!-- Book binding -->
    <line x1="100" y1="75" x2="100" y2="145" stroke="#000000" stroke-width="2"/>
    <!-- Text lines on left page -->
    <line x1="60" y1="90" x2="90" y2="90" stroke="#000000" stroke-width="1.5"/>
    <line x1="60" y1="100" x2="90" y2="100" stroke="#000000" stroke-width="1.5"/>
    <line x1="60" y1="110" x2="90" y2="110" stroke="#000000" stroke-width="1.5"/>
    <line x1="60" y1="120" x2="85" y2="120" stroke="#000000" stroke-width="1.5"/>
    <!-- Text lines on right page -->
    <line x1="110" y1="90" x2="140" y2="90" stroke="#000000" stroke-width="1.5"/>
    <line x1="110" y1="100" x2="140" y2="100" stroke="#000000" stroke-width="1.5"/>
    <line x1="110" y1="110" x2="140" y2="110" stroke="#000000" stroke-width="1.5"/>
    <line x1="110" y1="120" x2="135" y2="120" stroke="#000000" stroke-width="1.5"/>
  `,
  star: `
    <!-- 5-pointed star -->
    <path d="M 100 70 L 112 100 L 142 100 L 118 118 L 130 148 L 100 130 L 70 148 L 82 118 L 58 100 L 88 100 Z" 
          fill="#ACCENT" stroke="#000000" stroke-width="2"/>
    <!-- Inner star highlight -->
    <circle cx="100" cy="110" r="8" fill="#ACCENT" stroke="#000000" stroke-width="1" opacity="0.6"/>
  `,
  cross: `
    <!-- Christian cross -->
    <rect x="88" y="60" width="24" height="80" fill="#SECONDARY" stroke="#000000" stroke-width="2" rx="2"/>
    <rect x="70" y="88" width="60" height="24" fill="#SECONDARY" stroke="#000000" stroke-width="2" rx="2"/>
    <!-- Cross center accent -->
    <circle cx="100" cy="100" r="8" fill="#ACCENT" stroke="#000000" stroke-width="1.5"/>
  `,
  laurel: `
    <!-- Laurel wreath -->
    <ellipse cx="100" cy="100" rx="60" ry="50" fill="none" stroke="#SECONDARY" stroke-width="4"/>
    <ellipse cx="100" cy="100" rx="55" ry="45" fill="none" stroke="#ACCENT" stroke-width="2"/>
    <!-- Large leaves at cardinal points -->
    <ellipse cx="70" cy="75" rx="12" ry="18" fill="#SECONDARY" stroke="#000000" stroke-width="2" transform="rotate(-30 70 75)"/>
    <ellipse cx="130" cy="75" rx="12" ry="18" fill="#SECONDARY" stroke="#000000" stroke-width="2" transform="rotate(30 130 75)"/>
    <ellipse cx="70" cy="125" rx="12" ry="18" fill="#SECONDARY" stroke="#000000" stroke-width="2" transform="rotate(30 70 125)"/>
    <ellipse cx="130" cy="125" rx="12" ry="18" fill="#SECONDARY" stroke="#000000" stroke-width="2" transform="rotate(-30 130 125)"/>
    <!-- Smaller leaves -->
    <ellipse cx="85" cy="60" rx="8" ry="12" fill="#SECONDARY" stroke="#000000" stroke-width="1.5" transform="rotate(-15 85 60)"/>
    <ellipse cx="115" cy="60" rx="8" ry="12" fill="#SECONDARY" stroke="#000000" stroke-width="1.5" transform="rotate(15 115 60)"/>
    <ellipse cx="85" cy="140" rx="8" ry="12" fill="#SECONDARY" stroke="#000000" stroke-width="1.5" transform="rotate(15 85 140)"/>
    <ellipse cx="115" cy="140" rx="8" ry="12" fill="#SECONDARY" stroke="#000000" stroke-width="1.5" transform="rotate(-15 115 140)"/>
  `,
  crown: `
    <!-- Crown base -->
    <rect x="50" y="110" width="100" height="30" fill="#ACCENT" stroke="#000000" stroke-width="2" rx="3"/>
    <!-- Crown points/jewels -->
    <path d="M 60 110 L 65 75 L 70 110 Z" fill="#SECONDARY" stroke="#000000" stroke-width="2"/>
    <circle cx="67.5" cy="90" r="4" fill="#ACCENT" stroke="#000000" stroke-width="1"/>
    <path d="M 75 110 L 80 60 L 85 110 Z" fill="#SECONDARY" stroke="#000000" stroke-width="2"/>
    <circle cx="80" cy="80" r="5" fill="#ACCENT" stroke="#000000" stroke-width="1"/>
    <path d="M 90 110 L 95 65 L 100 110 Z" fill="#SECONDARY" stroke="#000000" stroke-width="2"/>
    <circle cx="97.5" cy="85" r="6" fill="#ACCENT" stroke="#000000" stroke-width="1.5"/>
    <path d="M 105 110 L 110 60 L 115 110 Z" fill="#SECONDARY" stroke="#000000" stroke-width="2"/>
    <circle cx="112.5" cy="80" r="5" fill="#ACCENT" stroke="#000000" stroke-width="1"/>
    <path d="M 120 110 L 125 75 L 130 110 Z" fill="#SECONDARY" stroke="#000000" stroke-width="2"/>
    <circle cx="127.5" cy="90" r="4" fill="#ACCENT" stroke="#000000" stroke-width="1"/>
  `,
  scroll: `
    <!-- Scroll body -->
    <rect x="60" y="80" width="80" height="55" rx="6" fill="#ACCENT" stroke="#000000" stroke-width="2"/>
    <!-- Scroll ends (rolled) -->
    <ellipse cx="60" cy="107.5" rx="12" ry="28" fill="#SECONDARY" stroke="#000000" stroke-width="2"/>
    <ellipse cx="140" cy="107.5" rx="12" ry="28" fill="#SECONDARY" stroke="#000000" stroke-width="2"/>
    <!-- Scroll text lines -->
    <line x1="75" y1="95" x2="125" y2="95" stroke="#000000" stroke-width="1.5"/>
    <line x1="75" y1="105" x2="125" y2="105" stroke="#000000" stroke-width="1.5"/>
    <line x1="75" y1="115" x2="125" y2="115" stroke="#000000" stroke-width="1.5"/>
    <line x1="75" y1="125" x2="120" y2="125" stroke="#000000" stroke-width="1.5"/>
    <!-- Decorative scroll curls -->
    <path d="M 60 80 Q 50 85 55 90" fill="none" stroke="#000000" stroke-width="1.5"/>
    <path d="M 60 135 Q 50 130 55 125" fill="none" stroke="#000000" stroke-width="1.5"/>
  `,
  quill: `
    <!-- Quill pen -->
    <line x1="100" y1="60" x2="100" y2="140" stroke="#SECONDARY" stroke-width="6" stroke-linecap="round"/>
    <!-- Quill tip -->
    <path d="M 100 140 L 108 135 L 104 130 Z" fill="#000000" stroke="#000000" stroke-width="1"/>
    <!-- Feather -->
    <ellipse cx="100" cy="75" rx="5" ry="30" fill="#ACCENT" stroke="#000000" stroke-width="2" transform="rotate(45 100 75)"/>
    <!-- Feather detail lines -->
    <line x1="95" y1="70" x2="105" y2="80" stroke="#000000" stroke-width="1" opacity="0.4"/>
    <line x1="95" y1="80" x2="105" y2="90" stroke="#000000" stroke-width="1" opacity="0.4"/>
  `,
  none: `
    <!-- Simple circle when no inside shape -->
    <circle cx="100" cy="100" r="40" fill="#ACCENT" stroke="#000000" stroke-width="3"/>
    <circle cx="100" cy="100" r="30" fill="none" stroke="#SECONDARY" stroke-width="2"/>
  `
}

/**
 * Replace color placeholders in SVG template
 */
export const applyColorsToTemplate = (
  template: string,
  primaryColor: string,
  secondaryColor: string,
  accentColor: string
): string => {
  const cleanPrimary = primaryColor.replace('#', '')
  const cleanSecondary = secondaryColor.replace('#', '')
  const cleanAccent = accentColor.replace('#', '')

  return template
    .replace(/#PRIMARY/g, `#${cleanPrimary}`)
    .replace(/#SECONDARY/g, `#${cleanSecondary}`)
    .replace(/#ACCENT/g, `#${cleanAccent}`)
}
