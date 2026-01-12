import { useState } from 'react'
import PaletteList from './PaletteList'
import { exportReferencesCSV } from '../lib/export'

export default function Home({
  palettes,
  onNew,
  onResume,
  onDelete,
  onChangeReference
}) {
  const [search, setSearch] = useState('')

  return (
    <div className="h-full flex flex-col safe-top safe-bottom">
      {/* Header */}
      <header className="bg-blue-500 text-white px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventaire Palettes</h1>
            <p className="text-blue-100 text-sm mt-1">Comptez vos articles en 3D</p>
          </div>
          {palettes.length > 0 && (
            <button
              onClick={() => exportReferencesCSV(palettes)}
              className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
              title="Exporter CSV"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Bouton nouvelle palette */}
      <div className="p-4 pb-2">
        <button
          onClick={onNew}
          className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-colors"
        >
          + Nouvelle Palette
        </button>
      </div>

      {/* Barre de recherche */}
      {palettes.length > 0 && (
        <div className="px-4 pb-2">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une référence..."
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Liste des inventaires récents */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {palettes.length > 0 ? (
          <>
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
              Inventaires récents
            </h2>
            <PaletteList
              palettes={palettes}
              onResume={onResume}
              onDelete={onDelete}
              onChangeReference={onChangeReference}
              searchFilter={search}
            />
          </>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-3">📦</div>
            <p>Aucun inventaire pour l'instant</p>
            <p className="text-sm mt-1">Créez votre première palette</p>
          </div>
        )}
      </div>
    </div>
  )
}
