import * as THREE from 'three'
import { CUBE_COLORS } from './config'

// Constantes de couleur pour le gradient
const COLOR_BOTTOM = new THREE.Color(0x6B4E0A)  // Carton très foncé (marron)
const COLOR_TOP = new THREE.Color(0xF5E6C8)     // Carton très clair (beige)
const COLOR_HOVER = new THREE.Color(CUBE_COLORS.hover)

// Géométries partagées (créées une seule fois)
let sharedCubeGeometry = null
let sharedEdgesPositions = null

function getSharedGeometries() {
  if (!sharedCubeGeometry) {
    sharedCubeGeometry = new THREE.BoxGeometry(0.9, 0.9, 0.9)
  }
  if (!sharedEdgesPositions) {
    // Générer les positions des edges d'un cube de taille 0.9
    const s = 0.45 // half size
    // 12 edges = 24 vertices (2 per edge)
    sharedEdgesPositions = new Float32Array([
      // Bottom face
      -s, -s, -s,  s, -s, -s,
       s, -s, -s,  s, -s,  s,
       s, -s,  s, -s, -s,  s,
      -s, -s,  s, -s, -s, -s,
      // Top face
      -s,  s, -s,  s,  s, -s,
       s,  s, -s,  s,  s,  s,
       s,  s,  s, -s,  s,  s,
      -s,  s,  s, -s,  s, -s,
      // Vertical edges
      -s, -s, -s, -s,  s, -s,
       s, -s, -s,  s,  s, -s,
       s, -s,  s,  s,  s,  s,
      -s, -s,  s, -s,  s,  s
    ])
  }
  return { cubeGeometry: sharedCubeGeometry, edgesPositions: sharedEdgesPositions }
}

/**
 * Gestionnaire des cubes optimisé avec InstancedMesh
 */
export class CubeManager {
  constructor(scene, dimensions, options = {}) {
    this.scene = scene
    this.dimensions = dimensions
    this.performanceMode = options.performanceMode || false

    // Capacité max (on peut ajuster dynamiquement)
    this.maxInstances = dimensions.length * dimensions.width * dimensions.height

    // Map position -> instanceId
    this.positionToInstance = new Map()
    // Map instanceId -> position string
    this.instanceToPosition = new Map()

    // Instance count actuel
    this.instanceCount = 0

    // Highlighted instance
    this.highlightedInstanceId = null
    this.highlightedOriginalColor = null

    // Callback pour demander un re-render
    this.onNeedsRender = options.onNeedsRender || (() => {})

    this._createMeshes()
  }

  _createMeshes() {
    const { cubeGeometry, edgesPositions } = getSharedGeometries()

    // Matériau pour les cubes
    const material = this.performanceMode
      ? new THREE.MeshBasicMaterial({ vertexColors: true })
      : new THREE.MeshLambertMaterial({ vertexColors: true })

    // InstancedMesh pour les cubes
    this.instancedMesh = new THREE.InstancedMesh(
      cubeGeometry,
      material,
      this.maxInstances
    )
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.instancedMesh.count = 0
    this.scene.add(this.instancedMesh)

    // BufferGeometry pour les edges (on la reconstruira à chaque update)
    this.edgesGeometry = new THREE.BufferGeometry()
    this.edgesMaterial = new THREE.LineBasicMaterial({ color: CUBE_COLORS.edge })
    this.edgesLine = new THREE.LineSegments(this.edgesGeometry, this.edgesMaterial)
    this.scene.add(this.edgesLine)

    // Dummy pour les transformations
    this._dummy = new THREE.Object3D()
    this._color = new THREE.Color()
  }

  /**
   * Calculer la couleur selon le niveau Z
   */
  _getColorForLevel(z) {
    const t = this.dimensions.height > 1 ? z / (this.dimensions.height - 1) : 0.5
    return this._color.lerpColors(COLOR_BOTTOM, COLOR_TOP, t)
  }

