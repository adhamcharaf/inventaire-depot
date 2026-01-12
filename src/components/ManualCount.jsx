import { useState, useEffect, useRef, useMemo } from 'react'
import references from '../data/references'

// Évalue une expression mathématique simple (+ - × *)
function evaluateExpression(input) {
  if (!input || input.trim() === '') return null

  // Normaliser: remplacer × et x par *, supprimer espaces
  let expr = input.trim().replace(/×/g, '*').replace(/x/gi, '*').replace(/\s+/g, '')

  // Vérifier que l'expression est valide (chiffres et opérateurs seulement)
  if (!/^-?[\d]+([+\-*][\d]+)*$/.test(expr)) {
    return null
  }

  try {
    // Évaluer l'expression de manière sécurisée
    // On utilise Function au lieu de eval pour un peu plus de sécurité
    const result = Function('"use strict"; return (' + expr + ')')()

    if (!isFinite(result)) return null

    // Normaliser l'expression pour l'affichage (utiliser ×)
    const displayExpr = input.trim().replace(/\*/g, '×').replace(/x/gi, '×')

    return {
      expression: displayExpr,
      result: Math.round(result) // Arrondir au cas où
    }
  } catch {
    return null
  }
}

export default function ManualCount({ onBack }) {
  // État: { reference: { entries: [{expression, result}, ...], total: 25 }, ... }
  const [counts, setCounts] = useState({})
  const [currentRef, setCurrentRef] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredRefs, setFilteredRefs] = useState([])
  const dropdownRef = useRef(null)

  // Filtrer les références
  useEffect(() => {
    if (search.length > 0) {
      const filtered = references
        .filter(ref => ref.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 10)
      setFilteredRefs(filtered)
      setShowDropdown(filtered.length > 0)
    } else {
      setFilteredRefs([])
      setShowDropdown(false)
    }
  }, [search])

  // Fermer dropdown si clic extérieur
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
    setCurrentRef(ref)
    setSearch('')
    setShowDropdown(false)
    if (!counts[ref]) {
      setCounts(prev => ({ ...prev, [ref]: { entries: [], total: 0 } }))
    }
  }

  function addEntry() {
    if (!currentRef) return

    const evaluated = evaluateExpression(inputValue)
    if (!evaluated || evaluated.result === 0) return

    setCounts(prev => {
      const current = prev[currentRef] || { entries: [], total: 0 }
      const newEntries = [...current.entries, evaluated]
      const newTotal = newEntries.reduce((sum, e) => sum + e.result, 0)
      return {
        ...prev,
        [currentRef]: { entries: newEntries, total: newTotal }
      }
    })
    setInputValue('')
  }

  function removeEntry(index) {
    if (!currentRef) return
    setCounts(prev => {
      const current = prev[currentRef]
      const newEntries = current.entries.filter((_, i) => i !== index)
      const newTotal = newEntries.reduce((sum, e) => sum + e.result, 0)
      return {
        ...prev,
        [currentRef]: { entries: newEntries, total: newTotal }
      }
    })
  }

  function clearReference(ref) {
    setCounts(prev => {
      const newCounts = { ...prev }
      delete newCounts[ref]
      return newCounts
    })
    if (currentRef === ref) {
      setCurrentRef(null)
    }
  }

  function exportCSV() {
    const lines = ['reference;quantite;detail']
    Object.entries(counts).forEach(([ref, data]) => {
      if (data.total !== 0 || data.entries.length > 0) {
        // Format: expression=result pour chaque entrée
        const detail = data.entries.map((e, i) => {
          const prefix = i === 0 ? '' : (e.result >= 0 ? ' + ' : ' - ')
          const expr = e.result >= 0 ? e.expression : e.expression.replace(/^-/, '')
          return `${prefix}${expr}`
        }).join('')
        lines.push(`${ref};${data.total};${detail}`)
      }
    })

    const csv = lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `comptage-manuel-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Fonctions calculatrice
  function appendToInput(char) {
    setInputValue(prev => prev + char)
  }

  function backspace() {
    setInputValue(prev => prev.slice(0, -1))
  }

  function clearInput() {
    setInputValue('')
  }

  // Aperçu du résultat en temps réel
  const preview = useMemo(() => {
    if (!inputValue) return null
    const result = evaluateExpression(inputValue)
    return result ? result.result : null
  }, [inputValue])

  // Références avec des comptages
  const usedRefs = Object.keys(counts).filter(ref => counts[ref].entries.length > 0)

  // Total général
  const grandTotal = Object.values(counts).reduce((sum, data) => sum + data.total, 0)

  return (
    <div className="h-full flex flex-col safe-top safe-bottom bg-slate-50">
      {/* Header */}
      <header className="bg-amber-500 text-white px-4 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-amber-600 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Comptage Manuel</h1>
        {usedRefs.length > 0 && (
          <button
            onClick={exportCSV}
            className="p-2 hover:bg-amber-600 rounded-lg transition-colors"
            title="Exporter CSV"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        )}
      </header>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sélection référence */}
        <div className="p-4 bg-white border-b border-slate-200">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Référence en cours
          </label>
          {currentRef ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl font-bold text-amber-700">
                {currentRef}
              </div>
              <button
                onClick={() => setCurrentRef(null)}
                className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une référence..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
              {showDropdown && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {filteredRefs.map((ref, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => selectReference(ref)}
                        className="w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors first:rounded-t-xl last:rounded-b-xl flex items-center justify-between"
                      >
                        <span>{ref}</span>
                        {counts[ref] && counts[ref].total !== 0 && (
                          <span className="text-sm font-bold text-amber-600">{counts[ref].total}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Calculatrice */}
        {currentRef && (
          <div className="bg-white border-b border-slate-200">
            {/* Écran */}
            <div className="bg-slate-800 text-white p-4 mx-4 mt-4 rounded-t-xl">
              <div className="text-right text-2xl font-mono min-h-[2rem] flex items-center justify-end">
                <span>{inputValue || '0'}</span>
                {preview !== null && (
                  <span className="text-slate-400 ml-3">= {preview}</span>
                )}
              </div>
            </div>

            {/* Boutons */}
            <div className="grid grid-cols-4 gap-1 p-2 mx-4 mb-4 bg-slate-200 rounded-b-xl">
              {/* Ligne 1: 7 8 9 × */}
              <button onClick={() => appendToInput('7')} className="bg-white hover:bg-slate-50 text-slate-800 text-2xl font-bold py-4 rounded-lg active:scale-95 transition-all">7</button>
              <button onClick={() => appendToInput('8')} className="bg-white hover:bg-slate-50 text-slate-800 text-2xl font-bold py-4 rounded-lg active:scale-95 transition-all">8</button>
              <button onClick={() => appendToInput('9')} className="bg-white hover:bg-slate-50 text-slate-800 text-2xl font-bold py-4 rounded-lg active:scale-95 transition-all">9</button>
              <button onClick={() => appendToInput('×')} className="bg-amber-500 hover:bg-amber-600 text-white text-2xl font-bold py-4 rounded-lg active:scale-95 transition-all">×</button>

              {/* Ligne 2: 4 5 6 - */}
              <button onClick={() => appendToInput('4')} className="bg-white hover:bg-slate-50 text-slate-800 text-2xl font-bold py-4 rounded-lg active:scale-95 transition-all">4</button>
              <button onClick={() => appendToInput('5')} className="bg-white hover:bg-slate-50 text-slate-800 text-2xl font-bold py-4 rounded-lg active:scale-95 transition-all">5</button>
              <button onClick={() => appendToInput('6')} className="bg-white hover:bg-slate-50 text-slate-800 text-2xl font-bold py-4 rounded-lg active:scale-95 transition-all">6</button>
              <button onClick={() => appendToInput('-')} className="bg-amber-500 hover:bg-amber-600 text-white text-2xl font-bold py-4 rounded-lg active:scale-95 transition-all">−</button>

              {/* Ligne 3: 1 2 3 + */}
              <button onClick={() => appendToInput('1')} className="bg-white hover:bg-slate-50 text-slate-800 text-2xl font-bold py-4 rounded-lg active:scale-95 transition-all">1</button>
              <button onClick={() => appendToInput('2')} className="bg-white hover:bg-slate-50 text-slate-800 text-2xl font-bold py-4 rounded-lg active:scale-95 transition-all">2</button>
              <button onClick={() => appendToInput('3')} className="bg-white hover:bg-slate-50 text-slate-800 text-2xl font-bold py-4 rounded-lg active:scale-95 transition-all">3</button>
              <button onClick={() => appendToInput('+')} className="bg-amber-500 hover:bg-amber-600 text-white text-2xl font-bold py-4 rounded-lg active:scale-95 transition-all">+</button>

              {/* Ligne 4: C 0 ← = */}
              <button onClick={clearInput} className="bg-red-500 hover:bg-red-600 text-white text-xl font-bold py-4 rounded-lg active:scale-95 transition-all">C</button>
              <button onClick={() => appendToInput('0')} className="bg-white hover:bg-slate-50 text-slate-800 text-2xl font-bold py-4 rounded-lg active:scale-95 transition-all">0</button>
              <button onClick={backspace} className="bg-slate-400 hover:bg-slate-500 text-white text-xl font-bold py-4 rounded-lg active:scale-95 transition-all">←</button>
              <button onClick={addEntry} disabled={!inputValue || preview === null} className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white text-2xl font-bold py-4 rounded-lg active:scale-95 transition-all">=</button>
            </div>
          </div>
        )}

        {/* Liste des comptages */}
        <div className="flex-1 overflow-auto p-4">
          {currentRef && counts[currentRef] && counts[currentRef].entries.length > 0 ? (
            // Détail de la référence en cours
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                <span className="font-bold text-amber-700">Détail des entrées</span>
                <span className="text-2xl font-bold text-amber-600">{counts[currentRef].total}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {counts[currentRef].entries.map((entry, idx) => (
                  <div key={idx} className="px-4 py-3 flex items-center justify-between">
                    <div className={`text-lg font-mono ${entry.result >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="text-slate-500">{entry.expression}</span>
                      <span className="mx-2">=</span>
                      <span className="font-bold">{entry.result >= 0 ? '+' : ''}{entry.result}</span>
                    </div>
                    <button
                      onClick={() => removeEntry(idx)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                <p className="text-sm text-slate-500 font-mono">
                  {counts[currentRef].entries.map((e, i) => {
                    const prefix = i === 0 ? '' : (e.result >= 0 ? ' + ' : ' - ')
                    const expr = e.result >= 0 ? e.expression : e.expression.replace(/^-/, '')
                    return `${prefix}${expr}`
                  }).join('')} = <span className="font-bold text-slate-700">{counts[currentRef].total}</span>
                </p>
              </div>
            </div>
          ) : currentRef ? (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p>Commencez à entrer des nombres</p>
            </div>
          ) : (
            // Résumé de toutes les références comptées
            <div className="space-y-3">
              {usedRefs.length > 0 ? (
                <>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    Références comptées ({usedRefs.length})
                  </h3>
                  {usedRefs.map(ref => (
                    <div
                      key={ref}
                      className="bg-white rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => selectReference(ref)}
                          className="font-bold text-slate-800 hover:text-amber-600 transition-colors"
                        >
                          {ref}
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-amber-600">{counts[ref].total}</span>
                          <button
                            onClick={() => clearReference(ref)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 font-mono truncate">
                        {counts[ref].entries.map((e, i) => {
                          const prefix = i === 0 ? '' : (e.result >= 0 ? ' + ' : ' - ')
                          const expr = e.result >= 0 ? e.expression : e.expression.replace(/^-/, '')
                          return `${prefix}${expr}`
                        }).join('')}
                      </p>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>Sélectionnez une référence pour commencer</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total général */}
        {usedRefs.length > 0 && !currentRef && (
          <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total général</span>
              <span className="text-3xl font-bold">{grandTotal}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
