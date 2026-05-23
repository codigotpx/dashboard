const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://example.com/api'

let onUnauthorized = () => {}

export const setOnUnauthorized = (fn) => {
  onUnauthorized = fn
}

const fetcher = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (response.status === 401) {
    onUnauthorized()
    throw new Error('Sesión expirada')
  }

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `API error: ${response.status}`)
  }

  return response.json()
}

export const fetchDashboardData = () => fetcher('/dashboard')

export const fetchUsers = () => fetcher('/users')

export const fetchOrders = () => fetcher('/orders')

export const fetchLowStockProducts = () => fetcher('/products/low-stock')

export const fetchBestSellingProducts = () => fetcher('/reports/best-selling-products')
