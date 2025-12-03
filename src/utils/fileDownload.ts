/**
 * File download utilities
 */

/**
 * Download a JSON string as a file
 */
export function downloadJsonFile(json: string, filename: string): void {
  try {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    throw error
  }
}

/**
 * Sanitize a string for use in a filename
 */
export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_')
}
