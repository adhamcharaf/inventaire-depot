import { useState } from 'react'
import { PALETTE_CONFIG } from '../lib/config'

export default function PaletteForm({ onCreate, onBack }) {
  const [length, setLength] = useState(PALETTE_CONFIG.length.default)
  const [width, setWidth] = useState(PALETTE_CONFIG.width.default)
  const [height, setHeight] = useState(PALETTE_CONFIG.height.default)
  const [name, setName] = useState('')

  const capacity = length * width * height

  function handleSubmit(e) {
    e.preventDefault()
    onCreate({ length, width, height }, name)
  }

  return (
    <div className="h-full flex flex-col safe-top safe-bottom bg-white">
      {/* Header */}
      <header className="bg-blue-500 text-white px-4 py-4 flex items-center">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-blue-600 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold ml-2">Nouvelle Palette</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 overflow-auto">
        {/* Nom optionnel */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Nom (optionnel)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Palette Zone A"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Sliders dimensions */}
        <div className="space-y-6 flex-1">
          <DimensionSlider
            label="Longueur (L)"
            value={length}
            onChange={setLength}
            min={PALETTE_CONFIG.length.min}
            max={PALETTE_CONFIG.length.max}
          />

          <DimensionSlider
            label="Largeur (l)"
            value={width}
            onChange={setWidth}
            min={PALETTE_CONFIG.width.min}
            max={PALETTE_CONFIG.width.max}
          />

          <DimensionSlider
            label="Hauteur (H)"
            value={height}
            onChange={setHeight}
            min={PALETTE_CONFIG.height.min}
            max={PALETTE_CONFIG.height.max}
          />
        </div>

        {/* Capacité + Bouton */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="text-center mb-4">
            <span className="text-slate-500">Capacité totale : </span>
            <span className="text-2xl font-bold text-blue-500">{capacity}</span>
            <span className="text-slate-500"> articles</span>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-colors"
          >
            Créer la palette
          </button>
        </div>
      </form>
    </div>
  )
}

function DimensionSlider({ label, value, onChange, min, max }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-slate-600">{label}</label>
        <span className="text-lg font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-lg">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
