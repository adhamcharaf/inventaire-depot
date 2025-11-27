import * as THREE from 'three'
import { createCube, highlightCube } from './three-scene'
import { parsePosition, hasCube } from './gravity'

/**
 * Gestionnaire des cubes dans la scène
 */
export class CubeManager {
  constructor(scene, dimensions) {
    this.scene = scene
    this.dimensions = dimensions
    this.cubesGroup = new THREE.Group()
    this.cubeMap = new Map() // "x,y,z" -> THREE.Group
    this.scene.add(this.cubesGroup)
  }

  /**
   * Mettre à jour tous les cubes selon l'état actuel
   */
  updateCubes(cubesArray) {
    // Nettoyer les anciens cubes
    while (this.cubesGroup.children.length > 0) {
      this.cubesGroup.remove(this.cubesGroup.children[0])
    }
    this.cubeMap.clear()

    // Créer seulement les cubes présents (les absents disparaissent complètement)
    const maxHeight = this.dimensions.height
    cubesArray.forEach(pos => {
      const [x, y, z] = pos.split(',').map(Number)
      const cube = createCube(x, y, z, true, maxHeight)
      this.cubesGroup.add(cube)
      this.cubeMap.set(pos, cube)
    })
  }

  /**
   * Obtenir le cube à une position
   */
  getCube(x, y, z) {
    return this.cubeMap.get(`${x},${y},${z}`)
  }

  /**
   * Obtenir tous les objets clickables
   */
  getClickableObjects() {
    const objects = []
    this.cubesGroup.traverse((child) => {
      if (child.isMesh) {
        objects.push(child)
      }
    })
    return objects
  }

  /**
   * Trouver le cube parent d'un mesh
   */
  findCubeGroup(mesh) {
    let current = mesh
    while (current) {
      if (current.userData && current.userData.x !== undefined) {
        return current
      }
      current = current.parent
    }
    return null
  }

  /**
   * Mettre en surbrillance un cube
   */
  highlight(cubeGroup) {
    highlightCube(cubeGroup, true)
  }

  /**
   * Retirer la surbrillance
   */
  unhighlight(cubeGroup) {
    highlightCube(cubeGroup, false)
  }

  /**
   * Nettoyer
   */
  dispose() {
    this.scene.remove(this.cubesGroup)
    this.cubeMap.clear()
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
    const objects = this.cubeManager.getClickableObjects()
    const intersects = this.raycaster.intersectObjects(objects)

    if (intersects.length > 0) {
      const cubeGroup = this.cubeManager.findCubeGroup(intersects[0].object)
      if (cubeGroup) {
        return {
          x: cubeGroup.userData.x,
          y: cubeGroup.userData.y,
          z: cubeGroup.userData.z,
          isPresent: cubeGroup.userData.isPresent,
          group: cubeGroup
        }
      }
    }

    return null
  }
}
