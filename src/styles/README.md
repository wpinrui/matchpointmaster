# Styling System

This directory contains the standardized styling system for MatchPoint Master.

## Quick Start

```tsx
import { StyledButton, StyledCard, StyledHeading } from '../styles'

function MyComponent() {
  return (
    <StyledCard glow>
      <StyledHeading size="h2">Title</StyledHeading>
      <StyledButton variant="primary">Click me</StyledButton>
    </StyledCard>
  )
}
```

## Structure

- **`styled/`** - Reusable styled components (Button, Card, Input, etc.)
- **`utils/`** - Style utility functions for common patterns
- **`hooks/`** - React hooks for dynamic styling
- **`GlobalStyles.tsx`** - Global CSS styles applied via Emotion
- **`index.ts`** - Main export file

## Key Features

✅ **Type-safe** - Full TypeScript support  
✅ **Theme-based** - Uses centralized theme system  
✅ **Consistent** - Standardized patterns across components  
✅ **Maintainable** - Easy to update and extend  
✅ **Performant** - CSS-in-JS with Emotion  

## Documentation

See [STYLING_GUIDE.md](./STYLING_GUIDE.md) for complete documentation.

## Migration

The system is designed to work alongside existing inline styles. Components can be migrated gradually:

1. Start with new components using styled components
2. Migrate existing components when making changes
3. Remove old CSS classes from `index.css` as components are migrated

## Benefits

- **Reduced code duplication** - Common styles are centralized
- **Better maintainability** - Change theme values in one place
- **Improved performance** - CSS-in-JS optimizations
- **Type safety** - Catch styling errors at compile time
- **Consistent UX** - Standardized hover, focus, and transition effects

