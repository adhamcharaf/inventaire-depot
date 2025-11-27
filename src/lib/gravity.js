/**
 * Logique de gravité pour les cubes
 * - Retrait: cascade vers le haut (tous les cubes au-dessus tombent)
 * - Ajout: uniquement si support en-dessous
 */

// Convertir Set en Array pour stockage
export function cubesSetToArray(cubesSet) {
  return Array.from(cubesSet)
}

// Convertir Array en Set pour manipulation
export function cubesArrayToSet(cubesArray) {
  return new Set(cubesArray)
}

// Parse une position "x,y,z" en objet
export function parsePosition(pos) {
  const [x, y, z] = pos.split(',').map(Number)
  return { x, y, z }
}

// Créer une clé de position
export function positionKey(x, y, z) {
  return `${x},${y},${z}`
}

/**
 * Retirer un cube et tous ceux au-dessus (gravité)
 */
export function removeCubeWithGravity(cubesArray, x, y, z, maxHeight) {
  const cubesSet = cubesArrayToSet(cubesArray)

  // Retirer le cube cliqué et tous ceux au-dessus
  for (let h = z; h < maxHeight; h++) {
    cubesSet.delete(positionKey(x, y, h))
  }

  return cubesSetToArray(cubesSet)
}

/**
 * Ajouter un cube (seulement si support existe)
 */
export function addCube(cubesArray, x, y, z) {
  const cubesSet = cubesArrayToSet(cubesArray)
  const key = positionKey(x, y, z)

  // Vérifier si le cube existe déjà
  if (cubesSet.has(key)) {
    return cubesArray
  }

  // Niveau 0 = toujours OK
  // Sinon, vérifier qu'il y a un support en-dessous
  if (z === 0 || cubesSet.has(positionKey(x, y, z - 1))) {
    cubesSet.add(key)
    return cubesSetToArray(cubesSet)
  }

  return cubesArray
}

/**
 * Vérifier si un cube existe
 */
export function hasCube(cubesArray, x, y, z) {
  return cubesArray.includes(positionKey(x, y, z))
}

/**
 * Générer tous les cubes (palette pleine)
 */
export function generateFullCubes(dimensions) {
  const cubes = []
  for (let x = 0; x < dimensions.length; x++) {
    for (let y = 0; y < dimensions.width; y++) {
      for (let z = 0; z < dimensions.height; z++) {
        cubes.push(positionKey(x, y, z))
      }
    }
  }
  return cubes
}

/**
 * Vider tous les cubes
 */
export function emptyAllCubes() {
  return []
}
