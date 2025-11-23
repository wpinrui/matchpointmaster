/**
 * Save Manager - Handles multiple save slots in IndexedDB
 * Uses IndexedDB to support large save files (99 AI schools with players)
 */

import { initialSaveData } from './initialSaveData'
import { migrateSaveData, needsMigration } from './migrations'
import { SaveData } from './types'
import {
  getAllSaveSlots as getAllSaveSlotsFromDB,
  getSaveSlot as getSaveSlotFromDB,
  saveSaveSlot as saveSaveSlotToDB,
  deleteSaveSlot as deleteSaveSlotFromDB
} from './indexedDBStorage'

export type SaveSlot = {
  id: string
  name: string
  data: SaveData
  createdAt: number
  lastPlayed: number
}

const CURRENT_SAVE_ID_KEY = 'matchpointMaster_currentSaveId'

/**
 * Get all save slots from IndexedDB
 */
export const getAllSaveSlots = async (): Promise<SaveSlot[]> => {
  try {
    return await getAllSaveSlotsFromDB<SaveSlot>()
  } catch (error) {
    console.error('Error loading save slots:', error)
    return []
  }
}

/**
 * Get a specific save slot by ID
 */
export const getSaveSlot = async (id: string): Promise<SaveSlot | null> => {
  try {
    return await getSaveSlotFromDB<SaveSlot>(id)
  } catch (error) {
    console.error('Error getting save slot:', error)
    return null
  }
}

/**
 * Create a new save slot
 */
export const createSaveSlot = async (name: string, data: SaveData): Promise<SaveSlot> => {
  const now = Date.now()
  const newSlot: SaveSlot = {
    id: crypto.randomUUID(),
    name,
    data,
    createdAt: now,
    lastPlayed: now
  }
  await saveSaveSlotToDB(newSlot)
  return newSlot
}

/**
 * Update an existing save slot
 */
export const updateSaveSlot = async (id: string, data: SaveData): Promise<void> => {
  const existingSlot = await getSaveSlotFromDB<SaveSlot>(id)
  if (existingSlot) {
    const updatedSlot: SaveSlot = {
      ...existingSlot,
      data,
      lastPlayed: Date.now()
    }
    await saveSaveSlotToDB(updatedSlot)
  }
}

/**
 * Delete a save slot
 */
export const deleteSaveSlot = async (id: string): Promise<void> => {
  await deleteSaveSlotFromDB(id)

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
 */
export const getCurrentSaveData = async (): Promise<SaveData> => {
  const currentSaveId = getCurrentSaveId()
  if (!currentSaveId) {
    return initialSaveData
  }
  const slot = await getSaveSlot(currentSaveId)
  if (!slot) {
    return initialSaveData
  }

  // Migrate data structure if needed (for save data format changes, not storage migration)
  if (needsMigration(slot.data)) {
    const migratedData = migrateSaveData(slot.data)
    // Update the slot with migrated data
    await updateSaveSlot(currentSaveId, migratedData)
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
 * Import save slot from JSON string and save it to IndexedDB
 */
export const importSaveSlotFromJson = async (json: string): Promise<SaveSlot | null> => {
  try {
    const slot = JSON.parse(json) as SaveSlot
    // Validate structure
    if (slot && slot.id && slot.name && slot.data && slot.createdAt && slot.lastPlayed) {
      await saveSaveSlotToDB(slot)
      return slot
    }
    return null
  } catch (error) {
    console.error('Error importing save slot:', error)
    return null
  }
}
