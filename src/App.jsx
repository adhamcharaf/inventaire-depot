import { useState, useEffect } from 'react'
import Home from './components/Home'
import PaletteForm from './components/PaletteForm'
import PaletteView3D from './components/PaletteView3D'
import {
  getAllPalettes,
  createPalette,
  getPalette,
  updatePalette,
  deletePalette,
  updatePaletteReference
} from './db/indexeddb'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [palettes, setPalettes] = useState([])
  const [currentPalette, setCurrentPalette] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const palettesData = await getAllPalettes()
    setPalettes(palettesData)
  }

  async function handleCreate(dimensions, name, reference) {
    const palette = await createPalette(dimensions, name, reference)
    await loadData()
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
    await loadData()
  }

  async function handleUpdatePalette(updated) {
    await updatePalette(updated)
    setCurrentPalette(updated)
  }

  async function handleChangeReference(paletteId, reference) {
    await updatePaletteReference(paletteId, reference)
    await loadData()
  }

  function handleBack() {
    loadData()
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
          onChangeReference={handleChangeReference}
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
