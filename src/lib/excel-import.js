import * as XLSX from 'xlsx'

/**
 * Parse an Excel or CSV file into stock data
 * Expected format: two columns - reference and quantity
 * @param {File} file
 * @returns {Promise<Array<{reference: string, quantity: number}>>}
 */
export async function parseStockFile(file) {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  if (rows.length < 2) {
    throw new Error('Le fichier doit contenir au moins un en-tete et une ligne de donnees')
  }

  // Detect columns: look for reference/ref and quantite/quantity/qty headers
  const headers = rows[0].map(h => String(h).toLowerCase().trim())
  let refCol = headers.findIndex(h => h === 'reference' || h === 'ref' || h === 'référence')
  let qtyCol = headers.findIndex(h => h === 'quantite' || h === 'quantité' || h === 'quantity' || h === 'qty')

  // Fallback: first column = reference, second = quantity
  if (refCol === -1) refCol = 0
  if (qtyCol === -1) qtyCol = 1

  const results = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || !row[refCol]) continue

    const reference = String(row[refCol]).trim()
    const quantity = parseInt(row[qtyCol], 10)

    if (!reference || isNaN(quantity)) continue

    results.push({ reference, quantity })
  }

  if (results.length === 0) {
    throw new Error('Aucune donnee valide trouvee dans le fichier')
  }

  return results
}
