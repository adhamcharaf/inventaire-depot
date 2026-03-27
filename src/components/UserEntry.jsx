import { useState, useEffect } from 'react'
import { useSession } from '../context/SessionContext'
import { supabase } from '../lib/supabase'

export default function UserEntry({ onReady, onLogin }) {
  const { userName, setUserName, selectSession } = useSession()
  const [step, setStep] = useState(userName ? 'session' : 'name')
  const [nameInput, setNameInput] = useState(userName || '')
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (step === 'session') loadSessions()
  }, [step])

  async function loadSessions() {
    setLoadingSessions(true)
    setError(null)
    const { data, error } = await supabase
      .from('inventory_sessions')
      .select('id, name, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      setError('Impossible de charger les sessions. Verifiez votre connexion.')
      setSessions([])
    } else {
      setSessions(data || [])
    }
    setLoadingSessions(false)
  }

  function handleNameSubmit(e) {
    e.preventDefault()
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setUserName(trimmed)
    setStep('session')
  }

  function handleSelectSession(session) {
    selectSession(session.id, session.name)
    onReady()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-1">Inventaire Palettes</h1>
        <p className="text-slate-500 text-center text-sm mb-8">Comptage des articles</p>

        {step === 'name' && (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Votre nom</label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                placeholder="Prenom Nom"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Continuer
            </button>
          </form>
        )}

        {step === 'session' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Bonjour <span className="font-semibold">{userName}</span>
              </p>
              <button
                onClick={() => { setStep('name'); setUserName(null) }}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                Changer
              </button>
            </div>

            <p className="text-sm font-medium text-slate-700">Choisissez une session d'inventaire :</p>

            {loadingSessions && (
              <div className="text-center py-8 text-slate-400">Chargement...</div>
            )}

            {error && (
              <div className="text-center py-4">
                <p className="text-red-500 text-sm mb-2">{error}</p>
                <button onClick={loadSessions} className="text-blue-500 text-sm hover:text-blue-700">
                  Reessayer
                </button>
              </div>
            )}

            {!loadingSessions && !error && sessions.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                Aucune session active. Contactez le chef d'inventaire.
              </div>
            )}

            {!loadingSessions && sessions.map(session => (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className="w-full p-4 bg-white border border-slate-200 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <p className="font-medium text-slate-800">{session.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(session.created_at).toLocaleDateString('fr-FR')}
                </p>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onLogin}
          className="w-full mt-6 py-2 text-slate-400 text-xs hover:text-slate-600 transition-colors"
        >
          Se connecter (admin / chef)
        </button>
      </div>
    </div>
  )
}
