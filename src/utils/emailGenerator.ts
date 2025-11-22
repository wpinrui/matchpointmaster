import {
  Email,
  EmailTag,
  SaveData,
  SkillSnapshot,
  Player
} from '../services/savegame/types'
import { calculateMaxTeamSize } from './schoolReputation'
import { getTeamCompositionRequirements } from './teamTypeDisplay'
import { GamePhase, getPhaseDisplayName } from './gamePhases'
import { MONTH_NAMES } from './constants'
import {
  getTopImprovers,
  calculateTeamAverageImprovement,
  calculateTeamTotalImprovement
} from './trainingInsights'
import { getImprovementChartData, getYearToDateSnapshots } from './trainingAnalytics'
import { getTrainingFocusDisplayName } from './trainingPlans'
import { getPlayerFullName } from './playerGeneration'

/**
 * Generate a timestamp based on in-game date
 * @param year - In-game year
 * @param month - In-game month (1-12)
 * @param day - Day of month (1-31)
 * @param hour - Hour of day (0-23), defaults to 9
 * @param minute - Minute (0-59), defaults to 0
 */
export function getInGameTimestamp(
  year: number,
  month: number,
  day: number,
  hour: number = 9,
  minute: number = 0
): number {
  // Create a date object with the in-game date
  // We use a fixed base year (2024) and adjust from there
  const date = new Date(2024, month - 1, day, hour, minute)
  // Adjust the year difference
  const yearDiff = year - 2024
  date.setFullYear(2024 + yearDiff)
  return date.getTime()
}

/**
 * Generate initial welcome emails for a new game
 */
export function generateInitialEmails(saveData: SaveData): Email[] {
  const { season, manager, school } = saveData
  const year = season.year
  const schoolName = school.name || 'the school'
  const managerName = manager.fullName || 'Coach'
  const maxTeamSize = calculateMaxTeamSize(school.funding, school.teamType)

  // Welcome email - sent 2 days before current date (January 1st)
  const welcomeEmail: Email = {
    id: 'welcome-email-1',
    from: 'School Administration',
    subject: 'Welcome to Your New Role!',
    body: `Dear ${managerName},

Welcome to your new position as the Table Tennis Team Manager at ${schoolName}! We're thrilled to have you on board.

As you begin your journey with us, here are some important guidelines to keep in mind:

## Team Type

${
  school.teamType === 'boys'
    ? "This school fields a **Boys Only** team. You will be managing the boys' table tennis program."
    : school.teamType === 'girls'
      ? "This school fields a **Girls Only** team. You will be managing the girls' table tennis program."
      : 'This school fields **Both Boys and Girls** teams. You will be managing both programs.'
}

## Team Composition Requirements

${getTeamCompositionRequirements(school.teamType || 'both')}

## Team Size Limit

Based on the school's current funding, you can have a maximum of **${maxTeamSize}** players on your team. This limit is determined by the school's financial resources and will change as funding improves or decreases based on performance.

## Draft Phase

The draft phase is your opportunity to select players for your team. Take your time to evaluate each player's skills and potential. Once you leave the draft screen, you won't be able to add more players for the rest of the season, so choose wisely!

## Getting Started

1. Navigate to the Draft screen to begin selecting your players
2. Review player profiles and statistics carefully
3. Build a balanced team that can compete effectively

We're here to support you every step of the way. If you have any questions, feel free to reach out through the email system.

Best of luck with the upcoming season!

Sincerely,
School Administration`,
    timestamp: getInGameTimestamp(year, 1, 1, 11, 0), // January 1st, 8:00 AM (earlier to show first)
    read: false,
    tags: [EmailTag.WELCOME, EmailTag.DRAFT]
  }

  // News email - sent 1 day before current date (January 1st, afternoon)
  const newsEmail: Email = {
    id: 'news-email-1',
    from: 'Local News - Forwarded',
    subject: `New Table Tennis Team Established at ${schoolName}`,
    body: `[FORWARDED ARTICLE]

## Local School News - Table Tennis Team Launch

In an exciting development for the school community, ${schoolName} has announced the establishment of a new Table Tennis team, marking a significant milestone for students and parents who have long advocated for such a program.

The school has recently hired ${managerName} as the new Table Tennis Team Manager to lead this initiative. This newly established team represents a fresh start and a new opportunity for students to engage in competitive table tennis at the school level.

## Community Response

Parents and students have expressed overwhelming support for this initiative. Many have been hoping for a table tennis team at ${schoolName} for a long time, and the establishment of this program has been met with enthusiasm and anticipation.

## Looking Forward

With the team now in place, the school community is hopeful for good results in upcoming competitions. ${managerName} brings fresh perspectives and will work to build a competitive team from the ground up.

The school administration has emphasized their commitment to supporting the team's development and ensuring students have the resources they need to succeed.

This is an exciting time for table tennis enthusiasts at ${schoolName}, and we look forward to following the team's progress in the coming season.

---

*Article forwarded by School Administration*`,
    timestamp: getInGameTimestamp(year, 1, 1, 10, 0), // January 1st, 10:00 AM (later than welcome)
    read: false,
    tags: [EmailTag.NEWS, EmailTag.SOCIAL]
  }

  return [welcomeEmail, newsEmail]
}

