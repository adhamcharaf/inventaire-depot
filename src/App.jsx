import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SessionProvider, useSession } from './context/SessionContext'
import LoginScreen from './components/LoginScreen'
import UserEntry from './components/UserEntry'
import AdminPanel from './components/AdminPanel'
import ChefDashboard from './components/ChefDashboard'
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

function UserFlow() {
  const { sessionId, userName, clearSession } = useSession()
  const [screen, setScreen] = useState('home')
  const [palettes, setPalettes] = useState([])
  const [currentPalette, setCurrentPalette] = useState(null)
  const [preselectedRef, setPreselectedRef] = useState(null)

  useEffect(() => {
    loadData()
  }, [sessionId])

  async function loadData() {
    const all = await getAllPalettes()
    const filtered = all.filter(p =>
      p.sessionId === sessionId && p.userName === userName
    )
    setPalettes(filtered)
  }

  async function handleCreate(dimensions, name, reference) {
    const palette = await createPalette(dimensions, name, reference, sessionId, userName)
    await loadData()
    setCurrentPalette(palette)
    setPreselectedRef(null)
    setScreen('view')
  }

  function handleNew(reference) {
    setPreselectedRef(reference || null)
    setScreen('form')
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
    setPreselectedRef(null)
    setScreen('home')
  }

  return (
    <div className="h-full">
      {screen === 'home' && (
        <Home
          palettes={palettes}
          onNew={handleNew}
          onResume={handleResume}
          onDelete={handleDelete}
          onChangeReference={handleChangeReference}
          onChangeSession={clearSession}
          onRefresh={loadData}
        />
      )}
      {screen === 'form' && (
        <PaletteForm
          onCreate={handleCreate}
          onBack={() => setScreen('home')}
          preselectedReference={preselectedRef}
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

function AppRouter() {
  const { profile, loading, signOut } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400">Chargement...</div>
      </div>
    )
  }

  // Authenticated: admin or chef
  if (profile) {
    if (profile.role === 'admin') {
      return <AdminPanel onSignOut={signOut} />
    }
    if (profile.role === 'chef') {
      return <ChefDashboard onSignOut={signOut} />
    }
  }

  // Login screen
  if (showLogin) {
    return <LoginScreen onBack={() => setShowLogin(false)} />
  }

  // Anonymous user flow
  return (
    <SessionProvider>
      <AnonymousFlow onLogin={() => setShowLogin(true)} />
    </SessionProvider>
  )
}

function AnonymousFlow({ onLogin }) {
  const { sessionId, userName } = useSession()
  const [ready, setReady] = useState(Boolean(sessionId && userName))

  if (sessionId && userName && ready) {
    return <UserFlow />
  }

  return <UserEntry onReady={() => setReady(true)} onLogin={onLogin} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
