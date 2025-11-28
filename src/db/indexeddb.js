const DB_NAME = 'inventaire-palettes'
const DB_VERSION = 2
const STORE_NAME = 'palettes'
const GROUPS_STORE = 'groups'

let db = null

function openDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      // Store des palettes
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
        store.createIndex('groupId', 'groupId', { unique: false })
      } else if (event.oldVersion < 2) {
        // Migration: ajouter l'index groupId aux palettes existantes
        const tx = event.target.transaction
        const store = tx.objectStore(STORE_NAME)
        if (!store.indexNames.contains('groupId')) {
          store.createIndex('groupId', 'groupId', { unique: false })
        }
      }

      // Store des groupes
      if (!database.objectStoreNames.contains(GROUPS_STORE)) {
        const groupStore = database.createObjectStore(GROUPS_STORE, { keyPath: 'id' })
        groupStore.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

function generateFullCubes(dimensions) {
  const cubes = []
  for (let x = 0; x < dimensions.length; x++) {
    for (let y = 0; y < dimensions.width; y++) {
      for (let z = 0; z < dimensions.height; z++) {
        cubes.push(`${x},${y},${z}`)
      }
    }
  }
  return cubes
}

function calculateStats(cubes, dimensions) {
  const capacity = dimensions.length * dimensions.width * dimensions.height
  const present = cubes.length
  return {
    capacity,
    present,
    fillRate: ((present / capacity) * 100).toFixed(1)
  }
}

export async function createPalette(dimensions, name = '', groupId = null) {
  const database = await openDB()
  const cubes = generateFullCubes(dimensions)
  const now = Date.now()

  const palette = {
    id: generateId(),
    name: name || `Palette ${new Date().toLocaleDateString('fr-FR')}`,
    dimensions,
    cubes,
    stats: calculateStats(cubes, dimensions),
    groupId,
    createdAt: now,
    updatedAt: now
  }

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.add(palette)

    request.onsuccess = () => resolve(palette)
    request.onerror = () => reject(request.error)
  })
}

export async function getPalette(id) {
  const database = await openDB()

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllPalettes() {
  const database = await openDB()

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      const palettes = request.result.sort((a, b) => b.updatedAt - a.updatedAt)
      resolve(palettes)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function updatePalette(palette) {
  const database = await openDB()

  const updated = {
    ...palette,
    stats: calculateStats(palette.cubes, palette.dimensions),
    updatedAt: Date.now()
  }

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(updated)

    request.onsuccess = () => resolve(updated)
    request.onerror = () => reject(request.error)
  })
}

export async function deletePalette(id) {
  const database = await openDB()

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// ==================== GROUPES ====================

export async function createGroup(name) {
  const database = await openDB()
  const now = Date.now()

  const group = {
    id: generateId(),
    name: name || `Groupe ${new Date().toLocaleDateString('fr-FR')}`,
    createdAt: now
  }

  return new Promise((resolve, reject) => {
    const tx = database.transaction(GROUPS_STORE, 'readwrite')
    const store = tx.objectStore(GROUPS_STORE)
    const request = store.add(group)

    request.onsuccess = () => resolve(group)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllGroups() {
  const database = await openDB()

  return new Promise((resolve, reject) => {
    const tx = database.transaction(GROUPS_STORE, 'readonly')
    const store = tx.objectStore(GROUPS_STORE)
    const request = store.getAll()

    request.onsuccess = () => {
      const groups = request.result.sort((a, b) => a.createdAt - b.createdAt)
      resolve(groups)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function updateGroup(group) {
  const database = await openDB()

  return new Promise((resolve, reject) => {
    const tx = database.transaction(GROUPS_STORE, 'readwrite')
    const store = tx.objectStore(GROUPS_STORE)
    const request = store.put(group)

    request.onsuccess = () => resolve(group)
    request.onerror = () => reject(request.error)
  })
}

export async function deleteGroup(id) {
  const database = await openDB()

  // Supprimer le groupe et retirer le groupId des palettes associées
  return new Promise((resolve, reject) => {
    const tx = database.transaction([GROUPS_STORE, STORE_NAME], 'readwrite')

    // Supprimer le groupe
    const groupStore = tx.objectStore(GROUPS_STORE)
    groupStore.delete(id)

    // Retirer le groupId des palettes associées
    const paletteStore = tx.objectStore(STORE_NAME)
    const index = paletteStore.index('groupId')
    const request = index.openCursor(IDBKeyRange.only(id))

    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        const palette = cursor.value
        palette.groupId = null
        paletteStore.put(palette)
        cursor.continue()
      }
    }

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function updatePaletteGroup(paletteId, groupId) {
  const database = await openDB()
  const palette = await getPalette(paletteId)

  if (palette) {
    palette.groupId = groupId
    return updatePalette(palette)
  }
  return null
}
