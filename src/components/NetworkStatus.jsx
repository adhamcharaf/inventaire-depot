import { useState, useEffect } from 'react'

export default function NetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (online) return null

  return (
    <div className="bg-amber-500 text-white text-center text-xs font-medium py-1.5 px-4">
      Hors ligne — les donnees seront synchronisees au retour du reseau
    </div>
  )
}
