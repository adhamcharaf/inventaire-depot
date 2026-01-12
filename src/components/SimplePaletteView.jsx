import { useState, useEffect } from 'react'

export default function SimplePaletteView({ palette, onUpdate, onBack }) {
  const [extraCartons, setExtraCartons] = useState(palette.extraCartons || 0)
  const [showExtraInput, setShowExtraInput] = useState(false)
  const [inputValue, setInputValue] = useState(extraCartons.toString())

  const { base, height } = palette.dimensions
  const paletteCapacity = base * height
  const totalPresent = paletteCapacity + extraCartons

  // Sync extraCartons avec la palette
  useEffect(() => {
    setExtraCartons(palette.extraCartons || 0)
    setInputValue((palette.extraCartons || 0).toString())
  }, [palette.extraCartons])

  function handleExtraSubmit(e) {
    e.preventDefault()
    const value = parseInt(inputValue, 10)
    if (!isNaN(value)) {
      const updated = { ...palette, extraCartons: value }
      onUpdate(updated)
      setExtraCartons(value)
    }
    setShowExtraInput(false)
  }

  return (
    <div className="h-full flex flex-col safe-top safe-bottom bg-slate-50">
      {/* Header */}
      <header className="bg-purple-500 text-white px-4 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-purple-600 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold flex-1 text-center truncate px-2">{palette.name}</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="flex-1 flex flex-col p-4 overflow-auto">
        {/* Référence */}
        {palette.reference && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <span className="text-sm text-slate-500">Référence</span>
            <p className="font-bold text-lg text-purple-700">{palette.reference}</p>
          </div>
        )}

        {/* Info palette de base */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="text-center">
            <span className="text-sm text-slate-500">Configuration de base</span>
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="bg-purple-100 rounded-lg px-4 py-2">
                <span className="text-xs text-purple-600 block">Base</span>
                <span className="text-2xl font-bold text-purple-700">{base}</span>
              </div>
              <span className="text-2xl text-slate-400">×</span>
              <div className="bg-purple-100 rounded-lg px-4 py-2">
                <span className="text-xs text-purple-600 block">Hauteur</span>
                <span className="text-2xl font-bold text-purple-700">{height}</span>
              </div>
              <span className="text-2xl text-slate-400">=</span>
              <div className="bg-purple-500 rounded-lg px-4 py-2">
                <span className="text-xs text-purple-200 block">Par palette</span>
                <span className="text-2xl font-bold text-white">{paletteCapacity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cartons de côté (ajustement) */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Ajustement (cartons)</span>
            {showExtraInput ? (
              <form onSubmit={handleExtraSubmit} className="flex items-center gap-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoFocus
                  className="w-24 px-3 py-2 text-center border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
                <button
                  type="submit"
                  className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputValue(extraCartons.toString())
                    setShowExtraInput(false)
                  }}
                  className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowExtraInput(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  extraCartons >= 0
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                <span className="font-bold text-lg">{extraCartons >= 0 ? '+' : ''}{extraCartons}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg mt-auto">
          <div className="text-center">
            <span className="text-purple-200 text-sm">Total articles</span>
            <p className="text-5xl font-bold text-white mt-1">{totalPresent}</p>
            <p className="text-purple-200 text-sm mt-2">
              {paletteCapacity} {extraCartons !== 0 ? (extraCartons >= 0 ? '+' : '') + ' ' + extraCartons + ' cartons' : 'cartons'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
