import { useState, useEffect } from 'react'
import { importReferences, getAllReferences, clearReferences } from '../db/indexeddb'

export default function ReferenceImport({ onClose }) {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCount()
  }, [])

  async function loadCount() {
    const refs = await getAllReferences()
    setCount(refs.length)
  }

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setMessage('')

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!Array.isArray(data)) {
        throw new Error('Le fichier doit contenir un tableau JSON')
      }

      const imported = await importReferences(data)
      setCount(imported)
      setMessage(`${imported} références importées`)
    } catch (err) {
      setMessage(`Erreur: ${err.message}`)
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  async function handleClear() {
    await clearReferences()
    setCount(0)
    setMessage('Références supprimées')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Gérer les références
        </h2>

        <div className="mb-6">
          <p className="text-slate-600 mb-2">
            Références actuelles: <span className="font-semibold text-slate-800">{count}</span>
          </p>
          {message && (
            <p className={`text-sm ${message.startsWith('Erreur') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="sr-only">Importer un fichier JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              disabled={loading}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50"
            />
          </label>

          {count > 0 && (
            <button
              onClick={handleClear}
              className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Supprimer toutes les références
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}
