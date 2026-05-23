import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context'
import { setOnUnauthorized } from '../services/api'
import { fetchCurrentUser, logout as logoutApi } from '../auth/authApi'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(async () => {
    try { await logoutApi() } catch { /* cookie already invalid */ }
    setUser(null)
  }, [])

  useEffect(() => {
    setOnUnauthorized(() => setUser(null))

    fetchCurrentUser()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      loginSuccess: () => fetchCurrentUser().then(setUser),
      logout,
    }),
    [user, loading, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
