import { GamePhase, getPhaseDisplayName } from '../gamePhases'

/**
 * Get phase description text for emails
 */
export function getPhaseDescription(phase: GamePhase, month: number): string {
  switch (phase) {
    case GamePhase.DRAFT:
      return `This is the **Draft Phase**. You have the opportunity to select players for your team. Once you leave the draft screen, you cannot add more players for the rest of the season, so choose wisely!`

    case GamePhase.TRAINING:
      if (month === 2) {
        return `This is the beginning of the **Training Phase**. Focus on developing your players' skills and preparing them for upcoming competitions. Set up your training plan to maximize player development.`
      }
      return `The **Training Phase** continues. Focus on developing your players' skills through your training plan.`

    case GamePhase.INTRA_CLUB:
      return `This is the **Intra-Club Round-Robin** phase. Your players will compete against each other to determine their rankings within the squad. This tournament will help you identify your strongest players and prepare for upcoming competitions.`

    case GamePhase.ZONAL:
      return `Welcome to the **Zonal School Tournament** phase! Your team will compete against other schools in your zone. The top 4 teams will advance to the national tournament. Good luck!`

    case GamePhase.NATIONAL:
      return `Congratulations on making it to the **National Championships**! This is an immediate knockout tournament with seeding. Every match counts - give it your all!`

    case GamePhase.TRAINING_2:
      if (month === 8) {
        return `We're entering the second **Training Phase** of the season. Continue developing your players' skills and preparing for the national singles tournament.`
      } else if (month === 10) {
        return `This is the **Pre-Singles** phase - your final training month before the national singles tournament. Make final preparations!`
      }
      return `The second **Training Phase** continues. Keep up the excellent work developing your players.`

    case GamePhase.SINGLES_SELECTION:
      return `Welcome to the **Singles Selection** phase. Players will be notified of their selection for the national singles tournament based on their overall ratings.`

    case GamePhase.SINGLES_TOURNAMENT:
      return `This is the **National Singles Tournament** phase! The top 64 boys and 64 girls from across the country will compete. This is a prestigious competition - best of luck to your players!`

    case GamePhase.GRADUATION:
      return `We've reached the **Graduation & Celebrations** phase. This is a time to reflect on the season, celebrate achievements, and prepare for the next year.`

    default:
      return `We're now in the **${getPhaseDisplayName(phase, month)}** phase. Continue managing your team effectively.`
  }
}

