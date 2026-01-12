import { useState, useEffect, useRef } from 'react'
import { PALETTE_CONFIG } from '../lib/config'
import defaultReferences from '../data/references'
import { getCustomReferences, addCustomReference } from '../db/indexeddb'

export default function PaletteForm({ onCreate, onBack }) {
  const [length, setLength] = useState(PALETTE_CONFIG.length.default)
  const [width, setWidth] = useState(PALETTE_CONFIG.width.default)
  const [height, setHeight] = useState(PALETTE_CONFIG.height.default)
  const [name, setName] = useState('')
  const [reference, setReference] = useState(null)

  // Autocomplete
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredRefs, setFilteredRefs] = useState([])
  const [allReferences, setAllReferences] = useState(defaultReferences)
  const dropdownRef = useRef(null)

  const capacity = length * width * height

  // Charger les références personnalisées au démarrage
  useEffect(() => {
    async function loadCustomRefs() {
      const customRefs = await getCustomReferences()
      const combined = [...new Set([...defaultReferences, ...customRefs])].sort()
      setAllReferences(combined)
    }
    loadCustomRefs()
  }, [])

  // Vérifier si la recherche correspond exactement à une référence existante
  const exactMatch = search.length > 0 && allReferences.some(
    ref => ref.toLowerCase() === search.toLowerCase()
  )

  // Filtrer les références quand on tape
  useEffect(() => {
    if (search.length > 0) {
      const filtered = allReferences
        .filter(ref => ref.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 10) // Limiter à 10 résultats
      setFilteredRefs(filtered)
      setShowDropdown(true)
    } else {
      setFilteredRefs([])
      setShowDropdown(false)
    }
  }, [search, allReferences])

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

  // Créer une nouvelle référence
  async function createNewReference() {
    const trimmed = search.trim()
    if (trimmed.length === 0) return

    await addCustomReference(trimmed)
    setAllReferences(prev => [...new Set([...prev, trimmed])].sort())
    selectReference(trimmed)
  }

  // Effacer la référence sélectionnée
  function clearReference() {
    setReference(null)
  }

  function handleSubmit(e) {
    e.preventDefault()
    onCreate({ length, width, height }, name, reference)
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
                  {/* Option pour créer une nouvelle référence */}
                  {search.trim().length > 0 && !exactMatch && (
                    <li>
                      <button
                        type="button"
                        onClick={createNewReference}
                        className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors border-b border-slate-100 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-green-700">
                          Créer "<span className="font-medium">{search.trim()}</span>"
                        </span>
                      </button>
                    </li>
                  )}
                  {filteredRefs.map((ref, idx) => (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => selectReference(ref)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors"
                      >
                        {ref}
                      </button>
                    </li>
                  ))}
                  {filteredRefs.length === 0 && exactMatch && (
                    <li className="px-4 py-3 text-slate-400 text-center">
                      Aucun résultat
                    </li>
                  )}
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
            disabled={!reference}
            className={`w-full font-semibold py-4 px-6 rounded-xl shadow-lg transition-colors ${
              reference
                ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'
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
