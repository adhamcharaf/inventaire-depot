export function exportReferencesCSV(palettes) {
  // Grouper par référence et calculer totaux
  const totals = {}
  palettes.forEach(p => {
    if (p.reference) {
      const qty = p.stats.present + (p.extraCartons || 0)
      totals[p.reference] = (totals[p.reference] || 0) + qty
    }
  })

  // Générer CSV
  const lines = ['reference;quantite']
  Object.entries(totals)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([ref, qty]) => lines.push(`${ref};${qty}`))

  // Télécharger
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `inventaire-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
