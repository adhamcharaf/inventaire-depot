const DB_NAME = 'inventaire-palettes'
const DB_VERSION = 1
const STORE_NAME = 'palettes'

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
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
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

export async function createPalette(dimensions, name = '') {
  const database = await openDB()
  const cubes = generateFullCubes(dimensions)
  const now = Date.now()

  const palette = {
    id: generateId(),
    name: name || `Palette ${new Date().toLocaleDateString('fr-FR')}`,
    dimensions,
    cubes,
    stats: calculateStats(cubes, dimensions),
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
