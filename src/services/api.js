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

  if (response.status === 204) return null

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `API error: ${response.status}`)
  }

  return response.json()
}

export const fetchDashboardData = () => fetcher('/dashboard')

export const fetchUsers = () => fetcher('/users')

export const fetchOrders = () => fetcher('/orders')

export const fetchOrdersByFilters = (params = {}) => {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  return fetcher(`/orders/search${qs ? '?' + qs : ''}`)
}

export const fetchLowStockProducts = () => fetcher('/products/low-stock')

export const fetchProducts = (page = 0, size = 10, sort = 'name,asc') =>
  fetcher(`/products?page=${page}&size=${size}&sort=${sort}`)

export const fetchActiveProducts = (page = 0, size = 10) =>
  fetcher(`/products/active?page=${page}&size=${size}`)

export const fetchProductsByCategory = (categoryId, page = 0, size = 10) =>
  fetcher(`/products/by-category/${categoryId}?page=${page}&size=${size}`)

export const fetchProductBySku = (sku) =>
  fetcher(`/products/search/by-sku?sku=${encodeURIComponent(sku)}`)

export const createProduct = (data) =>
  fetcher('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const deleteProduct = (id) =>
  fetcher(`/products/${id}`, { method: 'DELETE' })

export const fetchCategories = () => fetcher('/categories')

export const fetchInventories = (page = 0, size = 50, sort = 'availableStock,asc') =>
  fetcher(`/inventories?page=${page}&size=${size}&sort=${sort}`)

export const fetchLowStockInventories = (page = 0, size = 50) =>
  fetcher(`/inventories/low-stock?page=${page}&size=${size}`)

export const adjustStock = (productId, delta) =>
  fetcher(`/inventories/by-product/${productId}/adjust?delta=${delta}`, { method: 'PATCH' })

const getDefaultDateRange = () => {
  const now = new Date()
  const from = new Date(now)
  from.setDate(from.getDate() - 30)
  return {
    from: from.toISOString(),
    to: now.toISOString(),
  }
}

export const fetchMonthlyIncome = () => fetcher('/reports/monthly-income')

export const fetchTopCustomers = () => fetcher('/reports/top-customers')

export const fetchTopCategoriesByVolume = () => fetcher('/reports/top-categories-by-volume')

export const fetchBestSellingProducts = (from, to) => {
  if (!from || !to) {
    const range = getDefaultDateRange()
    from = range.from
    to = range.to
  }
  return fetcher(`/reports/best-selling-products?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
}