/**
 * Generate a phase progression email when advancing to a new phase/month
 * Includes training summaries for training month progressions
 */
export function generatePhaseProgressionEmail(
  managerName: string,
  schoolName: string,
  players: Player[],
  teamRoster: string[],
  previousMonth: number,
  previousYear: number,
  previousPhase: GamePhase,
  currentMonth: number,
  currentYear: number,
  currentPhase: GamePhase,
  previousMonthSnapshots: SkillSnapshot[]
): Email {
  const monthName = MONTH_NAMES[currentMonth - 1]
  const previousMonthName = MONTH_NAMES[previousMonth - 1]
  const phaseDisplayName = getPhaseDisplayName(currentPhase, currentMonth)

  // Get team players
  const teamPlayers = players.filter((p) => teamRoster.includes(p.id))

  // Generate email subject and body based on phase
  let subject = ''
  let body = ''
  let tags: EmailTag[] = [EmailTag.ADMINISTRATIVE]

  // Check if we're continuing within training phase (e.g., Feb to Mar, Mar to Apr, etc.)
  const isTrainingContinuation =
    (previousPhase === GamePhase.TRAINING || previousPhase === GamePhase.TRAINING_2) &&
    (currentPhase === GamePhase.TRAINING || currentPhase === GamePhase.TRAINING_2)

  if (isTrainingContinuation && teamPlayers.length > 0) {
    // Training month progression - include training summary
    subject = `Training Update: ${previousMonthName} Summary & ${monthName} Preview`
    tags = [EmailTag.TRAINING, EmailTag.ADMINISTRATIVE]

    // Calculate training statistics
    const topImprovers = getTopImprovers(previousMonthSnapshots, teamPlayers, 3)
    const teamAvgImprovement = calculateTeamAverageImprovement(
      previousMonthSnapshots,
      teamPlayers
    )
    const teamTotalImprovement = calculateTeamTotalImprovement(
      previousMonthSnapshots,
      teamPlayers
    )

    // Check if we have snapshots to show detailed stats
    const hasSnapshots = previousMonthSnapshots.length > 0

    if (hasSnapshots) {
      // Calculate training statistics from snapshots
      const topImprovers = getTopImprovers(previousMonthSnapshots, teamPlayers, 3)
      const teamAvgImprovement = calculateTeamAverageImprovement(
        previousMonthSnapshots,
        teamPlayers
      )
      const teamTotalImprovement = calculateTeamTotalImprovement(
        previousMonthSnapshots,
        teamPlayers
      )

      body = `Dear ${managerName},

## ${previousMonthName} Training Summary

We've completed another month of training, and I'm pleased to share the progress your team has made:

### Overall Team Performance

- **Total Skill Improvement:** +${Math.round(teamTotalImprovement)} points across all players
- **Average Improvement per Player:** +${teamAvgImprovement.toFixed(1)} points per skill

${
  topImprovers.length > 0
    ? `
### Top Performers This Month

${topImprovers
  .map(
    (improver, index) =>
      `${index + 1}. **${getPlayerFullName(improver.player)}** - +${Math.round(
        improver.totalImprovement
      )} total skill points`
  )
  .join('\n')}
`
    : ''
}

### Looking Ahead to ${monthName}

We're now entering ${monthName} ${currentYear}, and the **${phaseDisplayName}** phase continues.

${getPhaseDescription(currentPhase, currentMonth)}

Keep up the excellent work!

Best regards,
School Administration`
    } else {
      // No snapshots yet (first training month progression or snapshots not created)
      body = `Dear ${managerName},

## ${previousMonthName} Training Summary

We've completed another month of training. Your team has been working hard and making progress.

### Looking Ahead to ${monthName}

We're now entering ${monthName} ${currentYear}, and the **${phaseDisplayName}** phase continues.

${getPhaseDescription(currentPhase, currentMonth)}

Continue focusing on your training plan to maximize player development.

Best regards,
School Administration`
    }
  } else {
    // Check if we're continuing in the same phase or entering a new phase
    const isNewPhase = previousPhase !== currentPhase
    const isTrainingContinuation =
      (previousPhase === GamePhase.TRAINING || previousPhase === GamePhase.TRAINING_2) &&
      (currentPhase === GamePhase.TRAINING || currentPhase === GamePhase.TRAINING_2)

    if (isNewPhase) {
      // Entering a new phase
      subject = `Phase Update: Entering ${phaseDisplayName} Phase`
      tags = [EmailTag.ADMINISTRATIVE]

      body = `Dear ${managerName},

## Phase Progression Update

We've now entered **${monthName} ${currentYear}**, beginning the **${phaseDisplayName}** phase.

${getPhaseDescription(currentPhase, currentMonth)}

If you have any questions or need assistance, please don't hesitate to reach out.

Best regards,
School Administration`
    } else if (isTrainingContinuation) {
      // Continuing within training phase (e.g., March in training phase after February)
      subject = `Training Update: ${monthName} Preview`
      tags = [EmailTag.TRAINING, EmailTag.ADMINISTRATIVE]

      body = `Dear ${managerName},

## Month Progression Update

We've now entered **${monthName} ${currentYear}**. The **${phaseDisplayName}** phase continues.

${getPhaseDescription(currentPhase, currentMonth)}

If you have any questions or need assistance, please don't hesitate to reach out.

Best regards,
School Administration`
    } else {
      // Continuing within same non-training phase
      subject = `Update: ${monthName} Preview`
      tags = [EmailTag.ADMINISTRATIVE]

      body = `Dear ${managerName},

## Month Progression Update

We've now entered **${monthName} ${currentYear}**. The **${phaseDisplayName}** phase continues.

${getPhaseDescription(currentPhase, currentMonth)}

If you have any questions or need assistance, please don't hesitate to reach out.

Best regards,
School Administration`
    }
  }

  return {
    id: `phase-progression-${currentYear}-${currentMonth}-${Date.now()}`,
    from: 'School Administration',
    subject,
    body,
    timestamp: getInGameTimestamp(currentYear, currentMonth, 1, 9, 0), // First day of month, 9 AM
    read: false,
    tags
  }
}

