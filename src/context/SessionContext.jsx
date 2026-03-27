import { createContext, useContext, useState, useEffect } from 'react'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('inv_sessionId') || null)
  const [sessionName, setSessionName] = useState(() => localStorage.getItem('inv_sessionName') || null)
  const [userName, setUserName] = useState(() => localStorage.getItem('inv_userName') || null)

  useEffect(() => {
    if (sessionId) localStorage.setItem('inv_sessionId', sessionId)
    else localStorage.removeItem('inv_sessionId')
  }, [sessionId])

  useEffect(() => {
    if (sessionName) localStorage.setItem('inv_sessionName', sessionName)
    else localStorage.removeItem('inv_sessionName')
  }, [sessionName])

  useEffect(() => {
    if (userName) localStorage.setItem('inv_userName', userName)
    else localStorage.removeItem('inv_userName')
  }, [userName])

  function selectSession(id, name) {
    setSessionId(id)
    setSessionName(name)
  }

  function clearSession() {
    setSessionId(null)
    setSessionName(null)
  }

  return (
    <SessionContext.Provider value={{
      sessionId, sessionName, userName,
      setUserName, selectSession, clearSession
    }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
