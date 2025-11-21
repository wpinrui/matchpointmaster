# Matchpoint Master

## Game Vision
*Matchpoint Master* is a single-player, text-based table tennis management game where the player manages a **school squad**. The game centers around building a reputation for the school, which affects the quality of new player intakes. A high reputation attracts better players, while a low reputation results in new players who are mostly brand new to the game.

The player negotiates with the school board to improve facilities, hire better coaches, and secure equipment. The willingness of the school board to invest is based on the team’s success and the game’s difficulty setting.

### Key Gameplay Elements
- **School Reputation**: Affects player intake frequency and quality.
- **Coaching Focus**: Good coaching allows slightly less skilled players to win by leveraging their strengths.
- **Fresh Rosters**: Players can only stay for a maximum of 4 years, ensuring a dynamic squad.
- **Mixed-Gender Teams**: Gender mixing is allowed, emphasizing skill over physical differences while incorporating realistic performance factors (e.g., male players having higher median footwork).

### Bootstrapping Features
- **School Name Selection**: Players choose a unique name for their school.
- **School Crest Design**: Players can create or select a crest to represent their school.
- **Team Colors**: Players select the primary and secondary colors for their team uniforms.

### AI Competitors
- **Generated Schools**: A total of 99 AI competitor schools will be generated with unique names, assigned to geographical zones, and provided with team colors.
- **Player Intakes**: Each school will have a defined intake quality, affecting the skill levels and attributes of the players generated for them.

### Seasonal Structure
Each season follows a structured timeline:

- **January**: Student intake and auditions (players can be requested to use specific strokes or techniques).
- **February to May**: Training phase.
- **End of May**: Intra-club round-robin to determine player strengths and rankings within the squad.
- **June**: Zonal school tournament (top 4 teams progress to the national tournament, with 25 teams per zone).
- **July**: National school championships (immediate knockout round with seeding).
- **August to October**: Training phase.
- **End of October**: Notification of national singles players and injury replacements based on highest ELO.
- **November**: National singles tournament (top 64 boys and 64 girls compete).
- **December**: Graduation and celebrations.

### Match Format
In the school championships:
- **1st Match**: Singles
- **2nd Match**: Doubles
- **3rd Match**: Singles
- **4th Match**: Doubles (if needed)
- **5th Match**: Singles (if needed)

- In group stages, all 5 matches are played; in knockout stages, play continues until one school wins 3 matches.
- Each match is a best of 5 games with 2 timeouts.
- Referees can issue yellow or red cards to players, coaches, or spectators.

### Strategy and Psychology
- **Lineup Decisions**: Users can set lineups before matches and review previous matchups from opposing coaches.
- **Player Ranking**: The intra-club round-robin produces a squad ranking; the top 12 will be expected to compete, impacting morale based on their personality.
- **Psychology Simulation**: Players' mindsets will affect their performance:
  - Early success can lead to vulnerability during setbacks.
  - Underdog players may overperform but struggle as expectations rise.
  - Resilient players maintain performance levels regardless of circumstances.
  - And so on.
- **Trait Development**: Players can develop traits based on coaching bonuses or inherent characteristics, which can be earned or lost over time.

### School Gossip Column (Future Feature)
To enhance the game world, a gossip column will be introduced, allowing players to hear rumors about:
- Incredibly strong players.
- Underperforming schools.
- Expanding or worsening facilities.

---

# MVP Development Roadmap

The MVP aims to establish the core mechanics of *Matchpoint Master* by allowing users to manage their school squad, simulate matches, and interact with the player and coach development systems.

## Foundation
- [ ] Implement Firebase Authentication (Google sign-in).
- [x] Create User Profiles (store basic user data such as manager name, school name, and initial stats).
- [x] Setup Local Storage Sync (store user and game data locally with online sync).
- [x] School Bootstrapping Features:
  - [x] School Name Selection
  - [x] School Crest Design (SVG-based crest maker with color pickers and shape selection)
  - [x] Team Colors Selection (Primary, Secondary, Accent colors)

## Core Gameplay Mechanics
- [x] Random Player Generation (create random player attributes like ELO, skill set, gender, etc.).
- [x] Player Card Component (display player stats and attributes).
- [ ] Manager Stat System (initialize manager’s reputation and coaching effectiveness).
- [ ] Implement Training System (set weekly training plans for players).
- [ ] Individual Coaching System (assign individual coaching to players based on their needs).
- [ ] Player Intake System (manage student auditions in January).
- [ ] Implement Intra-club Round-Robin (determine player rankings).
- [ ] Zonal School Tournament System (group stages and knockout rounds).
- [ ] National Championships Setup (manage seeding and immediate knockout rounds).
- [ ] Match Format Implementation (integrate singles and doubles match formats).
- [ ] Implement Basic Match Commentary (text-based descriptions of match events).
- [ ] Implement Strategy Decisions (allow users to set lineups before matches).
- [ ] Referee System (implement yellow and red card mechanics).

## Player Development Loop
- [ ] Implement Training Impact (improve player skills based on training focus).
- [ ] Implement Psychology Simulation (track player mindsets and how they affect performance).
- [ ] Trait System (allow players to earn or lose traits over time).

## Events & Tournaments
- [ ] Implement Seasonal Schedule (January intake, training phases, tournaments).
- [ ] Notification System (alert players about national singles selections).

---

# Play the Game
The game will be live [here](https://matchpointmaster.com)!

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


**Next Steps**: Implement training system and player development mechanics.