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
  getAllGroups,
  createGroup,
  deleteGroup,
  updatePaletteGroup
} from './db/indexeddb'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [palettes, setPalettes] = useState([])
  const [groups, setGroups] = useState([])
  const [currentPalette, setCurrentPalette] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [palettesData, groupsData] = await Promise.all([
      getAllPalettes(),
      getAllGroups()
    ])
    setPalettes(palettesData)
    setGroups(groupsData)
  }

  async function handleCreate(dimensions, name, groupId) {
    const palette = await createPalette(dimensions, name, groupId)
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

  async function handleCreateGroup(name) {
    await createGroup(name)
    await loadData()
  }

  async function handleDeleteGroup(id) {
    await deleteGroup(id)
    await loadData()
  }

  async function handleChangePaletteGroup(paletteId, groupId) {
    await updatePaletteGroup(paletteId, groupId)
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
          groups={groups}
          onNew={() => setScreen('form')}
          onResume={handleResume}
          onDelete={handleDelete}
          onCreateGroup={handleCreateGroup}
          onDeleteGroup={handleDeleteGroup}
          onChangePaletteGroup={handleChangePaletteGroup}
        />
      )}
      {screen === 'form' && (
        <PaletteForm
          groups={groups}
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
