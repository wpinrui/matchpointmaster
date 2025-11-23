import { Email, EmailTag, SaveData } from '../../services/savegame/types'
import { calculateMaxTeamSize } from '../schoolReputation'
import { getTeamCompositionRequirements } from '../teamTypeDisplay'
import { getInGameTimestamp } from './emailHelpers'

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
