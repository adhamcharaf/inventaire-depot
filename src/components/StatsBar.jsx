import { useState } from 'react'

export default function StatsBar({ present, capacity, fillRate, extraCartons, totalPresent, name, onBack, onExtraCartonsChange }) {
  const [showExtraInput, setShowExtraInput] = useState(false)
  const [inputValue, setInputValue] = useState(extraCartons.toString())
  const [showPaletteCalc, setShowPaletteCalc] = useState(false)
  const [paletteBase, setPaletteBase] = useState('')
  const [paletteHeight, setPaletteHeight] = useState('')

  const paletteTotal = paletteBase && paletteHeight
    ? parseInt(paletteBase, 10) * parseInt(paletteHeight, 10)
    : 0

  function handleSubmit(e) {
    e.preventDefault()
    const value = parseInt(inputValue, 10)
    if (!isNaN(value)) {
      onExtraCartonsChange(value)
    }
    setShowExtraInput(false)
  }

  function handleInputChange(e) {
    setInputValue(e.target.value)
  }

  function handlePaletteAdd() {
    if (paletteTotal > 0) {
      const newValue = extraCartons + paletteTotal
      onExtraCartonsChange(newValue)
      setPaletteBase('')
      setPaletteHeight('')
      setShowPaletteCalc(false)
    }
  }

  function handlePaletteRemove() {
    if (paletteTotal > 0) {
      const newValue = extraCartons - paletteTotal
      onExtraCartonsChange(newValue)
      setPaletteBase('')
      setPaletteHeight('')
      setShowPaletteCalc(false)
    }
  }

  return (
    <div className="bg-white shadow-md px-4 py-3 safe-top">
      <div className="flex items-center justify-between">
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

        {/* Badge stats principal */}
        <div className="bg-blue-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
          <span className="font-bold">{present}/{capacity}</span>
          <span className="text-blue-200">|</span>
          <span className="font-bold">{fillRate}%</span>
        </div>
      </div>

      {/* Ligne des cartons supplémentaires */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Cartons de côté :</span>
          {showExtraInput ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-1">
              <input
                type="number"
                value={inputValue}
                onChange={handleInputChange}
                autoFocus
                className="w-20 px-2 py-1 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="submit"
                className="p-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputValue(extraCartons.toString())
                  setShowExtraInput(false)
                }}
                className="p-1 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExtraInput(true)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                  extraCartons >= 0
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                <span className="font-bold">{extraCartons}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => setShowPaletteCalc(!showPaletteCalc)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showPaletteCalc
                    ? 'bg-purple-500 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
                title="Calculateur palette"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Total général */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Total :</span>
          <span className="font-bold text-lg text-green-600">{totalPresent}</span>
        </div>
      </div>

      {/* Calculateur de palette */}
      {showPaletteCalc && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="bg-purple-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-purple-700">Calculateur palette</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs text-purple-600">Base</label>
                <input
                  type="number"
                  min="1"
                  value={paletteBase}
                  onChange={(e) => setPaletteBase(e.target.value)}
                  placeholder="ex: 12"
                  className="w-full px-2 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
              <span className="text-purple-400 mt-4">×</span>
              <div className="flex-1">
                <label className="text-xs text-purple-600">Hauteur</label>
                <input
                  type="number"
                  min="1"
                  value={paletteHeight}
                  onChange={(e) => setPaletteHeight(e.target.value)}
                  placeholder="ex: 5"
                  className="w-full px-2 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
              <span className="text-purple-400 mt-4">=</span>
              <div className="mt-4">
                <span className="font-bold text-lg text-purple-700">{paletteTotal || '?'}</span>
              </div>
            </div>
            {paletteTotal > 0 && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handlePaletteAdd}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter {paletteTotal}
                </button>
                <button
                  onClick={handlePaletteRemove}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  Retirer {paletteTotal}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
