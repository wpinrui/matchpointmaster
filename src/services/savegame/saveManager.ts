/**
 * Save Manager - Handles multiple save slots in localStorage
 */

import { initialSaveData } from './initialSaveData'
import { migrateSaveData, needsMigration } from './migrations'
import { SaveData } from './types'

export type SaveSlot = {
  id: string
  name: string
  data: SaveData
  createdAt: number
  lastPlayed: number
}

const SAVE_SLOTS_KEY = 'matchpointMaster_saveSlots'
const CURRENT_SAVE_ID_KEY = 'matchpointMaster_currentSaveId'

/**
 * Get all save slots from localStorage
 */
export const getAllSaveSlots = (): SaveSlot[] => {
  try {
    const savedSlots = localStorage.getItem(SAVE_SLOTS_KEY)
    if (!savedSlots) {
      return []
    }
    return JSON.parse(savedSlots) as SaveSlot[]
  } catch (error) {
    console.error('Error loading save slots:', error)
    return []
  }
}

/**
 * Save all save slots to localStorage
 */
export const saveAllSaveSlots = (slots: SaveSlot[]): void => {
  try {
    localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots))
  } catch (error) {
    console.error('Error saving save slots:', error)
  }
}

/**
 * Get a specific save slot by ID
 */
export const getSaveSlot = (id: string): SaveSlot | null => {
  const slots = getAllSaveSlots()
  return slots.find((slot) => slot.id === id) || null
}

/**
 * Create a new save slot
 */
export const createSaveSlot = (name: string, data: SaveData): SaveSlot => {
  const now = Date.now()
  const newSlot: SaveSlot = {
    id: crypto.randomUUID(),
    name,
    data,
    createdAt: now,
    lastPlayed: now
  }
  const slots = getAllSaveSlots()
  slots.push(newSlot)
  saveAllSaveSlots(slots)
  return newSlot
}

/**
 * Update an existing save slot
 */
export const updateSaveSlot = (id: string, data: SaveData): void => {
  const slots = getAllSaveSlots()
  const slotIndex = slots.findIndex((slot) => slot.id === id)
  if (slotIndex !== -1) {
    slots[slotIndex].data = data
    slots[slotIndex].lastPlayed = Date.now()
    saveAllSaveSlots(slots)
  }
}

/**
 * Delete a save slot
 */
export const deleteSaveSlot = (id: string): void => {
  const slots = getAllSaveSlots()
  const filteredSlots = slots.filter((slot) => slot.id !== id)
  saveAllSaveSlots(filteredSlots)

  // If we deleted the current save, clear the current save ID
  const currentSaveId = getCurrentSaveId()
  if (currentSaveId === id) {
    clearCurrentSaveId()
  }
}

/**
 * Get the current active save ID
 */
export const getCurrentSaveId = (): string | null => {
  try {
    return localStorage.getItem(CURRENT_SAVE_ID_KEY)
  } catch (error) {
    console.error('Error getting current save ID:', error)
    return null
  }
}

/**
 * Set the current active save ID
 */
export const setCurrentSaveId = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem(CURRENT_SAVE_ID_KEY, id)
    } else {
      localStorage.removeItem(CURRENT_SAVE_ID_KEY)
    }
  } catch (error) {
    console.error('Error setting current save ID:', error)
  }
}

/**
 * Clear the current save ID
 */
export const clearCurrentSaveId = (): void => {
  try {
    localStorage.removeItem(CURRENT_SAVE_ID_KEY)
  } catch (error) {
    console.error('Error clearing current save ID:', error)
  }
}

/**
 * Get the current active save data
 * Ensures backward compatibility by migrating old save data if needed
 */
export const getCurrentSaveData = (): SaveData => {
  const currentSaveId = getCurrentSaveId()
  if (!currentSaveId) {
    return initialSaveData
  }
  const slot = getSaveSlot(currentSaveId)
  if (!slot) {
    return initialSaveData
  }

  // Migrate data if needed
  if (needsMigration(slot.data)) {
    const migratedData = migrateSaveData(slot.data)
    // Update the slot with migrated data
    updateSaveSlot(currentSaveId, migratedData)
    return migratedData
  }

  return slot.data
}

/**
 * Export save slot to JSON string
 */
export const exportSaveSlotToJson = (slot: SaveSlot): string => {
  return JSON.stringify(slot, null, 2)
}

/**
 * Import save slot from JSON string
 */
export const importSaveSlotFromJson = (json: string): SaveSlot | null => {
  try {
    const slot = JSON.parse(json) as SaveSlot
    // Validate structure
    if (slot && slot.id && slot.name && slot.data && slot.createdAt && slot.lastPlayed) {
      return slot
    }
    return null
  } catch (error) {
    console.error('Error importing save slot:', error)
    return null
  }
}
