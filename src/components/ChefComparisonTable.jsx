import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function ChefComparisonTable({ session }) {
  const { profile } = useAuth()
  const [theoreticalStock, setTheoreticalStock] = useState([])
  const [userCounts, setUserCounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [recountRequests, setRecountRequests] = useState([])
  const [requesting, setRequesting] = useState(null)

  useEffect(() => { loadData() }, [session.id])

  async function loadData() {
    setLoading(true)
    const [stockRes, countsRes, recountRes] = await Promise.all([
      supabase
        .from('theoretical_stock')
        .select('*')
        .eq('session_id', session.id),
      supabase
        .from('user_counts')
        .select('*')
        .eq('session_id', session.id),
      supabase
        .from('recount_requests')
        .select('*')
        .eq('session_id', session.id),
    ])

    setTheoreticalStock(stockRes.data || [])
    setUserCounts(countsRes.data || [])
    setRecountRequests(recountRes.data || [])
    setLoading(false)
  }

  async function handleRequestRecount(reference) {
    setRequesting(reference)
    await supabase.from('recount_requests').insert({
      session_id: session.id,
      reference,
      requested_by: profile.id,
    })
    await loadData()
    setRequesting(null)
  }

  async function handleFulfillRecount(requestId) {
    await supabase
      .from('recount_requests')
      .update({ status: 'fulfilled' })
      .eq('id', requestId)
    await loadData()
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Chargement...</div>
  }

  // Build comparison data
  const allRefs = new Set()
  const theoreticalRefs = new Set()
  theoreticalStock.forEach(s => { allRefs.add(s.reference); theoreticalRefs.add(s.reference) })
  userCounts.forEach(c => allRefs.add(c.reference))

  // Get unique user names
  const userNames = [...new Set(userCounts.map(c => c.user_name))].sort()

  // Build rows
  const rows = [...allRefs].sort().map(reference => {
    const theoretical = theoreticalStock.find(s => s.reference === reference)
    const expectedQty = theoretical?.expected_quantity ?? null

    // Per-user totals
    const perUser = {}
    for (const name of userNames) {
      const userPalettes = userCounts.filter(c =>
        c.reference === reference && c.user_name === name && !c.is_recount
      )
      perUser[name] = userPalettes.reduce((sum, c) => sum + c.total_count, 0)
    }

    // Recount data
    const recountReq = recountRequests.find(r =>
      r.reference === reference && r.status === 'pending'
    )
    const recountCounts = userCounts.filter(c =>
      c.reference === reference && c.is_recount
    )
    const recountPerUser = {}
    for (const name of userNames) {
      const userRecounts = recountCounts.filter(c => c.user_name === name)
      if (userRecounts.length > 0) {
        recountPerUser[name] = userRecounts.reduce((sum, c) => sum + c.total_count, 0)
      }
    }

    // Total counted (original, not recount)
    const totalCounted = Object.values(perUser).reduce((a, b) => a + b, 0)

    // Check discrepancy between users
    const userValues = Object.values(perUser).filter(v => v > 0)
    const usersDisagree = userValues.length > 1 && new Set(userValues).size > 1

    // Ecart with theoretical
    const ecart = expectedQty !== null ? totalCounted - expectedQty : null

    const isManual = !theoreticalRefs.has(reference)

    return {
      reference,
      expectedQty,
      perUser,
      recountPerUser,
      totalCounted,
      ecart,
      usersDisagree,
      recountReq,
      hasRecount: Object.keys(recountPerUser).length > 0,
      isManual,
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">
          Comparaison — {rows.length} reference(s)
        </h2>
        <button
          onClick={loadData}
          className="text-sm text-blue-500 hover:text-blue-700"
        >
          Actualiser
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">
          Aucune donnee. Importez le stock theorique et attendez les comptages.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left px-3 py-2 text-slate-600 font-medium">Reference</th>
                <th className="text-right px-3 py-2 text-slate-600 font-medium">Theorique</th>
                {userNames.map(name => (
                  <th key={name} className="text-right px-3 py-2 text-slate-600 font-medium">
                    {name}
                  </th>
                ))}
                <th className="text-right px-3 py-2 text-slate-600 font-medium">Total</th>
                <th className="text-right px-3 py-2 text-slate-600 font-medium">Ecart</th>
                <th className="text-center px-3 py-2 text-slate-600 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr
                  key={row.reference}
                  className={`border-b border-slate-100 ${
                    row.usersDisagree || (row.ecart !== null && row.ecart !== 0)
                      ? 'bg-red-50'
                      : ''
                  }`}
                >
                  <td className="px-3 py-2 font-medium text-slate-800">
                    {row.reference}
                    {row.isManual && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                        hors liste
                      </span>
                    )}
                    {row.recountReq && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded text-xs">
                        recomptage
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-600">
                    {row.expectedQty ?? '—'}
                  </td>
                  {userNames.map(name => (
                    <td key={name} className="px-3 py-2 text-right text-slate-800">
                      {row.perUser[name] || 0}
                      {row.recountPerUser[name] !== undefined && (
                        <span className="block text-xs text-amber-600">
                          Recomptage: {row.recountPerUser[name]}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right font-semibold text-slate-800">
                    {row.totalCounted}
                  </td>
                  <td className={`px-3 py-2 text-right font-semibold ${
                    row.ecart === null ? 'text-slate-400'
                      : row.ecart === 0 ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {row.ecart === null ? '—' : (row.ecart > 0 ? '+' : '') + row.ecart}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {row.recountReq ? (
                      <button
                        onClick={() => handleFulfillRecount(row.recountReq.id)}
                        className="text-xs text-green-600 hover:text-green-800"
                      >
                        Valider
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRequestRecount(row.reference)}
                        disabled={requesting === row.reference}
                        className="text-xs text-amber-600 hover:text-amber-800 disabled:opacity-50"
                      >
                        Recompter
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
