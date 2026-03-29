import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SessionProvider, useSession } from './context/SessionContext'
import LoginScreen from './components/LoginScreen'
import UserEntry from './components/UserEntry'
import ModeSelector from './components/ModeSelector'
import ManualCount from './components/ManualCount'
import AdminPanel from './components/AdminPanel'
import ChefDashboard from './components/ChefDashboard'
import Home from './components/Home'
import PaletteForm from './components/PaletteForm'
import PaletteView3D from './components/PaletteView3D'
import NetworkStatus from './components/NetworkStatus'
import {
  getAllPalettes,
  createPalette,
  getPalette,
  updatePalette,
  deletePalette,
  updatePaletteReference
} from './db/indexeddb'
import { supabase } from './lib/supabase'

function UserFlow({ onBackToMode }) {
  const { sessionId, userName, clearSession } = useSession()
  const [screen, setScreen] = useState('home')
  const [palettes, setPalettes] = useState([])
  const [currentPalette, setCurrentPalette] = useState(null)
  const [preselectedRef, setPreselectedRef] = useState(null)
  const [sessionRefs, setSessionRefs] = useState([])

  useEffect(() => {
    loadData()
    loadSessionRefs()
  }, [sessionId])

  async function loadSessionRefs() {
    if (!sessionId) return
    const { data, error } = await supabase.rpc('get_session_references', { p_session_id: sessionId })
    if (!error && data) {
      setSessionRefs(data.map(r => r.reference))
    }
  }

  async function loadData() {
    const all = await getAllPalettes()
    const filtered = all.filter(p =>
      p.sessionId === sessionId && p.userName === userName && p.countMode !== 'manual'
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
          onBackToMode={onBackToMode}
          onRefresh={loadData}
          sessionRefs={sessionRefs}
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

function LoadingScreen() {
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowFallback(true), 8000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6">
      <div className="text-slate-400">Chargement...</div>
      {showFallback && (
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
        >
          Recharger l'application
        </button>
      )}
    </div>
  )
}

function AppRouter() {
  const { profile, loading, signOut } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  if (loading) {
    return <LoadingScreen />
  }

  // Authenticated: admin or chef
  if (profile) {
    if (profile.role === 'admin') {
      return (
        <>
          <NetworkStatus />
          <AdminPanel onSignOut={signOut} />
        </>
      )
    }
    if (profile.role === 'chef') {
      return (
        <>
          <NetworkStatus />
          <ChefDashboard onSignOut={signOut} />
        </>
      )
    }
  }

  // Login screen
  if (showLogin) {
    return <LoginScreen key="login" onBack={() => setShowLogin(false)} />
  }

  // Anonymous user flow
  return (
    <SessionProvider>
      <NetworkStatus />
      <AnonymousFlow onLogin={() => setShowLogin(true)} />
    </SessionProvider>
  )
}

function AnonymousFlow({ onLogin }) {
  const { sessionId, userName, clearSession } = useSession()
  const [mode, setMode] = useState(null)

  function handleBackToEntry() {
    clearSession()
    setMode(null)
  }

  if (!sessionId || !userName) {
    return <UserEntry onReady={() => {}} onLogin={onLogin} />
  }

  if (!mode) {
    return <ModeSelector onSelectMode={setMode} onBack={handleBackToEntry} />
  }

  if (mode === 'manual') {
    return <ManualCount onBack={() => setMode(null)} />
  }

  return <UserFlow onBackToMode={() => setMode(null)} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
