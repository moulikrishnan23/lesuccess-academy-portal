import { createContext, useContext, useEffect, useState } from 'react'
import apiClient from '../services/apiClient.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'lesuccess_auth_token'
const USER_KEY = 'lesuccess_auth_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // Configure initial axios auth header if token exists
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete apiClient.defaults.headers.common['Authorization']
    }
    setLoading(false)
  }, [token])

  const login = async (usernameOrEmail, password) => {
    const { data } = await apiClient.post('/api/auth/login', {
      usernameOrEmail,
      password,
    })

    const result = data?.data
    if (!result || !result.token) {
      throw new Error('Invalid login response from server')
    }

    const authToken = result.token
    const authUser = result.user

    localStorage.setItem(TOKEN_KEY, authToken)
    localStorage.setItem(USER_KEY, JSON.stringify(authUser))

    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`

    setToken(authToken)
    setUser(authUser)

    return authUser
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    delete apiClient.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'ADMIN',
    isTrainer: user?.role === 'TRAINER',
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
