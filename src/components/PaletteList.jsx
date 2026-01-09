import { useState } from 'react'
import references from '../data/references'

export default function PaletteList({ palettes, onResume, onDelete, onChangeReference }) {
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [expandedGroups, setExpandedGroups] = useState({})

  function formatDate(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return "À l'instant"
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  function handleDelete(id, e) {
    e.stopPropagation()
    if (confirmDelete === id) {
      onDelete(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  function toggleGroup(reference) {
    setExpandedGroups(prev => ({
      ...prev,
      [reference]: !prev[reference]
    }))
  }

  function calculateGroupStats(groupPalettes) {
    const totalPresent = groupPalettes.reduce((sum, p) => sum + p.stats.present, 0)
    const totalExtra = groupPalettes.reduce((sum, p) => sum + (p.extraCartons || 0), 0)
    const totalCapacity = groupPalettes.reduce((sum, p) => sum + p.stats.capacity, 0)
    const grandTotal = totalPresent + totalExtra
    const fillRate = totalCapacity > 0 ? ((totalPresent / totalCapacity) * 100).toFixed(1) : 0
    return { totalPresent, totalExtra, totalCapacity, grandTotal, fillRate }
  }

  // Grouper les palettes par référence
  const groupedPalettes = {}
  const ungroupedPalettes = []

  palettes.forEach(palette => {
    if (palette.reference) {
      if (!groupedPalettes[palette.reference]) {
        groupedPalettes[palette.reference] = []
      }
      groupedPalettes[palette.reference].push(palette)
    } else {
      ungroupedPalettes.push(palette)
    }
  })

  // Extraire les références uniques utilisées
  const usedReferences = Object.keys(groupedPalettes).sort()

  // Initialiser expandedGroups pour les nouvelles références
  usedReferences.forEach(ref => {
    if (expandedGroups[ref] === undefined) {
      expandedGroups[ref] = true
    }
  })

  const PaletteCard = ({ palette }) => {
    const extraCartons = palette.extraCartons || 0
    const totalCartons = palette.stats.present + extraCartons

    return (
      <div
        onClick={() => onResume(palette.id)}
        className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 active:bg-slate-50 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{palette.name}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {palette.dimensions.length} × {palette.dimensions.width} × {palette.dimensions.height}
            </p>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-blue-500">
              {palette.stats.fillRate}%
            </div>
            <div className="text-xs text-slate-400">
              {palette.stats.present}/{palette.stats.capacity}
              {extraCartons > 0 && (
                <span className="text-amber-600"> +{extraCartons}</span>
              )}
            </div>
            {extraCartons > 0 && (
              <div className="text-xs font-semibold text-green-600">
                Total: {totalCartons}
              </div>
            )}
          </div>
        </div>

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          {formatDate(palette.updatedAt)}
        </span>

        <div className="flex items-center gap-2">
          {/* Sélecteur de référence */}
          {references.length > 0 && (
            <select
              value={palette.reference || ''}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation()
                onChangeReference(palette.id, e.target.value || null)
              }}
              className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 max-w-[120px]"
            >
              <option value="">Sans réf.</option>
              {references.map(ref => (
                <option key={ref} value={ref}>{ref}</option>
              ))}
            </select>
          )}

          <button
            onClick={(e) => handleDelete(palette.id, e)}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              confirmDelete === palette.id
                ? 'bg-red-500 text-white'
                : 'text-red-500 hover:bg-red-50'
            }`}
          >
            {confirmDelete === palette.id ? 'Confirmer' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
    )
  }

  const ReferenceSection = ({ reference, palettesInGroup }) => {
    const stats = calculateGroupStats(palettesInGroup)
    const isExpanded = expandedGroups[reference] !== false

    return (
      <div className="mb-4">
        {/* En-tête de la référence */}
        <button
          onClick={() => toggleGroup(reference)}
          className="w-full flex items-center justify-between bg-blue-50 rounded-xl p-4 mb-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-900">{reference}</h3>
              <p className="text-xs text-slate-500">{palettesInGroup.length} palette{palettesInGroup.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats du groupe */}
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {stats.grandTotal}
              </div>
              <div className="text-xs text-slate-500">
                {stats.totalPresent}/{stats.totalCapacity}
                {stats.totalExtra > 0 && (
                  <span className="text-amber-600"> +{stats.totalExtra}</span>
                )}
              </div>
            </div>

            {/* Chevron */}
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Palettes de cette référence */}
        {isExpanded && (
          <div className="space-y-3 pl-4">
            {palettesInGroup.map(palette => (
              <PaletteCard key={palette.id} palette={palette} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Références avec leurs palettes */}
      {usedReferences.map(reference => {
        const palettesInGroup = groupedPalettes[reference] || []
        if (palettesInGroup.length === 0) return null
        return (
          <ReferenceSection key={reference} reference={reference} palettesInGroup={palettesInGroup} />
        )
      })}

      {/* Palettes sans référence */}
      {ungroupedPalettes.length > 0 && (
        <div>
          {usedReferences.length > 0 && (
            <h3 className="text-sm font-medium text-slate-400 mb-3">Sans référence</h3>
          )}
          <div className="space-y-3">
            {ungroupedPalettes.map(palette => (
              <PaletteCard key={palette.id} palette={palette} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
