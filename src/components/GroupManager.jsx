import { useState } from 'react'

export default function GroupManager({ groups, onCreateGroup, onDeleteGroup, onClose }) {
  const [newGroupName, setNewGroupName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  function handleCreate(e) {
    e.preventDefault()
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim())
      setNewGroupName('')
    }
  }

  function handleDelete(id, e) {
    e.stopPropagation()
    if (confirmDelete === id) {
      onDeleteGroup(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-2xl max-h-[80vh] flex flex-col safe-bottom">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Gestion des Groupes</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulaire de création */}
        <form onSubmit={handleCreate} className="p-4 border-b border-slate-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Nom du nouveau groupe..."
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!newGroupName.trim()}
              className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors"
            >
              Ajouter
            </button>
          </div>
        </form>

        {/* Liste des groupes */}
        <div className="flex-1 overflow-auto p-4">
          {groups.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <div className="text-3xl mb-2">📁</div>
              <p>Aucun groupe pour l'instant</p>
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between bg-slate-50 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <span className="font-medium text-slate-900">{group.name}</span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(group.id, e)}
                    className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                      confirmDelete === group.id
                        ? 'bg-red-500 text-white'
                        : 'text-red-500 hover:bg-red-50'
                    }`}
                  >
                    {confirmDelete === group.id ? 'Confirmer' : 'Supprimer'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
