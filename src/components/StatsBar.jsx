export default function StatsBar({ present, capacity, fillRate, name, onBack }) {
  return (
    <div className="bg-white shadow-md px-4 py-3 flex items-center justify-between safe-top">
      {/* Bouton retour */}
      <button
        onClick={onBack}
        className="p-2 -ml-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Nom */}
      <div className="flex-1 text-center">
        <h1 className="font-semibold text-slate-800 truncate px-2">{name}</h1>
      </div>

      {/* Badge stats */}
      <div className="bg-blue-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
        <span className="font-bold">{present}/{capacity}</span>
        <span className="text-blue-200">|</span>
        <span className="font-bold">{fillRate}%</span>
      </div>
    </div>
  )
}
