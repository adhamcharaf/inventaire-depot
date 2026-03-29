import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { parseStockFile } from '../lib/excel-import'
import { useAuth } from '../context/AuthContext'

export default function AdminStockUpload() {
  const { profile } = useAuth()
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => { loadSessions() }, [])

  async function loadSessions() {
    const { data } = await supabase
      .from('inventory_sessions')
      .select('id, name, status, created_at')
      .order('created_at', { ascending: false })
    setSessions(data || [])
  }

  async function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    setError(null)
    setSuccess(null)

    try {
      const data = await parseStockFile(file)
      setPreview(data)
    } catch (err) {
      setError(err.message)
      setPreview(null)
    }
  }

  async function handleUpload() {
    if (!selectedSession || !preview || !profile) {
      setError('Selectionnez une session et un fichier')
      return
    }
    setUploading(true)
    setError(null)

    try {
      const rows = preview.map(item => ({
        session_id: selectedSession,
        reference: item.reference,
        expected_quantity: item.quantity,
        uploaded_by: profile.id,
      }))

      console.log('Uploading', rows.length, 'rows to session', selectedSession)
      const { error } = await supabase
        .from('theoretical_stock')
        .upsert(rows, { onConflict: 'session_id,reference' })

      if (error) {
        console.error('Stock upload error:', error)
        setError(error.message)
      } else {
        setSuccess(`${preview.length} references importees avec succes`)
        setPreview(null)
        await supabase.from('audit_log').insert({
          session_id: selectedSession,
          user_id: profile.id,
          action: 'stock_uploaded',
          details: { count: preview.length },
        })
      }
    } catch (err) {
      console.error('Stock upload exception:', err)
      setError('Erreur: ' + err.message)
    }
    setUploading(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <h2 className="font-semibold text-slate-800">Importer le stock theorique</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Session</label>
          <select
            value={selectedSession || ''}
            onChange={e => setSelectedSession(e.target.value || null)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choisir une session...</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status === 'active' ? 'Active' : 'Cloturee'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fichier (CSV ou Excel)
          </label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-slate-400 mt-1">
            Colonnes attendues : reference, quantite
          </p>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
      </div>

      {preview && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800 mb-3">
            Apercu ({preview.length} references)
          </h3>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-slate-600">Reference</th>
                  <th className="text-right py-2 text-slate-600">Quantite</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-800">{item.reference}</td>
                    <td className="py-1.5 text-right text-slate-800">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !selectedSession}
            className="w-full mt-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Import en cours...' : `Importer ${preview.length} references`}
          </button>
        </div>
      )}
    </div>
  )
}
