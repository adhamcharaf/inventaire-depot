import { useState } from 'react'
import { syncToSupabase } from '../lib/sync'

export default function SyncButton({ pendingCount, onSyncDone }) {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSync() {
    setSyncing(true)
    setResult(null)
    try {
      const res = await syncToSupabase()
      setResult(res)
      if (onSyncDone) onSyncDone()
      // Clear result after 3 seconds
      setTimeout(() => setResult(null), 3000)
    } catch (err) {
      setResult({ synced: 0, failed: 1, errors: [err.message] })
    }
    setSyncing(false)
  }

  if (pendingCount === 0 && !result) return null

  return (
    <button
      onClick={handleSync}
      disabled={syncing || pendingCount === 0}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        result?.failed
          ? 'bg-red-100 text-red-700'
          : result?.synced
          ? 'bg-green-100 text-green-700'
          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
      } disabled:opacity-50`}
    >
      {syncing ? (
        <>
          <span className="animate-spin">&#8635;</span>
          Sync...
        </>
      ) : result ? (
        result.failed ? `${result.failed} erreur(s)` : `${result.synced} synchronise(s)`
      ) : (
        <>
          <span>&#8635;</span>
          {pendingCount} en attente
        </>
      )}
    </button>
  )
}
