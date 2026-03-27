import { supabase } from './supabase'
import { getPendingPalettes, markPaletteSynced } from '../db/indexeddb'

/**
 * Push all pending palettes from IndexedDB to Supabase user_counts.
 * Uses upsert with (session_id, local_id) for dedup.
 * @returns {{ synced: number, failed: number, errors: string[] }}
 */
export async function syncToSupabase() {
  const pending = await getPendingPalettes()

  if (pending.length === 0) {
    return { synced: 0, failed: 0, errors: [] }
  }

  let synced = 0
  let failed = 0
  const errors = []

  for (const palette of pending) {
    const row = {
      session_id: palette.sessionId,
      user_name: palette.userName,
      reference: palette.reference,
      palette_name: palette.name,
      dimensions: palette.dimensions,
      cubes: palette.cubes,
      extra_cartons: palette.extraCartons || 0,
      total_count: (palette.stats?.present || palette.cubes.length) + (palette.extraCartons || 0),
      local_id: palette.id,
      is_recount: palette.isRecount || false,
      submitted_at: palette.submittedAt ? new Date(palette.submittedAt).toISOString() : new Date().toISOString(),
    }

    const { error } = await supabase
      .from('user_counts')
      .upsert(row, { onConflict: 'session_id,local_id' })

    if (error) {
      failed++
      errors.push(`${palette.name}: ${error.message}`)
    } else {
      await markPaletteSynced(palette.id)
      synced++
    }
  }

  return { synced, failed, errors }
}
