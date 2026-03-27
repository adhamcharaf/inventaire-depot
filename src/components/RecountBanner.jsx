import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function RecountBanner({ sessionId, onSelectReference }) {
  const [requests, setRequests] = useState([])

  useEffect(() => {
    if (!sessionId) return
    loadRequests()
    const interval = setInterval(loadRequests, 30000)
    return () => clearInterval(interval)
  }, [sessionId])

  async function loadRequests() {
    const { data } = await supabase
      .from('recount_requests')
      .select('id, reference, created_at')
      .eq('session_id', sessionId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    setRequests(data || [])
  }

  if (requests.length === 0) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
      <p className="text-sm font-medium text-amber-800 mb-2">
        Recomptage demande :
      </p>
      <div className="flex flex-wrap gap-2">
        {requests.map(req => (
          <button
            key={req.id}
            onClick={() => onSelectReference && onSelectReference(req.reference)}
            className="px-2.5 py-1 bg-amber-200 text-amber-900 rounded text-xs font-medium hover:bg-amber-300 transition-colors"
          >
            {req.reference}
          </button>
        ))}
      </div>
    </div>
  )
}
