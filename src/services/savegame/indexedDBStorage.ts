/**
 * IndexedDB Storage Utility
 * Handles large save files that exceed localStorage limits
 * IndexedDB can store much larger amounts of data (up to 10GB+ in many browsers)
 */

const DB_NAME = 'matchpointMaster_saves'
const DB_VERSION = 1
const SAVE_SLOTS_STORE = 'saveSlots'
const METADATA_STORE = 'metadata'

let dbPromise: Promise<IDBDatabase> | null = null

/**
 * Request persistent storage permission from the browser
 * This prevents the browser from evicting IndexedDB data when storage is low
 * Particularly important on mobile devices, but good practice for all platforms
 */
async function requestPersistentStorage(): Promise<void> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      await navigator.storage.persist()
      // Persistent storage request handled silently
    } catch {
      // Silently handle persistent storage request failure
    }
  }
}

/**
 * Check if persistent storage is currently granted
 * Useful for debugging or showing status to users
 */
export async function isPersistentStorageGranted(): Promise<boolean> {
  if ('storage' in navigator && 'persisted' in navigator.storage) {
    try {
      return await navigator.storage.persisted()
    } catch {
      return false
    }
  }
  return false
}

/**
 * Open or get the IndexedDB database
 * Reuses existing connection promise if already opening
 * Requests persistent storage on first open
 */
function openDB(): Promise<IDBDatabase> {
  // If we already have a promise, return it (handles concurrent requests)
  if (dbPromise) {
    return dbPromise
  }

  // Request persistent storage (fire and forget - don't block on this)
  requestPersistentStorage().catch(() => {
    // Silently fail - persistent storage is nice-to-have, not required
  })

  // Create new database connection
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      dbPromise = null
      reject(new Error(`Failed to open database: ${request.error?.message}`))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(SAVE_SLOTS_STORE)) {
        const saveSlotsStore = db.createObjectStore(SAVE_SLOTS_STORE, {
          keyPath: 'id'
        })
        saveSlotsStore.createIndex('lastPlayed', 'lastPlayed', { unique: false })
      }

      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: 'key' })
      }
    }
  })

  return dbPromise
}

/**
 * Get a value from the metadata store
 */
export async function getMetadata(key: string): Promise<string | null> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], 'readonly')
      const store = transaction.objectStore(METADATA_STORE)
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.value : null)
      }

      request.onerror = () => {
        reject(new Error(`Failed to get metadata: ${request.error?.message}`))
      }
    })
  } catch {
    return null
  }
}

/**
 * Set a value in the metadata store
 */
export async function setMetadata(key: string, value: string): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], 'readwrite')
      const store = transaction.objectStore(METADATA_STORE)
      const request = store.put({ key, value })

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Failed to set metadata: ${request.error?.message}`))
      }
    })
  } catch (error) {
    throw error
  }
}

/**
 * Delete a value from the metadata store
 */
export async function deleteMetadata(key: string): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], 'readwrite')
      const store = transaction.objectStore(METADATA_STORE)
      const request = store.delete(key)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Failed to delete metadata: ${request.error?.message}`))
      }
    })
  } catch (error) {
    throw error
  }
}

/**
 * Get all save slots from IndexedDB
 */
export async function getAllSaveSlots<T>(): Promise<T[]> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SAVE_SLOTS_STORE], 'readonly')
      const store = transaction.objectStore(SAVE_SLOTS_STORE)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result as T[])
      }

      request.onerror = () => {
        reject(new Error(`Failed to get save slots: ${request.error?.message}`))
      }
    })
  } catch {
    return []
  }
}

/**
 * Get a specific save slot by ID
 */
export async function getSaveSlot<T>(id: string): Promise<T | null> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SAVE_SLOTS_STORE], 'readonly')
      const store = transaction.objectStore(SAVE_SLOTS_STORE)
      const request = store.get(id)

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? (result as T) : null)
      }

      request.onerror = () => {
        reject(new Error(`Failed to get save slot: ${request.error?.message}`))
      }
    })
  } catch {
    return null
  }
}

/**
 * Save a save slot to IndexedDB
 */
export async function saveSaveSlot<T extends { id: string }>(slot: T): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SAVE_SLOTS_STORE], 'readwrite')
      const store = transaction.objectStore(SAVE_SLOTS_STORE)
      const request = store.put(slot)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Failed to save save slot: ${request.error?.message}`))
      }
    })
  } catch (error) {
    throw error
  }
}

/**
 * Delete a save slot from IndexedDB
 */
export async function deleteSaveSlot(id: string): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SAVE_SLOTS_STORE], 'readwrite')
      const store = transaction.objectStore(SAVE_SLOTS_STORE)
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Failed to delete save slot: ${request.error?.message}`))
      }
    })
  } catch (error) {
    throw error
  }
}

/**
 * Clear all save slots (useful for testing or reset)
 */
export async function clearAllSaveSlots(): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SAVE_SLOTS_STORE], 'readwrite')
      const store = transaction.objectStore(SAVE_SLOTS_STORE)
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Failed to clear save slots: ${request.error?.message}`))
      }
    })
  } catch (error) {
    throw error
  }
}
