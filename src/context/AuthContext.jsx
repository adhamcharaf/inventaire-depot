import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const SESSION_TIMEOUT = 5000 // 5s max to wait for getSession

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const fetchingRef = useRef(false)

  useEffect(() => {
    let timeoutId = null
    let resolved = false

    // Safety timeout: if getSession hangs (offline PWA), stop loading
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true
        console.warn('Auth timeout: getSession took too long, continuing as anon')
        setLoading(false)
      }
    }, SESSION_TIMEOUT)

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (resolved) return // timeout already fired
        resolved = true
        clearTimeout(timeoutId)

        setSession(session)
        if (session) {
          await fetchProfile(session.user.id)
        } else {
          setLoading(false)
        }
      })
      .catch((err) => {
        if (resolved) return
        resolved = true
        clearTimeout(timeoutId)
        console.error('getSession error:', err)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  async function fetchProfile(userId) {
    if (fetchingRef.current) return
    fetchingRef.current = true

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Failed to fetch profile:', error.message)
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Profile fetch exception:', err)
      setProfile(null)
    } finally {
      fetchingRef.current = false
      setLoading(false)
    }
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