/**
 * Generate training motivation email during training phases
 */
export function generateTrainingMotivationEmail(
  managerName: string,
  schoolName: string,
  players: Player[],
  teamRoster: string[],
  month: number,
  year: number,
  trainingPlan: { teamFocus: string | null; playerAssignments: any[] } | null
): Email | null {
  const teamPlayers = players.filter((p) => teamRoster.includes(p.id))
  if (teamPlayers.length === 0 || !trainingPlan) return null

  const monthName = MONTH_NAMES[month - 1]
  const playerNames = teamPlayers
    .slice(0, 3)
    .map((p) => `${p.firstName} ${p.lastName}`)
    .join(', ')
  const morePlayers = teamPlayers.length > 3 ? ` and ${teamPlayers.length - 3} more` : ''

  // Random motivational messages
  const messages = [
    {
      subject: `Training Update: ${playerNames}${morePlayers} Showing Great Progress`,
      body: `Dear ${managerName},

I wanted to reach out and share some positive feedback about the training sessions this month.

## Player Observations

${playerNames}${morePlayers} have been particularly engaged during training. The coaching staff has noticed improved focus and dedication, especially during ${trainingPlan.teamFocus ? getTrainingFocusDisplayName(trainingPlan.teamFocus as any) : 'the current training focus'} sessions.

## Team Morale

The team's energy has been excellent. Players are pushing each other to improve, and there's a real sense of camaraderie developing. This kind of positive atmosphere is exactly what we need heading into the competitive season.

## Looking Forward

Keep up the excellent work! The foundation you're building now will pay dividends when tournament season arrives.

Best regards,
Assistant Coach`
    },
    {
      subject: `Training Note: Team Working Hard in ${monthName}`,
      body: `Dear ${managerName},

Just a quick note to let you know that the team has been putting in solid work this month.

## Training Highlights

The players have been responding well to the training program. ${playerNames}${morePlayers} in particular have shown noticeable improvement in their technique and consistency.

## Coach's Perspective

From a coaching standpoint, it's encouraging to see players taking initiative and asking questions during training. This level of engagement suggests they're truly invested in their development.

## Next Steps

Continue monitoring individual progress and adjust training plans as needed. Every player develops at their own pace, and personalized attention can make a big difference.

Keep up the great work!

Best regards,
Training Coordinator`
    },
    {
      subject: `Player Feedback: Training Intensity Paying Off`,
      body: `Dear ${managerName},

I've been observing the training sessions this month, and I wanted to share some positive observations.

## Player Development

${playerNames}${morePlayers} have been showing real commitment to improvement. Their work ethic during ${trainingPlan.teamFocus ? getTrainingFocusDisplayName(trainingPlan.teamFocus as any) : 'training'} sessions has been exemplary.

## Team Dynamics

The team is gelling well. Players are supporting each other and creating a positive training environment. This kind of team chemistry often translates to better performance in competition.

## Coach's Notes

The training plan you've set up is working well. Players are engaged and showing measurable progress. Keep building on this momentum!

All the best,
School Sports Coordinator`
    }
  ]

  const message = messages[Math.floor(Math.random() * messages.length)]

  // Generate timestamp for late in the month (day 20 to last day of month) so it appears recent when we advance to next month
  // This ensures the email appears in the past (a few days ago) when entering the new month
  const getDaysInMonth = (year: number, month: number): number => {
    // Month is 1-12, Date constructor expects 0-11
    return new Date(year, month, 0).getDate()
  }

  const daysInMonth = getDaysInMonth(year, month)
  const minDay = 20
  const maxDay = daysInMonth
  const emailDay = Math.floor(Math.random() * (maxDay - minDay + 1)) + minDay // Day 20 to last day of month

  return {
    id: `training-motivation-${year}-${month}-${Date.now()}`,
    from: 'Training Staff',
    subject: message.subject,
    body: message.body,
    timestamp: getInGameTimestamp(year, month, emailDay, 14, 0), // Late month, afternoon
    read: false,
    tags: [EmailTag.TRAINING, EmailTag.SOCIAL]
  }
}

