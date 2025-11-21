/**
 * Date formatting utilities
 */

/**
 * Format a timestamp as a readable date and time string
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
}
