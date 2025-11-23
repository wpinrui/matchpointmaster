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

