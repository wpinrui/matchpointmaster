/**
 * Format email timestamp as in-game date
 * Since timestamps are already set to in-game dates, we just format them nicely
 */
export function formatEmailDate(timestamp: number): string {
  const date = new Date(timestamp)
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const day = date.getDate()
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  const hour = date.getHours()
  const minute = date.getMinutes()

  // Format time
  const hour12 = hour % 12 || 12
  const ampm = hour < 12 ? 'AM' : 'PM'
  const minuteStr = minute.toString().padStart(2, '0')
  const timeStr = `${hour12}:${minuteStr} ${ampm}`

  // Return formatted date
  return `${month} ${day}, ${year} at ${timeStr}`
}

/**
 * Format email timestamp for card preview (shorter format)
 */
export function formatEmailDateShort(
  timestamp: number,
  currentSeasonYear: number,
  currentSeasonMonth: number
): string {
  const date = new Date(timestamp)
  const emailYear = date.getFullYear()
  const emailMonth = date.getMonth() + 1
  const emailDay = date.getDate()

  // Calculate difference in months/days from current in-game date
  const currentDate = new Date(currentSeasonYear, currentSeasonMonth - 1, 1)
  const emailDate = new Date(emailYear, emailMonth - 1, emailDay)

  const diffMs = currentDate.getTime() - emailDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (emailYear === currentSeasonYear && emailMonth === currentSeasonMonth) {
    // Same month, just show day
    return `${emailDay} ${getMonthName(emailMonth)}`
  } else {
    // Different month/year
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
    return `${monthNames[emailMonth - 1]} ${emailDay}`
  }
}

function getMonthName(month: number): string {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
  return monthNames[month - 1]
}
