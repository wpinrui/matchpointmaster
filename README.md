# Matchpoint Master

A single-player, text-based table tennis management game where you manage a school squad — build your reputation, develop players, and compete in tournaments. See [`GDD.md`](GDD.md) for full game design details.

---

# Dev Log

### 27 October 2024
Implemented school form and JSON saving. Next task: Handle form saving to localstorage and start game.

### 1 November 2024
Implemented savegame using context. Next task: Instead of loading a JSON file, load from localstorage to go to the home page with data already loaded. Then, create the player draft.

### 21 November 2025
New game setup added with manager and school customization, previews, and validation.

UI improved with a modular theme and reusable components.

Save system now supports multiple slots, import/export, and clearing data.

Player generation implemented with quality tiers, skills, ELO, and management integration.

Codebase reorganized with extracted hooks, components, and utilities.

### 22 November 2025
Draft system implemented with filtering, team limits, and an initial player pool.

Team overview shows stats, limits, and allows removals.

School team types added and tied to school quality.

Reputation, funding, and attractiveness systems completed.

Email system built with browsing, viewing, dynamic text, and markdown.

Home screen redesigned with timeline and email previews.

Code refactored and game phases now progress automatically.

### 22 November 2025 (Later)
Manager stat system implemented with reputation and coaching effectiveness tracking.

Training system fully implemented with team focus, individual coaching slots, and training previews.

Player progression system added with skill improvements based on training, traits, coaching effectiveness, and style synergy.

Trait system implemented - players can have traits (HARD_WORKER, LAZY, QUICK_LEARNER, etc.) that affect training effectiveness.

### Late November 2025
Intra-team round-robin tournament system implemented:
- Player selection interface for up to 12 players per team (B/C divisions, boys/girls)
- Round-robin tournament engine with best-of-5 singles matches between all player pairs
- Results matrix table showing win/loss records and match outcomes
- Watch match functionality (limit of 3 games, hardcoded for now - future enhancement: variable based on coaching attributes)
- Ranking assignment interface allowing coaches to manually rank players or follow automatic rankings
- Tournament results and rankings persist in save data

AI schools system expanded with 99 schools, player generation, and training simulation.

Dark theme implemented across the application.

FIFA-style player cards with tier system replacing ELO display.

Training insights and analytics added with actionable recommendations.

Phase progression system enhanced with confirmation dialogs and proper email notifications.

Singapore-based name generation for AI schools with Chinese name ordering.

Player face generation enhanced with hair color based on racial categories.

**Next Steps**: Implement tournament systems (Intra-club Round-Robin, Zonal, National), match simulation, and psychology system.

### 26 March 2026
Fixed dev server and production build. Removed 6 useless try/catch wrappers blocking Vite's ESLint plugin and removed redundant Bootstrap CDN references from `index.html`. Created `GDD.md` consolidating all scattered documentation into a single authoritative game design document. Retired `agent.md` and trimmed `README.md` — coding conventions migrated to `.claude/` instruction files.
