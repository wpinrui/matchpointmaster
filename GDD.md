# Matchpoint Master — Game Design Document

## 1. Game Concept

**Matchpoint Master** is a single-player, text-based table tennis school management simulator. The player takes the role of a coach managing a school table tennis squad in Singapore. The game centres on building school reputation, recruiting and developing players, and competing in tournaments — from intra-club round-robins through zonal and national championships.

The core fantasy is long-term squad building under constant roster turnover: players stay for a maximum of 4 years, so the coach must continuously scout, recruit, train, and replace talent. A high-reputation school attracts better players; a struggling school must develop raw beginners.

### Design Pillars

- **Dynamic rosters** — The 4-year tenure cap ensures no squad is ever "solved." Graduation forces the coach to rebuild constantly.
- **Reputation as currency** — School reputation drives intake quality, creating a virtuous (or vicious) cycle between tournament results and player quality.
- **Coaching matters** — Good coaching allows slightly less-skilled players to win by leveraging their strengths. Training focus, individual attention, and style synergy all affect outcomes.
- **Mixed-gender teams** — Gender mixing is allowed, emphasising skill over physical differences while incorporating realistic performance factors (e.g., male players having higher median footwork).

---

## 2. Setting

The game is set in the **Singapore school system**. This is reflected throughout:

- **School names** are drawn from real Singapore schools (Raffles Institution, Nanyang Girls' High, St. Joseph's Institution, etc.), sourced from `schools_data.json`.
- **Player names** use multi-cultural name generation: Chinese (with Christian name variants), Malay, Indian, and Western names, reflecting Singapore's demographics.
- **Tournament structure** follows a Singapore-style pathway: intra-club → zonal (25 schools per zone) → national championship.
- **Divisions** mirror the school system: C Division (younger) and B Division (older), each split by gender — C boys, C girls, B boys, B girls.
- **99 AI competitor schools** populate the game world, each with unique names, colours, crests, reputation, and funding levels.

---

## 3. Core Loop

```
RECRUIT → TRAIN → COMPETE → DEVELOP
   ↑                              |
   └──────────────────────────────┘
```

1. **Recruit** — Each January, new students audition. School attractiveness (reputation + funding + coach reputation) determines intake quality.
2. **Train** — Two training blocks per year (Feb–May, Aug–Oct). Assign team focus, individual coaching, and track progression.
3. **Compete** — Intra-club round-robin (May), zonal tournament (June), national championship (July), national singles (November).
4. **Develop** — Players improve through training, affected by traits, coaching effectiveness, style synergy, and funding. The 4-year tenure cap ensures constant roster turnover, looping back to recruitment.

---

## 4. Seasonal Structure

Each in-game year follows a fixed calendar:

| Month | Phase | Activity |
|-------|-------|----------|
| January | DRAFT | Student intake and auditions |
| February–May | TRAINING | First training block |
| End of May | INTRA_CLUB | Intra-club round-robin to rank squad |
| June | ZONAL | Zonal school tournament (top 4 advance) |
| July | NATIONAL | National school championships (knockout) |
| August–October | TRAINING_2 | Second training block |
| End of October | SINGLES_SELECTION | National singles selection (top ELO) |
| November | SINGLES_TOURNAMENT | National singles (top 64 boys, 64 girls) |
| December | GRADUATION | Graduation and celebrations |

**9 phases total:** DRAFT → TRAINING → INTRA_CLUB → ZONAL → NATIONAL → TRAINING_2 → SINGLES_SELECTION → SINGLES_TOURNAMENT → GRADUATION

---

## 5. Game Systems

### 5a. Player Model

Each player has:

- **8 skills** (0–100 scale): forehand, backhand, footwork, serve, receive, spin, placement, consistency
- **12 play styles** across 4 categories: attacker, defensive, tactical, special
- **Equipment**: handedness, grip style (shakehand / penhold / unconventional), 6 rubber types, forehand-backhand tendency
- **Quality tier**: Excellent / Above Average / Average / Below Average / Poor
- **Traits**: see Trait System below
- **Face**: procedurally generated via DiceBear avatars (with gender and hair colour variation by racial category)
- **Name**: multi-cultural generation from Chinese, Malay, Indian, and Western name databases

