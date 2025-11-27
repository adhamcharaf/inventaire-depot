import { useState, useEffect } from 'react'
import Home from './components/Home'
import PaletteForm from './components/PaletteForm'
import PaletteView3D from './components/PaletteView3D'
import { getAllPalettes, createPalette, getPalette, updatePalette, deletePalette } from './db/indexeddb'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [palettes, setPalettes] = useState([])
  const [currentPalette, setCurrentPalette] = useState(null)

  useEffect(() => {
    loadPalettes()
  }, [])

  async function loadPalettes() {
    const data = await getAllPalettes()
    setPalettes(data)
  }

  async function handleCreate(dimensions, name) {
    const palette = await createPalette(dimensions, name)
    await loadPalettes()
    setCurrentPalette(palette)
    setScreen('view')
  }

  async function handleResume(id) {
    const palette = await getPalette(id)
    if (palette) {
      setCurrentPalette(palette)
      setScreen('view')
    }
  }

  async function handleDelete(id) {
    await deletePalette(id)
    await loadPalettes()
  }

  async function handleUpdatePalette(updated) {
    await updatePalette(updated)
    setCurrentPalette(updated)
  }

  function handleBack() {
    loadPalettes()
    setCurrentPalette(null)
    setScreen('home')
  }

  return (
    <div className="h-full">
      {screen === 'home' && (
        <Home
          palettes={palettes}
          onNew={() => setScreen('form')}
          onResume={handleResume}
          onDelete={handleDelete}
        />
      )}
      {screen === 'form' && (
        <PaletteForm
          onCreate={handleCreate}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'view' && currentPalette && (
        <PaletteView3D
          palette={currentPalette}
          onUpdate={handleUpdatePalette}
          onBack={handleBack}
        />
      )}
    </div>
  )
}
