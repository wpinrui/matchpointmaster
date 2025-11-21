import { useCallback, useRef } from 'react'

interface UseFileImportOptions {
  onImport: (content: string) => void
  onError?: (error: Error) => void
  accept?: string
}

/**
 * Hook for handling file imports
 */
export const useFileImport = ({
  onImport,
  onError,
  accept = '.json'
}: UseFileImportOptions) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          if (content) {
            onImport(content)
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Unknown error')
          onError?.(err)
        }
      }
      reader.onerror = () => {
        onError?.(new Error('Failed to read file'))
      }
      reader.readAsText(file)
      // Reset file input
      event.target.value = ''
    },
    [onImport, onError]
  )

  return {
    fileInputRef,
    handleImport,
    handleFileChange,
    accept
  }
}

