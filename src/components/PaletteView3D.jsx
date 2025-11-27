import { useEffect, useRef, useCallback, useState } from 'react'
import { createScene, handleResize } from '../lib/three-scene'
import { CubeManager, RaycastManager } from '../lib/cube-manager'
import { removeCubeWithGravity, addCube, generateFullCubes, emptyAllCubes } from '../lib/gravity'
import { useAutoSave } from '../hooks/useAutoSave'
import StatsBar from './StatsBar'
import Controls from './Controls'

export default function PaletteView3D({ palette, onUpdate, onBack }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cubeManagerRef = useRef(null)
  const raycastRef = useRef(null)
  const animationRef = useRef(null)

  // État local pour les cubes
  const [cubes, setCubes] = useState(palette.cubes)
  const [hoveredCube, setHoveredCube] = useState(null)

  // Rotation de la caméra
  const rotationRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 4 })
  const isDraggingRef = useRef(false)
  const lastPointerRef = useRef({ x: 0, y: 0 })
  const pointerDownRef = useRef({ x: 0, y: 0 })

  // Auto-save
  const handleSave = useCallback((p) => {
    onUpdate({ ...p, cubes })
  }, [cubes, onUpdate])

  useAutoSave({ ...palette, cubes }, handleSave)

  // Initialisation Three.js
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const { scene, camera, renderer } = createScene(container, palette.dimensions)

    sceneRef.current = { scene, camera, renderer }
    cubeManagerRef.current = new CubeManager(scene, palette.dimensions)
    raycastRef.current = new RaycastManager(camera, cubeManagerRef.current)

    // Boucle de rendu
    function animate() {
      animationRef.current = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const onResize = () => handleResize(container, camera, renderer)
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(animationRef.current)
      cubeManagerRef.current?.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [palette.dimensions])

  // Mettre à jour les cubes quand l'état change
  useEffect(() => {
    if (cubeManagerRef.current) {
      cubeManagerRef.current.updateCubes(cubes)
    }
  }, [cubes])

  // Mettre à jour la position de la caméra
  const updateCameraPosition = useCallback(() => {
    if (!sceneRef.current) return

    const { camera } = sceneRef.current
    const { theta, phi } = rotationRef.current
    const { length, width, height } = palette.dimensions

    const maxDim = Math.max(length, width, height)
    const distance = maxDim * 2.5

    const centerX = (length - 1) / 2
    const centerY = (height - 1) / 2
    const centerZ = (width - 1) / 2

    camera.position.x = centerX + distance * Math.sin(phi) * Math.cos(theta)
    camera.position.y = centerY + distance * Math.cos(phi)
    camera.position.z = centerZ + distance * Math.sin(phi) * Math.sin(theta)

    camera.lookAt(centerX, centerY, centerZ)
  }, [palette.dimensions])

  // Gestion du pointeur
  const handlePointerDown = (e) => {
    isDraggingRef.current = false
    pointerDownRef.current = { x: e.clientX, y: e.clientY }
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e) => {
    const dx = e.clientX - lastPointerRef.current.x
    const dy = e.clientY - lastPointerRef.current.y

    // Détecter si on drag
    const totalMove = Math.hypot(
      e.clientX - pointerDownRef.current.x,
      e.clientY - pointerDownRef.current.y
    )
    if (totalMove > 10) {
      isDraggingRef.current = true
    }

    if (e.buttons === 1 && isDraggingRef.current) {
      // Rotation
      rotationRef.current.theta -= dx * 0.01
      rotationRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, rotationRef.current.phi + dy * 0.01))
      updateCameraPosition()
    } else if (e.buttons === 0) {
      // Hover
      const rect = containerRef.current.getBoundingClientRect()
      const cube = raycastRef.current?.findCubeAtPointer(e.clientX, e.clientY, rect)

      if (hoveredCube?.group !== cube?.group) {
        if (hoveredCube) {
          cubeManagerRef.current?.unhighlight(hoveredCube.group)
        }
        if (cube) {
          cubeManagerRef.current?.highlight(cube.group)
        }
        setHoveredCube(cube)
      }
    }

    lastPointerRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = (e) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      return
    }

    // Click sur un cube
    const rect = containerRef.current.getBoundingClientRect()
    const cube = raycastRef.current?.findCubeAtPointer(e.clientX, e.clientY, rect)

    if (cube) {
      if (cube.isPresent) {
        // Retirer le cube et tous ceux au-dessus
        const newCubes = removeCubeWithGravity(cubes, cube.x, cube.y, cube.z, palette.dimensions.height)
        setCubes(newCubes)
      } else {
        // Ajouter le cube (si support existe)
        const newCubes = addCube(cubes, cube.x, cube.y, cube.z)
        setCubes(newCubes)
      }
    }
  }

  // Actions rapides
  const handleFill = () => {
    setCubes(generateFullCubes(palette.dimensions))
  }

  const handleEmpty = () => {
    setCubes(emptyAllCubes())
  }

  const handleResetView = () => {
    rotationRef.current = { theta: Math.PI / 4, phi: Math.PI / 4 }
    updateCameraPosition()
  }

  // Vues rapides
  const setView = (view) => {
    switch (view) {
      case 'front':
        rotationRef.current = { theta: 0, phi: Math.PI / 2 }
        break
      case 'side':
        rotationRef.current = { theta: Math.PI / 2, phi: Math.PI / 2 }
        break
      case 'top':
        rotationRef.current = { theta: 0, phi: 0.1 }
        break
      case 'iso':
        rotationRef.current = { theta: Math.PI / 4, phi: Math.PI / 4 }
        break
    }
    updateCameraPosition()
  }

  // Zoom
  const handleZoom = (delta) => {
    if (!sceneRef.current) return
    const { camera } = sceneRef.current
    const factor = delta > 0 ? 1.1 : 0.9
    camera.position.multiplyScalar(factor)
  }

  // Stats
  const capacity = palette.dimensions.length * palette.dimensions.width * palette.dimensions.height
  const present = cubes.length
  const fillRate = ((present / capacity) * 100).toFixed(1)

  return (
    <div className="h-full flex flex-col bg-slate-100">
      {/* Stats Bar */}
      <StatsBar
        present={present}
        capacity={capacity}
        fillRate={fillRate}
        name={palette.name}
        onBack={onBack}
      />

      {/* Canvas 3D */}
      <div
        ref={containerRef}
        className="flex-1 touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          if (hoveredCube) {
            cubeManagerRef.current?.unhighlight(hoveredCube.group)
            setHoveredCube(null)
          }
        }}
        onWheel={(e) => handleZoom(e.deltaY)}
      />

      {/* Contrôles */}
      <Controls
        onFill={handleFill}
        onEmpty={handleEmpty}
        onResetView={handleResetView}
        onViewChange={setView}
        onZoom={handleZoom}
      />
    </div>
  )
}
