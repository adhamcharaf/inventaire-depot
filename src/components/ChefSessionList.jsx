import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function ChefSessionList({ onSelect }) {
  const { profile } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => { loadSessions() }, [])

  async function loadSessions() {
    setLoading(true)
    const { data } = await supabase
      .from('inventory_sessions')
      .select('*, user_counts(id)')
      .order('created_at', { ascending: false })

    setSessions((data || []).map(s => ({
      ...s,
      countSubmissions: s.user_counts?.length || 0,
    })))
    setLoading(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)

    const { error } = await supabase.from('inventory_sessions').insert({
      name: newName.trim(),
      created_by: profile.id,
    })

    if (!error) {
      setNewName('')
      await loadSessions()
    }
    setCreating(false)
  }

  async function handleToggleStatus(session) {
    const newStatus = session.status === 'active' ? 'closed' : 'active'
    await supabase
      .from('inventory_sessions')
      .update({
        status: newStatus,
        closed_at: newStatus === 'closed' ? new Date().toISOString() : null,
      })
      .eq('id', session.id)
    await loadSessions()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nom de la session (ex: Inventaire Mars 2026)"
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {creating ? '...' : 'Creer'}
        </button>
      </form>

      {loading ? (
        <div className="text-center py-8 text-slate-400">Chargement...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Aucune session. Creez-en une pour commencer.
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map(session => (
            <div
              key={session.id}
              className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between"
            >
              <button
                onClick={() => onSelect(session)}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-800">{session.name}</p>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    session.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {session.status === 'active' ? 'Active' : 'Cloturee'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(session.created_at).toLocaleDateString('fr-FR')} — {session.countSubmissions} comptage(s)
                </p>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleToggleStatus(session) }}
                className="text-xs text-slate-400 hover:text-slate-600 ml-3"
              >
                {session.status === 'active' ? 'Cloturer' : 'Reouvrir'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
