const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://example.com/api'

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Error: ${response.status}`)
  }

  return response.json().catch(() => null)
}

export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const register = (email, password) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const fetchCurrentUser = () => request('/auth/me')

export const logout = () =>
  request('/auth/logout', { method: 'POST' })