Player cards display in a FIFA-style format with tier badges.

### 5b. Trait System

9 traits affect training and (in future) match performance:

| Trait | Training Modifier | Notes |
|-------|-------------------|-------|
| HARD_WORKER | +0.15 | |
| NATURAL_TALENT | +0.10 | |
| QUICK_LEARNER | +0.20 | |
| PRODIGY | +0.30 | Highest positive modifier |
| LAZY | -0.15 | |
| INJURY_PRONE | -0.05 | |
| UNDERDOG | — | May overperform but struggle as expectations rise |
| RESILIENT | — | Maintains performance regardless of circumstances |
| VULNERABLE | — | Early success can lead to vulnerability during setbacks |

Traits can be earned or lost over time based on coaching bonuses or inherent characteristics.

### 5c. Match Engine

Matches use a **best-of-5 games** format. Each game is a series of rallies resolved through a two-factor system:

**R1 — Positioning Battle:**
- Footwork vs Placement
- Determines who gains the positional advantage in the rally

**R2 — Stroke Quality:**
- Weighted: 60% stroke quality + 40% spin
- Compared against the opponent's corresponding defensive stats

**Rally flow:** Serve → receive → back-and-forth shots with cumulative bonus carry-forward.

**Special mechanics:**
- **Lucky bounce** (5–10% chance per rally): net bounce (+10 placement, -5 spin) or edge bounce (+30 placement)
- **Equipment modifiers**: rubber type affects spin, receive, and consistency multipliers
- **Error mechanics**: consistency-based with quality penalties and maximum error caps

### 5d. Match Format (School Championships)

School championship ties use a singles/doubles pattern:

| Match | Format |
|-------|--------|
| 1st | Singles |
| 2nd | Doubles |
| 3rd | Singles |
| 4th | Doubles (if needed) |
| 5th | Singles (if needed) |

- **Group stages**: all 5 matches are played.
- **Knockout stages**: play continues until one school wins 3 matches.
- Each match is best-of-5 games with 2 timeouts.
- Referees can issue yellow or red cards to players, coaches, or spectators.

### 5e. Training & Progression

**11 training focuses:** forehand, backhand, footwork, serve, receive, spin, placement, consistency, match play, fundamentals, tournament prep.

**Individual coaching slots:** 3–7 available, based on funding level and coaching effectiveness.

