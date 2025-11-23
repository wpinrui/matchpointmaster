import { Email, EmailTag, SkillSnapshot, Player } from '../services/savegame/types'
import { GamePhase, getPhaseDisplayName } from './gamePhases'
import { MONTH_NAMES } from './constants'
import {
  getTopImprovers,
  calculateTeamAverageImprovement,
  calculateTeamTotalImprovement
} from './trainingInsights'
import { getTrainingFocusDisplayName } from './trainingPlans'
import { getPlayerFullName } from './playerGeneration'
import { generateInitialEmails as generateInitialEmailsImpl } from './emailGenerators/initialEmails'
import { getInGameTimestamp } from './emailGenerators/emailHelpers'
import { getPhaseDescription } from './emailGenerators/phaseDescription'

// Re-export for backwards compatibility
export { getInGameTimestamp } from './emailGenerators/emailHelpers'
export { generateInitialEmails } from './emailGenerators/initialEmails'

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
