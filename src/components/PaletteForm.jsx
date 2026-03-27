import { useState, useEffect, useRef } from 'react'
import { PALETTE_CONFIG } from '../lib/config'
import { useSession } from '../context/SessionContext'
import { supabase } from '../lib/supabase'

export default function PaletteForm({ onCreate, onBack, preselectedReference }) {
  const { sessionId } = useSession()
  const [length, setLength] = useState(PALETTE_CONFIG.length.default)
  const [width, setWidth] = useState(PALETTE_CONFIG.width.default)
  const [height, setHeight] = useState(PALETTE_CONFIG.height.default)
  const [name, setName] = useState('')
  const [reference, setReference] = useState(preselectedReference || null)

  // References from session
  const [sessionRefs, setSessionRefs] = useState([])
  const [loadingRefs, setLoadingRefs] = useState(true)

  // Autocomplete
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredRefs, setFilteredRefs] = useState([])
  const dropdownRef = useRef(null)

  const capacity = length * width * height

  // Load references for this session from Supabase
  useEffect(() => {
    if (!sessionId) return
    setLoadingRefs(true)
    supabase.rpc('get_session_references', { p_session_id: sessionId })
      .then(({ data, error }) => {
        if (!error && data) {
          setSessionRefs(data.map(r => r.reference))
        } else {
          console.error('Failed to load session refs:', error)
          setSessionRefs([])
        }
        setLoadingRefs(false)
      })
  }, [sessionId])

  // Filter references when typing
  useEffect(() => {
    if (search.length > 0) {
      const term = search.toLowerCase()
      const filtered = sessionRefs
        .filter(ref => ref.toLowerCase().includes(term))
        .slice(0, 10)

      // Check if search matches exactly an existing ref
      const exactMatch = sessionRefs.some(r => r.toLowerCase() === term)

      setFilteredRefs(filtered)
      // Show dropdown if there are matches OR if user typed something (to show "add manual" option)
      setShowDropdown(filtered.length > 0 || (!exactMatch && search.trim().length > 0))
    } else {
      setFilteredRefs([])
      setShowDropdown(false)
    }
  }, [search, sessionRefs])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectReference(ref) {
    setSearch('')
    setReference(ref)
    setShowDropdown(false)
  }

  function addManualReference() {
    const trimmed = search.trim().toUpperCase()
    if (!trimmed) return
    selectReference(trimmed)
  }

  function clearReference() {
    setReference(null)
  }

  function handleSubmit(e) {
    e.preventDefault()
    onCreate({ length, width, height }, name, reference)
  }

  const isManualRef = reference && !sessionRefs.includes(reference)
  const searchNotInSession = search.trim().length > 0 &&
    !sessionRefs.some(r => r.toLowerCase() === search.trim().toLowerCase())

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
        {/* Reference */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Reference article <span className="text-red-500">*</span>
          </label>

          {reference ? (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
              isManualRef
                ? 'bg-amber-50 border-amber-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <span className={`flex-1 font-medium ${isManualRef ? 'text-amber-700' : 'text-blue-700'}`}>
                {reference}
              </span>
              {isManualRef && (
                <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                  hors liste
                </span>
              )}
              <button
                type="button"
                onClick={clearReference}
                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : loadingRefs ? (
            <div className="px-4 py-3 text-slate-400 text-sm">Chargement des references...</div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={sessionRefs.length > 0 ? 'Rechercher une reference...' : 'Aucune reference dans cette session'}
                className="w-full px-4 py-3 border border-amber-300 bg-amber-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {showDropdown && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
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
                  {searchNotInSession && (
                    <li>
                      <button
                        type="button"
                        onClick={addManualReference}
                        className="w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors border-t border-slate-100 text-amber-700"
                      >
                        + Ajouter "{search.trim().toUpperCase()}" (hors liste)
                      </button>
                    </li>
                  )}
                </ul>
              )}
              <p className="text-xs text-amber-600 mt-1">
                {sessionRefs.length} reference(s) disponible(s) — ou saisissez une reference manuelle
              </p>
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
            placeholder="Par defaut: date et heure"
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

        {/* Capacite + Bouton */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="text-center mb-4">
            <span className="text-slate-500">Capacite totale : </span>
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
            Creer la palette
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
