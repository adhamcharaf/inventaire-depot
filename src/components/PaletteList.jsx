import { useState } from 'react'

export default function PaletteList({ palettes, groups, onResume, onDelete, onChangePaletteGroup }) {
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

  function toggleGroup(groupId) {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  function calculateGroupStats(groupPalettes) {
    const totalPresent = groupPalettes.reduce((sum, p) => sum + p.stats.present, 0)
    const totalCapacity = groupPalettes.reduce((sum, p) => sum + p.stats.capacity, 0)
    const fillRate = totalCapacity > 0 ? ((totalPresent / totalCapacity) * 100).toFixed(1) : 0
    return { totalPresent, totalCapacity, fillRate }
  }

  // Grouper les palettes par groupe
  const groupedPalettes = {}
  const ungroupedPalettes = []

  palettes.forEach(palette => {
    if (palette.groupId) {
      if (!groupedPalettes[palette.groupId]) {
        groupedPalettes[palette.groupId] = []
      }
      groupedPalettes[palette.groupId].push(palette)
    } else {
      ungroupedPalettes.push(palette)
    }
  })

  // Initialiser expandedGroups pour les nouveaux groupes
  groups.forEach(group => {
    if (expandedGroups[group.id] === undefined) {
      expandedGroups[group.id] = true
    }
  })

  const PaletteCard = ({ palette }) => (
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
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          {formatDate(palette.updatedAt)}
        </span>

        <div className="flex items-center gap-2">
          {/* Sélecteur de groupe */}
          {groups.length > 0 && (
            <select
              value={palette.groupId || ''}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation()
                onChangePaletteGroup(palette.id, e.target.value || null)
              }}
              className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600"
            >
              <option value="">Sans groupe</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
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

  const GroupSection = ({ group, palettesInGroup }) => {
    const stats = calculateGroupStats(palettesInGroup)
    const isExpanded = expandedGroups[group.id] !== false

    return (
      <div className="mb-4">
        {/* En-tête du groupe */}
        <button
          onClick={() => toggleGroup(group.id)}
          className="w-full flex items-center justify-between bg-blue-50 rounded-xl p-4 mb-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-900">{group.name}</h3>
              <p className="text-xs text-slate-500">{palettesInGroup.length} palette{palettesInGroup.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats du groupe */}
            <div className="text-right">
              <div className="text-lg font-bold text-blue-500">
                {stats.fillRate}%
              </div>
              <div className="text-xs text-slate-500">
                {stats.totalPresent}/{stats.totalCapacity} cartons
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

        {/* Palettes du groupe */}
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
      {/* Groupes avec leurs palettes */}
      {groups.map(group => {
        const palettesInGroup = groupedPalettes[group.id] || []
        if (palettesInGroup.length === 0) return null
        return (
          <GroupSection key={group.id} group={group} palettesInGroup={palettesInGroup} />
        )
      })}

      {/* Palettes sans groupe */}
      {ungroupedPalettes.length > 0 && (
        <div>
          {groups.length > 0 && Object.keys(groupedPalettes).some(id => groupedPalettes[id].length > 0) && (
            <h3 className="text-sm font-medium text-slate-400 mb-3">Sans groupe</h3>
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
