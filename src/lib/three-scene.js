import * as THREE from 'three'
import { CUBE_COLORS } from './config'

/**
 * Créer et configurer la scène Three.js
 */
export function createScene(container, dimensions) {
  // Scène
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xF8FAFC)

  // Caméra
  const aspect = container.clientWidth / container.clientHeight
  const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000)

  // Positionner la caméra en vue isométrique
  const maxDim = Math.max(dimensions.length, dimensions.width, dimensions.height)
  const distance = maxDim * 2.5
  camera.position.set(distance, distance * 0.8, distance)
  camera.lookAt(dimensions.length / 2, dimensions.height / 2, dimensions.width / 2)

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  // Lumières
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 20, 10)
  scene.add(directionalLight)

  // Grille au sol
  const gridHelper = new THREE.GridHelper(
    Math.max(dimensions.length, dimensions.width) + 2,
    Math.max(dimensions.length, dimensions.width) + 2,
    0xCBD5E1,
    0xE2E8F0
  )
  gridHelper.position.set(
    (dimensions.length - 1) / 2,
    -0.01,
    (dimensions.width - 1) / 2
  )
  scene.add(gridHelper)

  return { scene, camera, renderer }
}

/**
 * Créer un cube avec contours
 */
export function createCube(x, y, z, isPresent = true) {
  const group = new THREE.Group()
  group.userData = { x, y, z, isPresent }

  const size = 0.9 // Légèrement plus petit pour espacement
  const geometry = new THREE.BoxGeometry(size, size, size)

  if (isPresent) {
    // Cube plein
    const material = new THREE.MeshLambertMaterial({
      color: CUBE_COLORS.fill,
      transparent: true,
      opacity: 0.9
    })
    const mesh = new THREE.Mesh(geometry, material)
    group.add(mesh)

    // Contours
    const edges = new THREE.EdgesGeometry(geometry)
    const lineMaterial = new THREE.LineBasicMaterial({ color: CUBE_COLORS.edge })
    const wireframe = new THREE.LineSegments(edges, lineMaterial)
    group.add(wireframe)
  } else {
    // Cube absent (fantôme)
    const material = new THREE.MeshLambertMaterial({
      color: CUBE_COLORS.absent,
      transparent: true,
      opacity: 0.15
    })
    const mesh = new THREE.Mesh(geometry, material)
    group.add(mesh)

    // Contours légers
    const edges = new THREE.EdgesGeometry(geometry)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: CUBE_COLORS.absent,
      transparent: true,
      opacity: 0.3
    })
    const wireframe = new THREE.LineSegments(edges, lineMaterial)
    group.add(wireframe)
  }

  // Position (y = hauteur dans Three.js)
  group.position.set(x, z, y)

  return group
}

/**
 * Mettre en surbrillance un cube
 */
export function highlightCube(cubeGroup, highlight = true) {
  if (!cubeGroup) return

  const mesh = cubeGroup.children[0]
  if (mesh && mesh.material) {
    if (highlight) {
      mesh.material.color.setHex(CUBE_COLORS.hover)
      mesh.material.opacity = 1
    } else {
      const isPresent = cubeGroup.userData.isPresent
      mesh.material.color.setHex(isPresent ? CUBE_COLORS.fill : CUBE_COLORS.absent)
      mesh.material.opacity = isPresent ? 0.9 : 0.15
    }
  }
}

/**
 * Resize handler
 */
export function handleResize(container, camera, renderer) {
  const width = container.clientWidth
  const height = container.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}