/**
 * Generate training results email after training month
 */
export function generateTrainingResultsEmail(
  managerName: string,
  schoolName: string,
  players: Player[],
  teamRoster: string[],
  month: number,
  year: number,
  previousMonthSnapshots: SkillSnapshot[],
  trainingPlan: { teamFocus: string | null } | null
): Email | null {
  const teamPlayers = players.filter((p) => teamRoster.includes(p.id))
  if (teamPlayers.length === 0 || previousMonthSnapshots.length === 0) return null

  const monthName = MONTH_NAMES[month - 1]
  const topImprovers = getTopImprovers(previousMonthSnapshots, teamPlayers, 2)

  let body = `Dear ${managerName},

## ${monthName} Training Results Summary

I'm pleased to share the results from this month's training program.

### Overall Performance

The team has made solid progress this month. All players have been working hard, and the results speak for themselves.

`

  if (topImprovers.length > 0) {
    body += `### Standout Performers

${topImprovers
  .map(
    (improver: any, index: number) =>
      `${index + 1}. **${getPlayerFullName(improver.player)}** - Made significant improvements across all skills, showing excellent dedication to training.`
  )
  .join('\n')}

`
  }

  if (trainingPlan?.teamFocus) {
    body += `### Training Focus Impact

The focus on **${getTrainingFocusDisplayName(trainingPlan.teamFocus as any)}** has been effective. Players have shown improvement in the targeted areas, and the structured approach is paying dividends.

`
  }

  body += `### Looking Ahead

Continue building on this momentum. The foundation you're establishing now will be crucial for tournament success.

Keep up the excellent work!

Best regards,
Training Coordinator`

  return {
    id: `training-results-${year}-${month}-${Date.now()}`,
    from: 'Training Coordinator',
    subject: `${monthName} Training Results: Positive Progress`,
    body,
    timestamp: getInGameTimestamp(year, month, 28, 16, 0), // End of month
    read: false,
    tags: [EmailTag.TRAINING, EmailTag.ADMINISTRATIVE]
  }
}

/**
 * Get phase description text for emails
 */
function getPhaseDescription(phase: GamePhase, month: number): string {
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
      return `Welcome to the **Singles Selection** phase. Players will be notified of their selection for the national singles tournament based on their ELO rankings.`

    case GamePhase.SINGLES_TOURNAMENT:
      return `This is the **National Singles Tournament** phase! The top 64 boys and 64 girls from across the country will compete. This is a prestigious competition - best of luck to your players!`

    case GamePhase.GRADUATION:
      return `We've reached the **Graduation & Celebrations** phase. This is a time to reflect on the season, celebrate achievements, and prepare for the next year.`

    default:
      return `We're now in the **${getPhaseDisplayName(phase, month)}** phase. Continue managing your team effectively.`
  }
}
