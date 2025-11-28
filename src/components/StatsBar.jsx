import { useState } from 'react'

export default function StatsBar({ present, capacity, fillRate, extraCartons, totalPresent, name, onBack, onExtraCartonsChange }) {
  const [showExtraInput, setShowExtraInput] = useState(false)
  const [inputValue, setInputValue] = useState(extraCartons.toString())

  function handleSubmit(e) {
    e.preventDefault()
    const value = parseInt(inputValue, 10)
    if (!isNaN(value) && value >= 0) {
      onExtraCartonsChange(value)
    }
    setShowExtraInput(false)
  }

  function handleInputChange(e) {
    setInputValue(e.target.value)
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
                min="0"
                value={inputValue}
                onChange={handleInputChange}
                autoFocus
                className="w-16 px-2 py-1 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
            <button
              onClick={() => setShowExtraInput(true)}
              className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
            >
              <span className="font-bold">{extraCartons}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>

        {/* Total général */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Total :</span>
          <span className="font-bold text-lg text-green-600">{totalPresent}</span>
        </div>
      </div>
    </div>
  )
}
