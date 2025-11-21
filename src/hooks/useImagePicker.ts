import { useState, useCallback } from 'react'

/**
 * Custom hook for managing image picker dialog state
 */
export const useImagePicker = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const openDialog = useCallback(() => {
    setIsDialogOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
  }, [])

  return {
    isDialogOpen,
    openDialog,
    closeDialog
  }
}
