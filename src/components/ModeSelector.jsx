export default function ModeSelector({ onSelectMode, onBack }) {
  return (
    <div className="h-full flex flex-col safe-top safe-bottom bg-gradient-to-br from-blue-500 to-blue-600">
      <header className="px-4 py-8 text-center text-white relative">
        {onBack && (
          <button onClick={onBack} className="absolute left-4 top-8 p-2 hover:bg-blue-700/50 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-3xl font-bold">Inventaire Palettes</h1>
        <p className="text-blue-100 mt-2">Choisissez votre mode de comptage</p>
      </header>

      <div className="flex-1 flex flex-col justify-center p-6 gap-6">
        <button
          onClick={() => onSelectMode('manual')}
          className="bg-white rounded-2xl p-6 shadow-xl active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-xl font-bold text-slate-800">Comptage Manuel</h2>
              <p className="text-sm text-slate-500 mt-1">
                Additionnez vos lots a la main, reference par reference
              </p>
            </div>
            <svg className="w-6 h-6 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => onSelectMode('app')}
          className="bg-white rounded-2xl p-6 shadow-xl active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-xl font-bold text-slate-800">Comptage 3D</h2>
              <p className="text-sm text-slate-500 mt-1">
                Visualisez vos palettes en 3D et retirez les articles
              </p>
            </div>
            <svg className="w-6 h-6 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      <div className="p-6 text-center text-blue-200 text-sm">
        Les deux modes permettent d'exporter les resultats
      </div>
    </div>
  )
}
