import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ACTION_LABELS = {
  count_synced: 'Comptage synchronise',
  recount_requested: 'Recomptage demande',
  session_created: 'Session creee',
  session_closed: 'Session cloturee',
  stock_uploaded: 'Stock importe',
}

export default function AuditLog({ sessionId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLogs() }, [sessionId])

  async function loadLogs() {
    setLoading(true)
    let query = supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data } = await query
    setLogs(data || [])
    setLoading(false)
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Chargement...</div>
  }

  if (logs.length === 0) {
    return <div className="text-center py-8 text-slate-400 text-sm">Aucun historique</div>
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-800">Historique</h2>
        <button onClick={loadLogs} className="text-sm text-blue-500 hover:text-blue-700">Actualiser</button>
      </div>

      {logs.map(log => (
        <div key={log.id} className="bg-white border border-slate-200 rounded-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                log.action === 'recount_requested' ? 'bg-amber-400' :
                log.action === 'count_synced' ? 'bg-green-400' :
                log.action === 'stock_uploaded' ? 'bg-blue-400' :
                'bg-slate-400'
              }`} />
              <span className="text-sm font-medium text-slate-800">
                {ACTION_LABELS[log.action] || log.action}
              </span>
            </div>
            <span className="text-xs text-slate-400">{formatDate(log.created_at)}</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-2 flex-wrap">
            {log.user_name && <span>par {log.user_name}</span>}
            {log.reference && (
              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{log.reference}</span>
            )}
            {log.details?.count !== undefined && <span>({log.details.count} articles)</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
