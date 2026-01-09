import PaletteList from './PaletteList'

export default function Home({
  palettes,
  onNew,
  onResume,
  onDelete,
  onChangeReference
}) {
  return (
    <div className="h-full flex flex-col safe-top safe-bottom">
      {/* Header */}
      <header className="bg-blue-500 text-white px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold">Inventaire Palettes</h1>
          <p className="text-blue-100 text-sm mt-1">Comptez vos articles en 3D</p>
        </div>
      </header>

      {/* Bouton nouvelle palette */}
      <div className="p-4">
        <button
          onClick={onNew}
          className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-colors"
        >
          + Nouvelle Palette
        </button>
      </div>

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
