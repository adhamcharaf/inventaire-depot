import { useState } from 'react'

export default function Controls({ onFill, onEmpty, onResetView, onViewChange, onZoom }) {
  const [confirmEmpty, setConfirmEmpty] = useState(false)

  function handleEmpty() {
    if (confirmEmpty) {
      onEmpty()
      setConfirmEmpty(false)
    } else {
      setConfirmEmpty(true)
      setTimeout(() => setConfirmEmpty(false), 3000)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-t-2xl px-4 py-4 safe-bottom">
      {/* Vues rapides */}
      <div className="flex justify-center gap-2 mb-4">
        <ViewButton label="Face" onClick={() => onViewChange('front')} />
        <ViewButton label="Côté" onClick={() => onViewChange('side')} />
        <ViewButton label="Dessus" onClick={() => onViewChange('top')} />
        <ViewButton label="Iso" onClick={() => onViewChange('iso')} active />
      </div>

      {/* Zoom */}
      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={() => onZoom(-1)}
          className="w-12 h-12 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-full flex items-center justify-center text-xl font-bold text-slate-600 transition-colors"
        >
          +
        </button>
        <button
          onClick={onResetView}
          className="px-4 h-12 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-full flex items-center justify-center text-sm font-medium text-slate-600 transition-colors"
        >
          Reset vue
        </button>
        <button
          onClick={() => onZoom(1)}
          className="w-12 h-12 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-full flex items-center justify-center text-xl font-bold text-slate-600 transition-colors"
        >
          -
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onFill}
          className="flex-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          Tout remplir
        </button>
        <button
          onClick={handleEmpty}
          className={`flex-1 font-semibold py-3 px-4 rounded-xl transition-colors ${
            confirmEmpty
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
        >
          {confirmEmpty ? 'Confirmer vider' : 'Tout vider'}
        </button>
      </div>
    </div>
  )
}

function ViewButton({ label, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-100 text-blue-600'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
      }`}
    >
      {label}
    </button>
  )
}
