import { useState, useEffect } from 'react'
import ModeSelector from './components/ModeSelector'
import ManualCount from './components/ManualCount'
import Home from './components/Home'
import PaletteForm from './components/PaletteForm'
import PaletteView3D from './components/PaletteView3D'
import SimplePaletteView from './components/SimplePaletteView'
import {
  getAllPalettes,
  createPalette,
  getPalette,
  updatePalette,
  deletePalette,
  updatePaletteReference
} from './db/indexeddb'

export default function App() {
  const [screen, setScreen] = useState('modeSelector')
  const [palettes, setPalettes] = useState([])
  const [currentPalette, setCurrentPalette] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const palettesData = await getAllPalettes()
    setPalettes(palettesData)
  }

  function handleSelectMode(mode) {
    if (mode === 'manual') {
      setScreen('manualCount')
    } else {
      setScreen('home')
    }
  }

  async function handleCreate(dimensions, name, reference, paletteType = 'classic', extraCartons = 0) {
    const palette = await createPalette(dimensions, name, reference, paletteType, extraCartons)
    await loadData()

    // Pour les palettes simples, pas de vue 3D
    if (paletteType === 'simple') {
      setScreen('home')
    } else {
      setCurrentPalette(palette)
      setScreen('view')
    }
  }

  async function handleResume(id) {
    const palette = await getPalette(id)
    if (palette) {
      // Les palettes simples n'ont pas de vue 3D
      if (palette.type === 'simple') {
        setScreen('simpleView')
        setCurrentPalette(palette)
      } else {
        setCurrentPalette(palette)
        setScreen('view')
      }
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

  function handleBackToModeSelector() {
    setScreen('modeSelector')
  }

  return (
    <div className="h-full">
      {screen === 'modeSelector' && (
        <ModeSelector onSelectMode={handleSelectMode} />
      )}
      {screen === 'manualCount' && (
        <ManualCount onBack={handleBackToModeSelector} />
      )}
      {screen === 'home' && (
        <Home
          palettes={palettes}
          onNew={() => setScreen('form')}
          onResume={handleResume}
          onDelete={handleDelete}
          onChangeReference={handleChangeReference}
          onBack={handleBackToModeSelector}
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
      {screen === 'simpleView' && currentPalette && (
        <SimplePaletteView
          palette={currentPalette}
          onUpdate={handleUpdatePalette}
          onBack={handleBack}
        />
      )}
    </div>
  )
}