**Improvement multipliers stack:**
- Style synergy: 0.75x – 1.3x (how well the training focus matches the player's play style)
- Traits: -0.15 to +0.3 (see Trait System)
- Coaching effectiveness (manager stat)
- Funding level (school stat)
- Teammate effects

**Skill soft caps** create diminishing returns at higher levels, making it progressively harder to improve already-strong skills.

**Skill snapshots** track historical skill levels for analytics and progress visualisation.

### 5f. Draft System

**School attractiveness** determines draft pool quality:

```
Attractiveness = (Reputation + Funding + Coach Reputation) / 3
```

This maps to an intake quality tier which determines:
- **Pool size**: 3–15 players available to draft
- **Quality distribution**: higher attractiveness → more Excellent/Above Average players

Players are filtered by the school's team type (boys / girls / both). Maximum team size varies by funding and team type (10–30 players).

### 5g. Intra-Club Round-Robin

Held at the end of May to rank the squad before external tournaments.

- **4 divisions**: C boys, C girls, B boys, B girls
- Every player plays every other player in their division (best-of-5)
- Coach can **watch up to 3 matches** (currently hardcoded; planned to be variable based on coaching attributes/badges in future)
- Coach can **manually rank the top 12** or accept the automatic win-loss rankings
- Results and rankings persist in save data

**Planned psychology interaction:** When the psychology system is implemented, players may gain positive or negative badges if the coach ranks them significantly differently from the automatic round-robin rankings. This creates a tension between tactical lineup ordering and player morale.

### 5h. Zonal Tournament

25 schools per zone. Top 4 teams from each zone advance to the national championship. *(Not yet implemented.)*

### 5i. National Championship

Immediate knockout format with seeding based on zonal performance. *(Not yet implemented.)*

### 5j. National Singles

Top 64 boys and 64 girls compete based on highest ELO. Selection notifications go out at the end of October; the tournament runs in November. Injury replacements are called up as needed. *(Not yet implemented.)*

### 5k. Email System

In-game email delivers narrative context and notifications.

- **7 tag categories**: WELCOME, NEWS, DRAFT, TOURNAMENT, TRAINING, ADMINISTRATIVE, SOCIAL
- Bodies rendered as **markdown** (via react-markdown)
- **Contextual generation** on phase transitions (e.g., draft results email after January intake)
- Read/unread tracking with unread badge in navigation

### 5l. AI Schools

99 AI-controlled competitor schools exist alongside the player's school.

- Each loaded from `schools_data.json` with: name, colours (primary/secondary/accent), reputation, funding, team type, crest
- AI schools **train and progress in parallel** with the player's school — they run the same player generation, training, and progression systems
- Each maintains its own players, training plans, and reputation/funding history

### 5m. Psychology & Strategy (Planned)

**Psychology simulation** — Player mindsets affect match performance:
- Early success can lead to **vulnerability** during setbacks
- **Underdog** players may overperform but struggle as expectations rise
- **Resilient** players maintain performance regardless of circumstances
- Traits like UNDERDOG, RESILIENT, and VULNERABLE already exist but their match-time effects are not yet implemented

**Strategy decisions:**
- Users set **lineups** before matches
- Users can review **previous matchups** from opposing coaches
- The intra-club round-robin produces a squad ranking; the **top 12** are expected to compete, impacting morale based on personality

### 5n. School Gossip Column (Planned)

A future narrative feature providing rumours and flavour text about:
- Incredibly strong players at other schools
- Underperforming schools
- Expanding or worsening facilities

---

## 6. New Game Setup

### Manager Creation
- Full name and short name
- Gender selection
- Profile image (DiceBear avatar with customisation)
- Playing attributes: handedness, grip style, rubber type, forehand-backhand tendency, play style

### School Setup
- School name (unique, player-chosen)
- School crest design (procedural SVG — 8 outside shapes, 9 inside shapes, 3 colour slots)
- Team colours: primary, secondary, accent
- Team type: boys / girls / both

Manager starts with base stats for reputation and coaching effectiveness.

---

## 7. Screens & Navigation

The game uses a **custom screen manager** (state-based, not a router) with 13 screens:

| Screen | Access | Purpose |
|--------|--------|---------|
| Load | Pre-game | Check for existing saves, route to new game or home |
| New Game | Pre-game | Two-step wizard: manager form, then school form |
| Home | Hub | Season timeline, email previews, training insights, round-robin results, top prospects, training goals, action button |
| Players | Any time | Full roster browser with FIFA-style player cards |
| Draft | January only | Browse draft pool, select players, manage roster |
| Team Overview | Any time | Roster stats, team composition, player removal |
| Training | Training phases | Set team focus, assign individual coaching, preview expected improvements |
| Match | Tournament phases | 1v1 match simulation with play-by-play |
| Round Robin | May | Player selection, simulation, rankings for intra-club tournament |
| Email | Any time | Browse/read in-game emails with tags and markdown rendering |
| Profile | Any time | Manager profile display |
| Settings | Any time | Game settings |
| Save Manager | Any time | Multiple save slots, export/import as JSON |

- **Load** and **New Game** render without the sidebar layout.
- All other screens are wrapped in **MainLayout** — a sidebar navigation with conditional items and an unread email badge.

---

## 8. UI/UX Overview

### Visual Identity
- **Dark theme** throughout
- Background photo with blur effect
- Neon glow accents and glassmorphism effects
- FIFA-style player cards with quality tier badges

### Component System
73+ components organised by feature domain. Key reusable primitives:
- **GameButton**: 5 variants, 3 sizes, icon and glow support
- **GameCard**: clickable, glow effects
- **GameInput**, **GameDropdown**, **GenderSelect**: form primitives
- **Dialog system**: ConfirmDialog (with cancel), InfoDialog (OK only), DraftInfoDialog, ImagePickerDialog

### Styling Architecture
- **Emotion (CSS-in-JS)** as the primary styling system
- Styled components (`StyledButton`, `StyledCard`, `StyledHeading`, etc.)
- Style utilities (`hoverGlow()`, `transition()`, `cardStyle()`, etc.)
- Theme-based design tokens (no hardcoded colours/spacing)
- See `src/styles/STYLING_GUIDE.md` for full details

### Crest System
Procedurally generated SVG crests with:
- **8 outside shapes**: circle, shield, wreath, square, diamond, hexagon, oval, star
- **9 inside shapes**: torch, book, star, cross, laurel, crown, scroll, quill, none
- **3 colour slots**: primary, secondary, accent
- Real-time preview during school setup
- See `src/assets/crests/README.md` for SVG template specification

---

## 9. Save System

- **Multiple save slots** with create, load, and clear operations
- **Auto-save** to IndexedDB on every state change
- **Export/import** as JSON files for manual backup
- **Session storage** for transient match and round-robin state (survives page refresh, not persistent)

### Save Data Shape

```
SaveData {
  manager         — name, gender, image, playing attributes, stats (reputation, coaching effectiveness)
  school          — name, crest, colours (3), reputation (rank), funding (rank), history arrays, team type
  players         — Player[] (full roster)
  teamRoster      — string[] (active player IDs)
  season          — year, month, phase
  draftCompleted  — boolean
  emails          — Email[] (all in-game emails)
  trainingPlan    — current training plan or null
  skillSnapshots  — historical skill level records
  trainingGoals   — active training objectives
  aiSchools       — AISchool[] (99 schools with players, plans, history)
  roundRobinData  — tournament results or null
}
```

---

## 10. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| UI Framework | React 18.3.1 | Functional components, hooks |
| Type System | TypeScript 5.5.3 | Strict mode |
| Build Tool | Vite 7.2.4 | Dev server on port 3000 |
| Styling | Emotion (CSS-in-JS) | `@emotion/react` + `@emotion/styled` |
| Component Libraries | MUI 6.1.4, React Bootstrap 2.10.5 | MUI primary, Bootstrap secondary (modals, forms) |
| State Management | React Context API | `SaveDataContext` + `useSaveData()` hook |
| Persistence | IndexedDB (custom) | Auto-save, multiple slots |
| Avatar Generation | DiceBear 9.2.4 | `@dicebear/core` + `@dicebear/collection` |
| Date Handling | Day.js 1.11.13 | |
| Markdown | react-markdown 10.1.0 | Email body rendering |
| Hosting | Firebase Hosting | `dist/` directory |
| CI | GitHub Actions | ESLint on PR |
| Linting | ESLint 8.57.0 + Prettier 3.2.5 | Single quotes, no semicolons, 90 char width |

---

## 11. Implementation Status

### Implemented (Playable)

| System | Status | Notes |
|--------|--------|-------|
| New game setup | Complete | Manager + school creation, crest designer |
| Save system | Complete | Multiple slots, IndexedDB, export/import |
| Player generation | Complete | Quality tiers, skills, styles, equipment, multi-cultural names, faces |
| Player cards | Complete | FIFA-style with tier badges |
| Manager stats | Complete | Reputation, coaching effectiveness |
| Training system | Complete | Team focus, individual coaching, preview |
| Player progression | Complete | Skill improvement with multipliers, soft caps, snapshots |
| Trait system | Complete | 9 traits affecting training modifiers |
| Draft system | Complete | Attractiveness-based pool, team type filtering |
| Intra-club round-robin | Complete | 4 divisions, match simulation, manual ranking |
| Email system | Complete | 7 tags, markdown, contextual generation |
| AI schools | Complete | 99 schools with parallel training simulation |
| Phase progression | Partial | 4 of 9 phases functional (DRAFT → TRAINING → INTRA_CLUB → TRAINING_2) |
| Home dashboard | Complete | Timeline, email previews, insights, top prospects |
| Dark theme | Complete | Application-wide |
| Training analytics | Complete | Insights and actionable recommendations |

### Not Yet Implemented

| System | Priority | Notes |
|--------|----------|-------|
| Zonal tournament | High | 25 schools/zone, top 4 advance — next major feature |
| National championship | High | Knockout format with seeding |
| Singles selection | Medium | Top ELO selection, injury replacements |
| Singles tournament | Medium | Top 64 boys/girls |
| Graduation phase | Medium | End-of-year roster turnover |
| Match commentary | Medium | Text-based play-by-play descriptions |
| Strategy/lineup | Medium | Pre-match lineup setting, opponent scouting |
| Psychology simulation | Medium | Mindset effects on match performance (UNDERDOG, RESILIENT, VULNERABLE) |
| Referee system | Low | Yellow/red cards for players, coaches, spectators |
| Gossip column | Low | Narrative rumours about other schools |
| Doubles matches | Medium | Currently only singles implemented in match engine |
| Firebase Authentication | Low | Google sign-in |
| Player intake auditions | Low | Full audition mechanic beyond current draft |

### Current Playable Loop

The game is currently playable through a partial season: **Draft (January) → Training (Feb–May) → Intra-Club Round-Robin (May) → Training 2 (Aug–Oct)**. The season effectively ends after the second training block — all tournament phases from zonal onward are unimplemented.

---

## 12. Dev Log

### 27 October 2024
Implemented school form and JSON saving.

### 1 November 2024
Implemented savegame using context. Load from localStorage to go to the home page with data already loaded.

### 21 November 2025
New game setup added with manager and school customisation, previews, and validation. UI improved with a modular theme and reusable components. Save system now supports multiple slots, import/export, and clearing data. Player generation implemented with quality tiers, skills, ELO, and management integration. Codebase reorganised with extracted hooks, components, and utilities.

### 22 November 2025
Draft system implemented with filtering, team limits, and an initial player pool. Team overview shows stats, limits, and allows removals. School team types added and tied to school quality. Reputation, funding, and attractiveness systems completed. Email system built with browsing, viewing, dynamic text, and markdown. Home screen redesigned with timeline and email previews. Code refactored and game phases now progress automatically.

### 22 November 2025 (Later)
Manager stat system implemented with reputation and coaching effectiveness tracking. Training system fully implemented with team focus, individual coaching slots, and training previews. Player progression system added with skill improvements based on training, traits, coaching effectiveness, and style synergy. Trait system implemented — players can have traits (HARD_WORKER, LAZY, QUICK_LEARNER, etc.) that affect training effectiveness.

### Late November 2025
Intra-team round-robin tournament system implemented: player selection interface for up to 12 players per team (B/C divisions, boys/girls), round-robin tournament engine with best-of-5 singles matches, results matrix, watch match functionality (limit of 3), ranking assignment interface. AI schools system expanded with 99 schools, player generation, and training simulation. Dark theme implemented. FIFA-style player cards with tier system. Training insights and analytics added. Phase progression enhanced with confirmation dialogs and email notifications. Singapore-based name generation. Player face generation with racial hair colour variation.

---

## 13. Architecture Decisions

- **Round-robin watch limit**: `MAX_GAMES_WATCHED` is currently hardcoded to 3 in the round-robin engine. In future, this should become variable based on coaching attributes or badges — better coaches can observe more matches.
- **Round-robin psychology interaction**: When the psychology system is added, players should gain positive or negative badges if the coach ranks them significantly differently from the automatic round-robin ranking. This creates meaningful tension between tactical ordering and squad morale.
- **Custom screen manager over React Router**: Navigation uses a state-based screen manager (`Screens` enum + `changeScreen()`) rather than React Router, despite `react-router-dom` being in dependencies.
- **Context API over Redux**: Despite `react-redux` and `redux-persist` being in dependencies, the primary state management is React Context (`SaveDataContext` + `useSaveData()` hook).
- **No backward compatibility**: The game is in initial development with no active player base. Data structure changes are made directly without migration paths.

---

*This document is the authoritative source for game design. For styling conventions, see `src/styles/STYLING_GUIDE.md`. For crest SVG templates, see `src/assets/crests/README.md`.*
