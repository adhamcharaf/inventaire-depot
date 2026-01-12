import { useState, useEffect, useRef } from 'react'
import { PALETTE_CONFIG } from '../lib/config'
import references from '../data/references'

export default function PaletteForm({ onCreate, onBack }) {
  // Type de palette: 'classic' (3D) ou 'simple' (base × hauteur)
  const [paletteType, setPaletteType] = useState('classic')

  // Dimensions palette classique
  const [length, setLength] = useState(PALETTE_CONFIG.length.default)
  const [width, setWidth] = useState(PALETTE_CONFIG.width.default)
  const [height, setHeight] = useState(PALETTE_CONFIG.height.default)

  // Dimensions palette simple (coupée)
  const [base, setBase] = useState(12)
  const [simpleHeight, setSimpleHeight] = useState(5)

  const [name, setName] = useState('')
  const [reference, setReference] = useState(null)

  // Autocomplete
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredRefs, setFilteredRefs] = useState([])
  const dropdownRef = useRef(null)

  const capacity = paletteType === 'classic'
    ? length * width * height
    : base * simpleHeight

  // Filtrer les références quand on tape
  useEffect(() => {
    if (search.length > 0) {
      const filtered = references
        .filter(ref => ref.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 10) // Limiter à 10 résultats
      setFilteredRefs(filtered)
      setShowDropdown(filtered.length > 0)
    } else {
      setFilteredRefs([])
      setShowDropdown(false)
    }
  }, [search])

  // Fermer le dropdown si clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sélectionner une référence
  function selectReference(ref) {
    setSearch('')
    setReference(ref)
    setShowDropdown(false)
  }

  // Effacer la référence sélectionnée
  function clearReference() {
    setReference(null)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (paletteType === 'classic') {
      onCreate({ length, width, height }, name, reference, 'classic')
    } else {
      onCreate({ base, height: simpleHeight }, name, reference, 'simple')
    }
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
        {/* Sélection du type de palette */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Type de palette
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaletteType('classic')}
              className={`p-3 rounded-xl border-2 transition-all ${
                paletteType === 'classic'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="font-medium text-sm">Classique</span>
                <span className="text-xs opacity-70">L × l × H</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPaletteType('simple')}
              className={`p-3 rounded-xl border-2 transition-all ${
                paletteType === 'simple'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-sm">Coupée</span>
                <span className="text-xs opacity-70">Base × H</span>
              </div>
            </button>
          </div>
        </div>

        {/* Référence sélectionnée ou recherche (obligatoire) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Référence article <span className="text-red-500">*</span>
          </label>

          {reference ? (
            // Afficher la référence sélectionnée
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="flex-1 font-medium text-blue-700">{reference}</span>
              <button
                type="button"
                onClick={clearReference}
                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            // Barre de recherche
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tapez pour rechercher..."
                className="w-full px-4 py-3 border border-amber-300 bg-amber-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {showDropdown && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {filteredRefs.map((ref, idx) => (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => selectReference(ref)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        {ref}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-amber-600 mt-1">Sélectionnez une référence pour continuer</p>
            </div>
          )}
        </div>

        {/* Nom optionnel */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Nom (optionnel)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Par défaut: date et heure"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Dimensions selon le type */}
        <div className="space-y-6 flex-1">
          {paletteType === 'classic' ? (
            // Palette classique: L × l × H
            <>
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
            </>
          ) : (
            // Palette coupée: Base × Hauteur
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Base (articles/couche)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={base}
                    onChange={(e) => setBase(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 text-lg font-bold text-center border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
                <span className="text-2xl text-purple-400 mt-6">×</span>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Hauteur (couches)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={simpleHeight}
                    onChange={(e) => setSimpleHeight(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 text-lg font-bold text-center border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
              <p className="text-sm text-purple-600 text-center">
                Utilisez ce type pour les palettes non-uniformes où seul le nombre par couche est constant.
              </p>
            </div>
          )}
        </div>

        {/* Capacité + Bouton */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="text-center mb-4">
            <span className="text-slate-500">Capacité totale : </span>
            <span className={`text-2xl font-bold ${paletteType === 'classic' ? 'text-blue-500' : 'text-purple-500'}`}>
              {capacity}
            </span>
            <span className="text-slate-500"> articles</span>
          </div>

          <button
            type="submit"
            disabled={!reference}
            className={`w-full font-semibold py-4 px-6 rounded-xl shadow-lg transition-colors ${
              reference
                ? paletteType === 'classic'
                  ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
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
