# Styling Guide

This document outlines the standardized styling system for the MatchPoint Master codebase.

## Overview

The styling system uses **Emotion** (CSS-in-JS) for component styling, providing:
- Type-safe styling with TypeScript
- Theme-based design system
- Consistent patterns across components
- Easy maintenance and updates
- Better performance with CSS-in-JS

## Architecture

```
src/styles/
├── styled/          # Styled components (Button, Card, Input, etc.)
├── utils/           # Style utility functions
├── hooks/           # React hooks for styling
├── GlobalStyles.tsx # Global CSS styles
└── index.ts         # Main export file
```

## Usage

### Basic Styled Components

```tsx
import { StyledButton, StyledCard, StyledHeading, StyledText } from '../styles'

function MyComponent() {
  return (
    <StyledCard glow>
      <StyledHeading size="h2">Title</StyledHeading>
      <StyledText color="secondary">Description</StyledText>
      <StyledButton variant="primary" size="md">
        Click me
      </StyledButton>
    </StyledCard>
  )
}
```

### Using Style Utilities

```tsx
import { css } from '@emotion/react'
import { hoverGlow, transition, cardStyle } from '../styles/utils'

const customCard = css`
  ${cardStyle()}
  ${hoverGlow()}
  ${transition('normal')}
  /* Additional custom styles */
`
```

### Using Hooks

```tsx
import { useTheme, useDynamicStyles } from '../styles'

function MyComponent({ variant }: { variant: 'primary' | 'secondary' }) {
  const theme = useTheme()
  const dynamicStyles = useDynamicStyles(
    (props) => ({
      background: props.variant === 'primary' 
        ? theme.colors.primary.main 
        : theme.colors.secondary.main
    }),
    { variant }
  )

  return <div css={dynamicStyles}>Content</div>
}
```

## Available Styled Components

### Layout Components

- `StyledContainer` - Main container with centered content
- `StyledOverlay` - Overlay with blur effect
- `StyledFlex` - Flexbox container with props for direction, align, justify, gap
- `StyledGrid` - Grid container with configurable columns and gap
- `StyledSpacer` - Spacing utility component
- `StyledDivider` - Horizontal divider line

### Typography Components

- `StyledHeading` - Heading with size, color, and alignment props
- `StyledText` - Text component with size, color, weight, and alignment props

### Form Components

- `StyledInput` - Input field with error state support
- `StyledLabel` - Form label
- `StyledErrorText` - Error message text
- `StyledHelperText` - Helper/description text

### UI Components

- `StyledButton` - Button with variant, size, and glow props
- `StyledCard` - Card container with nested and glow props
- `StyledBadge` - Badge component with variant support

## Style Utilities

### Animation Utilities

- `fadeIn(duration?)` - Fade in animation
- `slideIn(direction?, duration?)` - Slide in animation
- `pulse(duration?)` - Pulse animation
- `glowAnimation(color1, color2, duration?)` - Glow border animation

### Effect Utilities

- `hoverBorder(color)` - Border color change on hover
- `focusBorder(color?)` - Border color change on focus
- `hoverGlow(color?)` - Glow effect on hover
- `glassmorphism(opacity?)` - Glassmorphism effect
- `transition(duration?)` - Smooth transition

### Component Style Utilities

- `cardStyle(nested?)` - Card styling
- `buttonStyle(variant?, size?)` - Button styling
- `inputStyle(error?)` - Input styling

### Layout Utilities

- `spacing` - Padding and margin utilities (p, pt, pr, pb, pl, px, py, m, mt, mr, mb, ml, mx, my)
- `breakpoint` - Responsive breakpoints (sm, md, lg, xl)
- `typography` - Typography utilities (heading, text)

## Migration from Inline Styles

### Before (Inline Styles)

```tsx
<div
  style={{
    background: theme.gradients.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`
  }}
>
  <h3
    style={{
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg
    }}
  >
    Title
  </h3>
</div>
```

### After (Styled Components)

```tsx
<StyledCard>
  <StyledHeading size="h3">Title</StyledHeading>
</StyledCard>
```

### After (CSS-in-JS with Utilities)

```tsx
import { css } from '@emotion/react'
import { cardStyle } from '@/styles/utils'

const card = css`
  ${cardStyle()}
`

