/**
 * Styling System Entry Point
 *
 * This module exports all styling utilities, components, and helpers
 * for use throughout the application.
 *
 * Usage:
 * ```tsx
 * import { StyledButton, StyledCard, StyledHeading } from '@/styles'
 * import { hoverGlow, transition } from '@/styles/utils'
 *
 * function MyComponent() {
 *   return (
 *     <StyledCard glow>
 *       <StyledHeading size="h2">Title</StyledHeading>
 *       <StyledButton variant="primary">Click me</StyledButton>
 *     </StyledCard>
 *   )
 * }
 * ```
 */

// Styled Components
export * from './styled'

// Style Utilities
export * from './utils'

// Hooks
export * from './hooks/useStyles'

// Global Styles
export { GlobalStyles } from './GlobalStyles'

// Re-export theme for convenience
export { theme } from '../theme/theme'
export type { Theme } from '../theme/theme'
