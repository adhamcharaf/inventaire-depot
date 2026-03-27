import { useState } from 'react'
import ChefSessionList from './ChefSessionList'
import ChefComparisonTable from './ChefComparisonTable'

export default function ChefDashboard({ onSignOut }) {
  const [selectedSession, setSelectedSession] = useState(null)

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
                onClick={() => setSelectedSession(null)}
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
      </header>

      <div className="p-4">
        {selectedSession ? (
          <ChefComparisonTable session={selectedSession} />
        ) : (
          <ChefSessionList onSelect={setSelectedSession} />
        )}
      </div>
    </div>
  )
}
