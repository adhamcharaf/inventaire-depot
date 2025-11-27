import { useEffect, useRef } from 'react'
import { AUTO_SAVE_INTERVAL } from '../lib/config'

export function useAutoSave(palette, onSave) {
  const lastSavedRef = useRef(null)

  useEffect(() => {
    if (!palette) return

    const interval = setInterval(() => {
      const current = JSON.stringify(palette.cubes)
      if (current !== lastSavedRef.current) {
        lastSavedRef.current = current
        onSave(palette)
      }
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [palette, onSave])
}
