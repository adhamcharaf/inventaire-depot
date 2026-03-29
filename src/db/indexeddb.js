const DB_NAME = 'inventaire-palettes'
const DB_VERSION = 5
const STORE_NAME = 'palettes'
const GROUPS_STORE = 'groups' // Gardé pour migration

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
      const tx = event.target.transaction

      // Store des palettes
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
        store.createIndex('reference', 'reference', { unique: false })
      }

      // Store des groupes (pour migration, sera vidé)
      if (!database.objectStoreNames.contains(GROUPS_STORE)) {
        database.createObjectStore(GROUPS_STORE, { keyPath: 'id' })
      }

      // Migration v3 → v4: groupId → reference
      if (event.oldVersion < 4 && event.oldVersion >= 2) {
        const paletteStore = tx.objectStore(STORE_NAME)
        const groupStore = tx.objectStore(GROUPS_STORE)

        // Créer l'index reference si pas existant
        if (!paletteStore.indexNames.contains('reference')) {
          paletteStore.createIndex('reference', 'reference', { unique: false })
        }

        // Charger tous les groupes pour la migration
        const groupsMap = new Map()
        const groupRequest = groupStore.getAll()

        groupRequest.onsuccess = () => {
          const groups = groupRequest.result || []
          groups.forEach(g => groupsMap.set(g.id, g.name))

          // Migrer les palettes
          const cursorRequest = paletteStore.openCursor()
          cursorRequest.onsuccess = (e) => {
            const cursor = e.target.result
            if (cursor) {
              const palette = cursor.value
              if (palette.groupId && groupsMap.has(palette.groupId)) {
                palette.reference = groupsMap.get(palette.groupId)
              } else {
                palette.reference = null
              }
              delete palette.groupId
              cursor.update(palette)
              cursor.continue()
            } else {
              // Migration terminée, vider le store des groupes
              groupStore.clear()
            }
          }
        }

        // Supprimer l'ancien index groupId si existe
        if (paletteStore.indexNames.contains('groupId')) {
          paletteStore.deleteIndex('groupId')
        }
      }

      // Migration v4 → v5: add session/user/sync fields
      if (event.oldVersion < 5) {
        const paletteStore = tx.objectStore(STORE_NAME)

        // Add sessionId index
        if (!paletteStore.indexNames.contains('sessionId')) {
          paletteStore.createIndex('sessionId', 'sessionId', { unique: false })
        }
        // Add syncStatus index
        if (!paletteStore.indexNames.contains('syncStatus')) {
          paletteStore.createIndex('syncStatus', 'syncStatus', { unique: false })
        }

        // Migrate existing palettes: add new fields
        const cursorRequest = paletteStore.openCursor()
        cursorRequest.onsuccess = (e) => {
          const cursor = e.target.result
          if (cursor) {
            const palette = cursor.value
            if (!palette.sessionId) palette.sessionId = null
            if (!palette.userName) palette.userName = null
            if (!palette.syncStatus) palette.syncStatus = 'local'
            if (!palette.submittedAt) palette.submittedAt = null
            cursor.update(palette)
            cursor.continue()
          }
        }
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

function calculateStats(cubes, dimensions, extraCartons = 0) {
  const capacity = dimensions.length * dimensions.width * dimensions.height
  const present = cubes.length
  const totalPresent = present + extraCartons
  return {
    capacity,
    present,
    extraCartons,
    totalPresent,
    fillRate: ((present / capacity) * 100).toFixed(1)
  }
}

export async function createPalette(dimensions, name = '', reference = null, sessionId = null, userName = null) {
  const database = await openDB()
  const cubes = generateFullCubes(dimensions)
  const now = Date.now()

  const palette = {
    id: generateId(),
    name: name || `Palette ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
    dimensions,
    cubes,
    extraCartons: 0,
    stats: calculateStats(cubes, dimensions, 0),
    reference,
    sessionId,
    userName,
    syncStatus: 'local',
    submittedAt: null,
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

  const extraCartons = palette.extraCartons || 0
  const updated = {
    ...palette,
    extraCartons,
    stats: calculateStats(palette.cubes, palette.dimensions, extraCartons),
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

export async function updatePaletteReference(paletteId, reference) {
  const palette = await getPalette(paletteId)

  if (palette) {
    palette.reference = reference
    return updatePalette(palette)
  }
  return null
}

// Submit all unsubmitted palettes for a session/user
export async function submitAllPalettes(sessionId, userName) {
  const all = await getAllPalettes()
  const toSubmit = all.filter(p =>
    p.sessionId === sessionId &&
    p.userName === userName &&
    p.syncStatus === 'local'
  )

  const database = await openDB()
  const tx = database.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const now = Date.now()

  for (const palette of toSubmit) {
    palette.syncStatus = 'pending'
    palette.submittedAt = now
    store.put(palette)
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(toSubmit.length)
    tx.onerror = () => reject(tx.error)
  })
}

// Get all palettes pending sync
export async function getPendingPalettes() {
  const all = await getAllPalettes()
  return all.filter(p => p.syncStatus === 'pending')
}

// Manual count CRUD
export async function createManualCount(reference, total, entries, sessionId, userName, existingId = null) {
  const database = await openDB()
  const now = Date.now()

  const record = {
    id: existingId || generateId(),
    name: `Manuel: ${reference}`,
    dimensions: null,
    cubes: [],
    extraCartons: 0,
    stats: { capacity: 0, present: 0, extraCartons: 0, totalPresent: total, fillRate: '0' },
    reference,
    sessionId,
    userName,
    countMode: 'manual',
    manualCount: total,
    entries,
    syncStatus: 'local',
    submittedAt: null,
    createdAt: existingId ? undefined : now,
    updatedAt: now,
  }

  // Preserve createdAt if updating
  if (existingId) {
    const existing = await getPalette(existingId)
    if (existing) record.createdAt = existing.createdAt
  }
  if (!record.createdAt) record.createdAt = now

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(record)
    request.onsuccess = () => resolve(record)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllManualCounts(sessionId, userName) {
  const all = await getAllPalettes()
  return all.filter(p =>
    p.sessionId === sessionId &&
    p.userName === userName &&
    p.countMode === 'manual'
  )
}

export async function deleteManualCount(id) {
  return deletePalette(id)
}

// Mark a palette as synced
export async function markPaletteSynced(id) {
  const palette = await getPalette(id)
  if (palette) {
    palette.syncStatus = 'synced'
    return updatePalette(palette)
  }
  return null
}
