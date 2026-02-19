import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const r = await api.user.me()
      setUser(r.response)
      return r.response
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(async (email, password) => {
    await api.auth.login({ email, password })
    return fetchUser()
  }, [fetchUser])

  const register = useCallback(async (username, email, password) => {
    await api.auth.register({ username, email, password })
    return fetchUser()
  }, [fetchUser])

  const logout = useCallback(async () => {
    try {
      await api.auth.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser: fetchUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
