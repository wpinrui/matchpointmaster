# Agent Instructions for Matchpoint Master

This document provides standardized instructions for AI agents working on the Matchpoint Master codebase. **All agents must read and follow these guidelines.**

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Folder Structure](#folder-structure)
3. [Gameplay Overview](#gameplay-overview)
4. [Styling Conventions](#styling-conventions)
5. [Code Conventions](#code-conventions)
6. [Terminal Commands](#terminal-commands)
7. [Development Workflow](#development-workflow)
8. [Code Quality Guidelines](#code-quality-guidelines)
9. [Commit Message Format](#commit-message-format)
10. [Appendix: Codebase Notes](#appendix-codebase-notes)

---

## Initial Setup

**Before starting any task, agents MUST:**

1. **Read this file (`agent.md`)** - Understand all conventions and guidelines
2. **Read `README.md`** - Understand the game vision, gameplay mechanics, and roadmap
3. **Cross-check README to relevant features** - Verify your understanding of the feature you're working on matches the README
4. **Update `agent.md` if needed** - If you discover new conventions or patterns, document them here

---

## Folder Structure

```
src/
├── components/          # Reusable UI components organized by feature
│   ├── buttons/        # Button components
│   ├── cards/          # Card components
│   ├── dialogs/        # Dialog/modal components
│   ├── forms/          # Form input components
│   ├── home/           # Home screen components
│   ├── layout/         # Layout components (MainLayout, etc.)
│   ├── players/        # Player-related components
│   └── ...
├── constants/          # Application constants
├── hooks/              # Custom React hooks
├── screen_manager/     # Screen routing and management
├── screens/            # Main screen components (one per route)
│   ├── new_game/       # New game setup screens
│   └── team/           # Team management screens
├── services/           # Business logic and services
│   └── savegame/       # Save game system
├── styles/             # Styling system (Emotion-based)
│   ├── styled/         # Styled components
│   ├── utils/          # Style utility functions
│   └── hooks/          # Styling hooks
├── theme/              # Theme configuration
└── utils/              # Utility functions organized by domain
    ├── match/          # Match-related utilities
    ├── nameData/       # Name generation data
    └── ...
```

### Key Principles:
- **Components** are organized by feature/domain
- **Screens** represent top-level routes/views
- **Utils** contain pure functions and business logic
- **Services** handle state management and data persistence
- **Styles** use Emotion (CSS-in-JS) with a standardized system

---

## Gameplay Overview

**Matchpoint Master** is a single-player, text-based table tennis management game where players manage a school squad.

### Core Mechanics:
- **School Reputation**: Affects player intake quality and frequency
- **Player Management**: Players stay max 4 years, ensuring dynamic rosters
- **Training System**: Weekly training plans and individual coaching
- **Tournaments**: Intra-club round-robin → Zonal → National championships
- **Match Format**: Best-of-5 matches (singles/doubles) with best-of-5 games

### Seasonal Timeline:
- **January**: Student intake and auditions
- **February-May**: Training phase
- **End of May**: Intra-club round-robin
- **June**: Zonal school tournament
- **July**: National school championships
- **August-October**: Training phase
- **End of October**: National singles selection notifications
- **November**: National singles tournament
- **December**: Graduation and celebrations

### Key Features:
- School customization (name, crest, colors)
- 99 AI competitor schools
- Player generation with quality tiers
- Training and progression system
- Trait system (HARD_WORKER, LAZY, QUICK_LEARNER, etc.)
- Email notification system
- Manager stats (reputation, coaching effectiveness)

**For detailed gameplay information, refer to `README.md`.**

---

## Styling Conventions

The project uses **Emotion (CSS-in-JS)** for styling. **DO NOT use inline styles or CSS files.**

### Key Rules:
1. **Use Styled Components** from `src/styles`:
   - `StyledButton`, `StyledCard`, `StyledHeading`, `StyledText`, etc.
   - Import from `'../styles'` or `'@/styles'`

2. **Use Style Utilities** for common patterns:
   - `hoverGlow()`, `transition()`, `cardStyle()`, etc.
   - Import from `'../styles/utils'`

3. **Use Theme Values**:
   - Access via `useTheme()` hook or direct import: `import { theme } from '@/styles'`
   - Never hardcode colors, spacing, or typography values

4. **Migration Pattern**:
   - Replace inline `style` props with styled components or `css` prop
   - Move hover effects from event handlers to CSS
   - Use style utilities for common patterns

### Example:
```tsx
// ✅ CORRECT
import { StyledCard, StyledHeading, StyledButton } from '../styles'
import { hoverGlow, transition } from '../styles/utils'
import { css } from '@emotion/react'

const customCard = css`
  ${hoverGlow()}
  ${transition('normal')}
`

<StyledCard css={customCard}>
  <StyledHeading size="h2">Title</StyledHeading>
  <StyledButton variant="primary">Click me</StyledButton>
</StyledCard>

// ❌ WRONG
<div style={{ background: '#000', padding: '20px' }}>
  <h2 style={{ color: '#fff' }}>Title</h2>
</div>
```

**For detailed styling guidelines, refer to `src/styles/STYLING_GUIDE.md`.**

---

## Code Conventions

### TypeScript:
- **Strict mode enabled** - No implicit `any`
- Use proper types for all function parameters and return values
- Prefer interfaces for object shapes, types for unions/intersections

### React:
- Use functional components with hooks
- Use `React.FC` type annotation for components
- Self-closing components when no children: `<Component />` not `<Component></Component>`
- Boolean props: `disabled` not `disabled={true}`

### File Naming:
- Components: `PascalCase.tsx` (e.g., `PlayerCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `playerGeneration.ts`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `usePlayerTraining.ts`)

### Code Style:
- **Prettier** configured: single quotes, no semicolons, 2-space indentation
- **ESLint** configured: React hooks rules, import ordering
- Maximum line length: 90 characters

### User Interaction:
- **NEVER use browser native prompts** (`alert()`, `confirm()`, `prompt()`)
- **ALWAYS use dialog components** from `src/components/dialogs/`
- Use `ConfirmDialog` for confirmations (with cancel option)
- Use `InfoDialog` for informational messages (OK only)
- Check existing dialog components before creating new ones

### Comments:
- **Avoid excessive comments** - Code should be self-documenting
- Only add comments when logic is complex or non-obvious
- Prefer descriptive variable and function names over comments
- Remove commented-out code before committing

### Import Order:
1. React imports
2. Third-party libraries
3. Internal imports (components, utils, styles)
4. Type imports (use `import type` when possible)

### Example:
```tsx
import React from 'react'
import { css } from '@emotion/react'

import { StyledCard } from '../styles'
import { useSaveData } from '../services/savegame/useSaveData'
import type { Player } from '../services/savegame/types'
```

---

## Terminal Commands

**CRITICAL: All terminal commands MUST use PowerShell syntax.**

The project runs on Windows, so use PowerShell commands, not bash/Unix commands.

### Common Commands:
# Run linter with auto-fix (REQUIRED after code generation)
npm run lint -- --fix

### PowerShell vs Bash:
- Use `;` not `&&` for command chaining (or use separate commands)
- Use `$env:VAR` not `$VAR` for environment variables
- Use backticks `` ` `` for line continuation
- Path separators: Use `/` or `\` (PowerShell handles both)

---

## Development Workflow

### When Given a Task:

1. **Clarify if Under-Specified**:
   - If the task is vague or missing details, ask for clarification
   - Don't make assumptions about requirements
   - Confirm edge cases and expected behavior
   - Take more liberties with styling

2. **No Backward Compatibility During Initial Development**:
   - **Do NOT add migration code or backward compatibility layers**
   - The game is in initial development with no active players
   - Adding compatibility code adds unnecessary complexity
   - If storage systems change, just use the new system directly
   - If data structures change, update them directly without migration paths

3. **Read Documentation**:
   - Read `agent.md` (this file)
   - Read `README.md`
   - Read relevant styling guide (`src/styles/STYLING_GUIDE.md`)
   - Check existing similar features for patterns

4. **Assess Existing Code** (when reading files):
   - **Before modifying any file, assess its code quality**
   - Look for cleanup opportunities (see Code Quality Guidelines)
   - **Offer to clean up existing code before adding new features**
   - Explain how cleanup will improve maintainability
   - Get approval to proceed with cleanup + new feature

5. **Implement the Feature**:
   - Follow folder structure conventions
   - Use styled components (not inline styles)
   - Follow TypeScript and React conventions
   - Write clean, maintainable code

6. **After Code Generation**:
   - **ALWAYS run**: `npm run lint -- --fix`
   - Fix any remaining linting errors manually
   - Verify TypeScript compilation succeeds
   - **Check code quality** (see Code Quality Guidelines section)
   - Test the feature if possible
   - **Offer to refactor** after functionality is confirmed working

7. **Update Documentation**:
   - Update `agent.md` if you discover new patterns
   - Update `README.md` if you add new features
   - Keep documentation in sync with code

---

## Code Quality Guidelines

**Focus on code quality throughout development. Clean, maintainable code is a priority.**

### Core Principle: Only Make It Better

**When working with existing code, always improve it. Never leave code in a worse state than you found it.**

- Every file you touch should be cleaner after your changes
- If you read a file and notice issues, **offer to clean it up before adding new code**
- Prevent technical debt accumulation by fixing issues as you encounter them
- Small improvements compound over time

### Proactive Code Cleanup:

**When reading files (before making changes):**

1. **Assess code quality**:
   - Look for separation of concerns violations
   - Identify code smells (long functions, mixed concerns, etc.)
   - Check for outdated patterns or anti-patterns
   - Note any inconsistencies with current conventions

2. **Offer cleanup first**:
   - **Before adding new code, offer to clean up existing issues**
   - Propose specific improvements (extract functions, split components, etc.)
   - Explain how cleanup will make the new code easier to add
   - Get approval before proceeding with both cleanup and new features

3. **Cleanup opportunities**:
   - Extract business logic from components
   - Split large components into smaller ones
   - Remove duplicate code
   - Update to current styling conventions (if using old patterns)
   - Fix type safety issues
   - Improve naming for clarity
   - Remove dead code or commented-out code

**Example workflow:**
```
Agent: "I'm reading PlayerCard.tsx to add a new feature. I notice it has 
business logic mixed with presentation and some inline styles. Should I 
clean this up first by extracting the logic to a utility function and 
converting to styled components, then add the new feature?"
```

### Separation of Concerns:
- **Components** should focus on presentation and user interaction
- **Business logic** belongs in `utils/` or `services/`
- **State management** should be in hooks or services, not components
- **Data transformations** should be pure functions in `utils/`

### After Code Generation Checklist:
1. **Review separation of concerns**:
   - Is business logic mixed with UI components? → Extract to utils/hooks
   - Are components doing too much? → Split into smaller components
   - Is state management in the right place? → Move to appropriate hook/service

2. **Check for code smells**:
   - Functions longer than 50 lines → Consider breaking down
   - Components with 10+ props → Consider using context or composition
   - Duplicated logic → Extract to shared utilities
   - Complex nested conditionals → Simplify or extract to functions

3. **Verify code organization**:
   - Files are in the correct folders according to structure
   - Related functionality is grouped together
   - Imports are organized correctly

4. **Offer refactoring**:
   - After functionality is tested and working, **offer to refactor** for better code quality
   - Suggest improvements for separation of concerns
   - Propose extracting reusable logic
   - Recommend component decomposition if needed

### Code Comments Policy:
- **Minimal comments** - Code should be self-documenting through:
  - Clear variable and function names
  - Small, focused functions
  - Type annotations (TypeScript)
- **Only comment when necessary**:
  - Complex algorithms or business logic that isn't obvious
  - Workarounds for known issues (reference issue/ticket if possible)
  - Non-obvious performance optimizations
- **Remove unnecessary comments**:
  - Obvious code doesn't need explanation
  - Commented-out code should be deleted
  - TODO comments should be tracked in issues, not code

### Example of Good vs Bad:
```tsx
// ❌ BAD - Too many comments, mixed concerns
function PlayerCard({ player }) {
  // Get player stats
  const stats = player.stats
  // Calculate overall rating
  const rating = (stats.forehand + stats.backhand) / 2
  // Render card
  return <div>{rating}</div>
}

// ✅ GOOD - Self-documenting, separated concerns
function calculateOverallRating(player: Player): number {
  return (player.stats.forehand + player.stats.backhand) / 2
}

const PlayerCard: React.FC<{ player: Player }> = ({ player }) => {
  const rating = calculateOverallRating(player)
  return <StyledCard>{rating}</StyledCard>
}
```

---

## Commit Message Format

**Commit messages should be short, with detailed information in bullet points on new lines.**

### Format:
```
Short summary (50 chars or less)

- Detailed point 1
- Detailed point 2
- Additional context or changes
```

### Examples:

```
Add player training system

- Implement weekly training plan selection
- Add individual coaching slot management
- Create training preview component
- Integrate with player progression system
```

```
Fix email notification styling

- Update EmailCard component spacing
- Fix markdown rendering in email view
- Improve responsive layout for mobile
```

```
Refactor save game service

- Extract save/load logic to separate functions
- Add error handling for corrupted saves
- Improve TypeScript types for SaveData
```

### Guidelines:
- First line: Brief summary (imperative mood: "Add", "Fix", "Update", not "Added", "Fixed")
- Bullet points: Explain what changed and why
- Be specific about components/files affected
- Mention breaking changes if any

---

## Additional Notes

### Testing:
- Manual testing is expected for UI changes
- Verify features work in the browser
- Check console for errors

### Performance:
- Be mindful of re-renders in React components
- Use `useMemo` and `useCallback` when appropriate
- Avoid unnecessary state updates

### Accessibility:
- Use semantic HTML elements
- Ensure keyboard navigation works
- Maintain proper ARIA labels where needed

### Browser Support:
- Target modern browsers (Chrome, Firefox, Safari latest versions)
- Use CSS features supported in target browsers

---

## Questions?

If you encounter unclear requirements or need clarification:
1. Review `README.md` for gameplay context
2. Check existing similar features in the codebase
3. Ask for clarification rather than making assumptions
4. Document your findings in this file for future agents

---

## Appendix: Codebase Notes

This section documents codebase oddities, patterns, or important notes that future agents should be aware of.

### Known Patterns:
- _(Add patterns discovered during development)_

### Codebase Oddities:
- _(Document any unusual patterns, technical debt, or workarounds)_

### Architecture Decisions:
- **Round-robin tournament watch limit**: Currently hardcoded to 3 games maximum that the coach can watch. In the future, this should be made variable based on coaching attributes or badges. See `src/utils/roundRobinEngine.ts` MAX_GAMES_WATCHED constant.
- **Round-robin psychology effects**: When psychology simulation is added, players may gain positive or negative badges if the coach ranks them quite differently from the actual round-robin automatic ranking. This is not implemented yet but should be considered in future psychology system work.

**Agents should update this section when they discover:**
- Unusual patterns that deviate from standard conventions
- Technical debt that affects how features should be implemented
- Workarounds for known issues
- Important architectural decisions or constraints

---

**Remember: Always run `npm run lint -- --fix` after generating code!**

