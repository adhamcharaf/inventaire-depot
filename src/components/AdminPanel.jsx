import { useState } from 'react'
import AdminChefManager from './AdminChefManager'
import AdminStockUpload from './AdminStockUpload'
import ChefSessionList from './ChefSessionList'

export default function AdminPanel({ onSignOut }) {
  const [tab, setTab] = useState('chefs')

  const tabs = [
    { id: 'chefs', label: 'Chefs' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'stock', label: 'Stock' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-slate-800">Administration</h1>
          <button
            onClick={onSignOut}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Deconnexion
          </button>
        </div>
        <div className="flex border-t border-slate-100">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        {tab === 'chefs' && <AdminChefManager />}
        {tab === 'sessions' && <ChefSessionList onSelect={() => {}} />}
        {tab === 'stock' && <AdminStockUpload />}
      </div>
    </div>
  )
}