  /**
   * Mettre à jour tous les cubes selon l'état actuel
   */
  updateCubes(cubesArray) {
    // Convertir le tableau en Set pour comparaison rapide
    const cubesSet = new Set(cubesArray)

    // Reset les maps
    this.positionToInstance.clear()
    this.instanceToPosition.clear()
    this.highlightedInstanceId = null

    // Créer un array pour les positions des edges
    const { edgesPositions } = getSharedGeometries()
    const edgesVertices = []

    // Mettre à jour les instances
    let instanceId = 0

    cubesArray.forEach(pos => {
      const [x, y, z] = pos.split(',').map(Number)

      // Position (y = hauteur dans Three.js, donc z de notre système)
      this._dummy.position.set(x, z, y)
      this._dummy.updateMatrix()

      this.instancedMesh.setMatrixAt(instanceId, this._dummy.matrix)
      this.instancedMesh.setColorAt(instanceId, this._getColorForLevel(z))

      // Stocker le mapping
      this.positionToInstance.set(pos, instanceId)
      this.instanceToPosition.set(instanceId, pos)

      // Ajouter les edges pour ce cube
      for (let i = 0; i < edgesPositions.length; i += 3) {
        edgesVertices.push(
          edgesPositions[i] + x,
          edgesPositions[i + 1] + z,
          edgesPositions[i + 2] + y
        )
      }

      instanceId++
    })

    // Mettre à jour l'InstancedMesh
    this.instanceCount = instanceId
    this.instancedMesh.count = this.instanceCount
    this.instancedMesh.instanceMatrix.needsUpdate = true
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true
    }
    // Recalculer le bounding sphere pour le raycasting
    this.instancedMesh.computeBoundingSphere()

    // Mettre à jour les edges
    this.edgesGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(edgesVertices, 3)
    )

    this.onNeedsRender()
  }

  /**
   * Obtenir les infos d'un cube à une position
   */
  getCubeInfo(x, y, z) {
    const pos = `${x},${y},${z}`
    const instanceId = this.positionToInstance.get(pos)
    if (instanceId === undefined) return null
    return { x, y, z, instanceId, isPresent: true }
  }

  /**
   * Trouver le cube sous le raycaster
   */
  raycast(raycaster) {
    const intersects = raycaster.intersectObject(this.instancedMesh)

    if (intersects.length > 0) {
      const instanceId = intersects[0].instanceId
      const pos = this.instanceToPosition.get(instanceId)
      if (pos) {
        const [x, y, z] = pos.split(',').map(Number)
        return { x, y, z, instanceId, isPresent: true }
      }
    }

    return null
  }

  /**
   * Mettre en surbrillance un cube par son instanceId
   */
  highlight(instanceId) {
    if (instanceId === this.highlightedInstanceId) return

    // Restaurer l'ancien
    if (this.highlightedInstanceId !== null && this.highlightedOriginalColor) {
      this.instancedMesh.setColorAt(this.highlightedInstanceId, this.highlightedOriginalColor)
    }

    // Appliquer le nouveau highlight
    if (instanceId !== null) {
      const pos = this.instanceToPosition.get(instanceId)
      if (pos) {
        const [, , z] = pos.split(',').map(Number)
        this.highlightedOriginalColor = this._getColorForLevel(z).clone()
        this.instancedMesh.setColorAt(instanceId, COLOR_HOVER)
      }
    }

    this.highlightedInstanceId = instanceId

    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true
    }
    this.onNeedsRender()
  }

  /**
   * Retirer la surbrillance
   */
  unhighlight() {
    if (this.highlightedInstanceId !== null && this.highlightedOriginalColor) {
      this.instancedMesh.setColorAt(this.highlightedInstanceId, this.highlightedOriginalColor)
      if (this.instancedMesh.instanceColor) {
        this.instancedMesh.instanceColor.needsUpdate = true
      }
    }
    this.highlightedInstanceId = null
    this.highlightedOriginalColor = null
    this.onNeedsRender()
  }

  /**
   * Changer le mode performance
   */
  setPerformanceMode(enabled) {
    if (this.performanceMode === enabled) return

    this.performanceMode = enabled

    // Changer le matériau
    this.instancedMesh.material.dispose()
    this.instancedMesh.material = enabled
      ? new THREE.MeshBasicMaterial({ vertexColors: true })
      : new THREE.MeshLambertMaterial({ vertexColors: true })

    this.onNeedsRender()
  }

  /**
   * Nettoyer
   */
  dispose() {
    this.scene.remove(this.instancedMesh)
    this.scene.remove(this.edgesLine)
    this.instancedMesh.geometry.dispose()
    this.instancedMesh.material.dispose()
    this.edgesGeometry.dispose()
    this.edgesMaterial.dispose()
    this.positionToInstance.clear()
    this.instanceToPosition.clear()
  }
}

/**
 * Gestion du raycasting pour les clics
 */
export class RaycastManager {
  constructor(camera, cubeManager) {
    this.camera = camera
    this.cubeManager = cubeManager
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
  }

  /**
   * Trouver le cube sous le pointeur
   */
  findCubeAtPointer(clientX, clientY, containerRect) {
    // Convertir en coordonnées normalisées
    this.pointer.x = ((clientX - containerRect.left) / containerRect.width) * 2 - 1
    this.pointer.y = -((clientY - containerRect.top) / containerRect.height) * 2 + 1

    // Raycast
    this.raycaster.setFromCamera(this.pointer, this.camera)

    const result = this.cubeManager.raycast(this.raycaster)

    return result
  }
}
