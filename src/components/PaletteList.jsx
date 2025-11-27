import { useState } from 'react'

export default function PaletteList({ palettes, onResume, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(null)

  function formatDate(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return "À l'instant"
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  function handleDelete(id, e) {
    e.stopPropagation()
    if (confirmDelete === id) {
      onDelete(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  return (
    <div className="space-y-3">
      {palettes.map((palette) => (
        <div
          key={palette.id}
          onClick={() => onResume(palette.id)}
          className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 active:bg-slate-50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{palette.name}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {palette.dimensions.length} × {palette.dimensions.width} × {palette.dimensions.height}
              </p>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-blue-500">
                {palette.stats.fillRate}%
              </div>
              <div className="text-xs text-slate-400">
                {palette.stats.present}/{palette.stats.capacity}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              {formatDate(palette.updatedAt)}
            </span>

            <button
              onClick={(e) => handleDelete(palette.id, e)}
              className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                confirmDelete === palette.id
                  ? 'bg-red-500 text-white'
                  : 'text-red-500 hover:bg-red-50'
              }`}
            >
              {confirmDelete === palette.id ? 'Confirmer' : 'Supprimer'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