<div css={card}>
  <h3 css={typography.heading('h3')}>Title</h3>
</div>
```

## Best Practices

1. **Use Styled Components for Reusable UI Elements**
   - Prefer `StyledButton`, `StyledCard`, etc. for common components
   - Extend them when needed rather than creating new ones

2. **Use Style Utilities for Common Patterns**
   - Use `hoverGlow()`, `transition()`, etc. for consistent effects
   - Combine utilities for complex styles

3. **Use Hooks for Dynamic Styles**
   - Use `useDynamicStyles` for styles that depend on props
   - Use `useTheme` to access theme values

4. **Keep Styles Close to Components**
   - Define component-specific styles in the same file
   - Export reusable styled components

5. **Leverage TypeScript**
   - Use theme types for type safety
   - Define prop types for styled components

## Theme Access

The theme is available through:
- `useTheme()` hook
- Direct import: `import { theme } from '@/styles'`
- Emotion's `ThemeProvider` (automatically set up in `index.tsx`)

## Examples

### Custom Button with Hover Effect

```tsx
import { css } from '@emotion/react'
import { StyledButton } from '../styles'
import { hoverGlow, transition } from '../styles/utils'
import { theme } from '../styles'

const customButton = css`
  ${transition('normal')}
  ${hoverGlow(theme.colors.neon.primary)}
`

<StyledButton variant="primary" css={customButton}>
  Custom Button
</StyledButton>
```

### Responsive Grid

```tsx
import { StyledGrid } from '../styles'
import { breakpoint } from '../styles/utils'
import { css } from '@emotion/react'

const responsiveGrid = css`
  ${breakpoint.sm({
    gridTemplateColumns: 'repeat(2, 1fr)'
  })}
  ${breakpoint.lg({
    gridTemplateColumns: 'repeat(3, 1fr)'
  })}
`

<StyledGrid columns={1} css={responsiveGrid}>
  {/* Grid items */}
</StyledGrid>
```

## Migration Checklist

When migrating components:

- [ ] Replace inline `style` props with styled components or `css` prop
- [ ] Move hover effects from event handlers to CSS
- [ ] Use theme values from `useTheme()` or direct import
- [ ] Replace hardcoded colors/spacing with theme values
- [ ] Use style utilities for common patterns
- [ ] Remove unused CSS classes from `index.css`
- [ ] Test hover and focus states
- [ ] Verify responsive behavior

## Support

For questions or issues with the styling system, refer to:
- This guide
- Theme configuration: `src/theme/theme.ts`
- Styled components: `src/styles/styled/index.ts`
- Style utilities: `src/styles/utils/index.ts`

## Example Migration

Here's a real example of migrating a component from inline styles to the new system:

### Before (GameCard.tsx - Original)

```tsx
const GameCard: React.FC<GameCardProps> = ({
  children,
  title,
  glow = false,
  className = '',
  style,
  onClick
}) => {
  const cardStyle: CSSProperties = {
    background: style?.background || theme.gradients.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
    transition: `all ${theme.transitions.normal}`,
    ...style
  }

  return (
    <div
      className={`game-card ${className}`}
      style={cardStyle}
      onMouseEnter={(e) => {
        if (glow) {
          e.currentTarget.style.borderColor = theme.colors.border.selection
        }
      }}
      onMouseLeave={(e) => {
        if (glow) {
          e.currentTarget.style.borderColor = theme.colors.border.default
        }
      }}
      onClick={onClick}
    >
      {title && (
        <h3
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.lg,
            textAlign: 'left'
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
```

### After (Using Styled Components)

```tsx
import { StyledCard, StyledHeading } from '../styles'

const GameCard: React.FC<GameCardProps> = ({
  children,
  title,
  glow = false,
  className = '',
  style,
  onClick
}) => {
  return (
    <StyledCard
      glow={glow}
      clickable={!!onClick}
      onClick={onClick}
      className={className}
      css={style ? { background: style.background } : undefined}
    >
      {title && <StyledHeading size="h4">{title}</StyledHeading>}
      {children}
    </StyledCard>
  )
}
```

This migration:
- ✅ Removes inline style objects
- ✅ Removes imperative hover handlers (now handled by CSS)
- ✅ Uses standardized styled components
- ✅ Maintains all functionality
- ✅ Reduces code by ~50%

