import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/config'

export default function AdminChefManager() {
  const [chefs, setChefs] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => { loadChefs() }, [])

  async function loadChefs() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'chef')
      .order('created_at', { ascending: false })
    setChefs(data || [])
  }

  async function handleCreate(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        setError('Session expirée. Reconnectez-vous.')
        setLoading(false)
        return
      }

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/create-chef`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ email, password, full_name: fullName }),
        }
      )

      const result = await res.json()
      console.log('create-chef response:', res.status, result)

      if (!res.ok) {
        setError(result.error || `Erreur ${res.status}`)
      } else {
        setSuccess(`Chef "${fullName}" cree avec succes`)
        setEmail('')
        setPassword('')
        setFullName('')
        await loadChefs()
      }
    } catch (err) {
      console.error('create-chef fetch error:', err)
      setError('Erreur reseau: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <h2 className="font-semibold text-slate-800">Nouveau chef d'inventaire</h2>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Nom complet"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength={6}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creation...' : 'Creer le compte'}
        </button>
      </form>

      <div>
        <h2 className="font-semibold text-slate-800 mb-3">Chefs existants</h2>
        {chefs.length === 0 ? (
          <p className="text-slate-400 text-sm">Aucun chef enregistre</p>
        ) : (
          <div className="space-y-2">
            {chefs.map(chef => (
              <div key={chef.id} className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="font-medium text-slate-800 text-sm">{chef.full_name}</p>
                <p className="text-xs text-slate-400">{chef.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
