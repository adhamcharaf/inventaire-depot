import { useState } from 'react'
import ChefSessionList from './ChefSessionList'
import ChefComparisonTable from './ChefComparisonTable'
import AuditLog from './AuditLog'

export default function ChefDashboard({ onSignOut }) {
  const [selectedSession, setSelectedSession] = useState(null)
  const [tab, setTab] = useState('comparison') // 'comparison' | 'audit'

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Chef d'inventaire</h1>
            {selectedSession && (
              <p className="text-xs text-slate-500">{selectedSession.name}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedSession && (
              <button
                onClick={() => { setSelectedSession(null); setTab('comparison') }}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Sessions
              </button>
            )}
            <button
              onClick={onSignOut}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Deconnexion
            </button>
          </div>
        </div>

        {/* Tabs when session is selected */}
        {selectedSession && (
          <div className="flex border-t border-slate-100">
            <button
              onClick={() => setTab('comparison')}
              className={`flex-1 py-2 text-sm font-medium text-center transition-colors ${
                tab === 'comparison'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Comparaison
            </button>
            <button
              onClick={() => setTab('audit')}
              className={`flex-1 py-2 text-sm font-medium text-center transition-colors ${
                tab === 'audit'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Historique
            </button>
          </div>
        )}
      </header>

      <div className="p-4">
        {selectedSession ? (
          tab === 'comparison' ? (
            <ChefComparisonTable session={selectedSession} />
          ) : (
            <AuditLog sessionId={selectedSession.id} />
          )
        ) : (
          <ChefSessionList onSelect={setSelectedSession} />
        )}
      </div>
    </div>
  )
}
