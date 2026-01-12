const DB_NAME = 'inventaire-palettes'
const DB_VERSION = 4
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

function calculateStats(cubes, dimensions, extraCartons = 0, paletteType = 'classic') {
  let capacity, present

  if (paletteType === 'simple') {
    // Palette coupée: base × hauteur
    capacity = dimensions.base * dimensions.height
    present = capacity // Toujours pleine
  } else {
    // Palette classique: L × l × H
    capacity = dimensions.length * dimensions.width * dimensions.height
    present = cubes.length
  }

  const totalPresent = present + extraCartons
  return {
    capacity,
    present,
    extraCartons,
    totalPresent,
    fillRate: ((present / capacity) * 100).toFixed(1)
  }
}

export async function createPalette(dimensions, name = '', reference = null, paletteType = 'classic') {
  const database = await openDB()
  const now = Date.now()

  // Pour les palettes simples (coupées), pas de cubes 3D
  const cubes = paletteType === 'simple' ? [] : generateFullCubes(dimensions)

  const palette = {
    id: generateId(),
    name: name || `Palette ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
    type: paletteType,
    dimensions,
    cubes,
    extraCartons: 0,
    stats: calculateStats(cubes, dimensions, 0, paletteType),
    reference,
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
  const paletteType = palette.type || 'classic'
  const updated = {
    ...palette,
    extraCartons,
    stats: calculateStats(palette.cubes, palette.dimensions, extraCartons, paletteType),
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
