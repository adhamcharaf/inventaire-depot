import { useState } from 'react'
import PaletteList from './PaletteList'
import SyncButton from './SyncButton'
import RecountBanner from './RecountBanner'
import { exportReferencesCSV } from '../lib/export'
import { useSession } from '../context/SessionContext'
import { submitAllPalettes } from '../db/indexeddb'

export default function Home({
  palettes,
  onNew,
  onResume,
  onDelete,
  onChangeReference,
  onChangeSession,
  onBackToMode,
  onRefresh,
  sessionRefs = [],
}) {
  const { sessionId, sessionName, userName, clearSession } = useSession()
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)

  const pendingCount = palettes.filter(p => p.syncStatus === 'pending').length
  const localCount = palettes.filter(p => p.syncStatus === 'local').length

  async function handleSubmitAll() {
    setSubmitting(true)
    try {
      const count = await submitAllPalettes(sessionId, userName)
      setSubmitResult(`${count} palette(s) soumise(s)`)
      if (onRefresh) onRefresh()
      setTimeout(() => setSubmitResult(null), 3000)
    } catch (err) {
      setSubmitResult('Erreur: ' + err.message)
    }
    setSubmitting(false)
  }

  function handleRecountReference(reference) {
    // Navigate to form with pre-selected reference
    onNew(reference)
  }

  return (
    <div className="h-full flex flex-col safe-top safe-bottom">
      {/* Header */}
      <header className="bg-blue-500 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Inventaire Palettes</h1>
            <p className="text-blue-100 text-xs mt-0.5">
              {sessionName} — {userName}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {palettes.length > 0 && (
              <button
                onClick={() => exportReferencesCSV(palettes)}
                className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
                title="Exporter CSV"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            )}
            {onBackToMode && (
              <button
                onClick={onBackToMode}
                className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
                title="Changer de mode"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            )}
            <button
              onClick={() => { clearSession(); if (onChangeSession) onChangeSession() }}
              className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
              title="Changer de session"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Recount banner + sync */}
      <div className="px-4 pt-3">
        <RecountBanner sessionId={sessionId} onSelectReference={handleRecountReference} />

        <div className="flex items-center gap-2 mb-3">
          {localCount > 0 && (
            <button
              onClick={handleSubmitAll}
              disabled={submitting}
              className="flex-1 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Soumission...' : `Soumettre ${localCount} palette(s)`}
            </button>
          )}
          <SyncButton pendingCount={pendingCount} onSyncDone={onRefresh} />
        </div>

        {submitResult && (
          <p className="text-sm text-green-600 mb-2">{submitResult}</p>
        )}
      </div>

      {/* Bouton nouvelle palette */}
      <div className="px-4 pb-2">
        <button
          onClick={() => onNew()}
          className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-colors"
        >
          + Nouvelle Palette
        </button>
      </div>

      {/* Liste des inventaires */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {palettes.length > 0 ? (
          <>
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
              Mes palettes
            </h2>
            <PaletteList
              palettes={palettes}
              onResume={onResume}
              onDelete={onDelete}
              onChangeReference={onChangeReference}
              sessionRefs={sessionRefs}
            />
          </>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-3">📦</div>
            <p>Aucune palette pour cette session</p>
            <p className="text-sm mt-1">Creez votre premiere palette</p>
          </div>
        )}
      </div>
    </div>
  )
}
