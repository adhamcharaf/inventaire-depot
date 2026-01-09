import * as THREE from 'three'

/**
 * Créer et configurer la scène Three.js
 */
export function createScene(container, dimensions, options = {}) {
  const { performanceMode = false } = options

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

  // Renderer - adapté au mode performance
  const renderer = new THREE.WebGLRenderer({
    antialias: !performanceMode,
    powerPreference: performanceMode ? 'low-power' : 'high-performance'
  })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(performanceMode ? 1 : Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  // Lumières (seulement si pas en mode performance)
  if (!performanceMode) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    scene.add(directionalLight)
  } else {
    // En mode performance, juste une lumière ambiante forte
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
    scene.add(ambientLight)
  }

  // Grille au sol
  const gridHelper = new THREE.GridHelper(
    Math.max(dimensions.length, dimensions.width) + 2,
    Math.max(dimensions.length, dimensions.width) + 2,
    0xCBD5E1,
    0xE2E8F0
  )
  gridHelper.position.set(
    (dimensions.length - 1) / 2,
    -0.5,
    (dimensions.width - 1) / 2
  )
  scene.add(gridHelper)

  // Wireframe de la palette complète
  const boxGeometry = new THREE.BoxGeometry(
    dimensions.length,
    dimensions.height,
    dimensions.width
  )
  const wireframeMaterial = new THREE.LineBasicMaterial({
    color: 0x94A3B8,
    transparent: true,
    opacity: 0.5
  })
  const wireframe = new THREE.LineSegments(
    new THREE.EdgesGeometry(boxGeometry),
    wireframeMaterial
  )
  wireframe.position.set(
    (dimensions.length - 1) / 2,
    (dimensions.height - 1) / 2,
    (dimensions.width - 1) / 2
  )
  scene.add(wireframe)

  return { scene, camera, renderer }
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

/**
 * Mettre à jour le mode performance du renderer
 */
export function setRendererPerformanceMode(renderer, performanceMode) {
  renderer.setPixelRatio(performanceMode ? 1 : Math.min(window.devicePixelRatio, 2))
}
