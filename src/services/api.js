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

// ─── Dashboard ─────────────
export const fetchDashboardData = () => fetcher('/dashboard')
export const fetchUsers = () => fetcher('/users')

// ─── Products ─────────────
export const fetchProducts = (page = 0, size = 10, sort = 'name,asc') =>
  fetcher(`/products?page=${page}&size=${size}&sort=${sort}`)

export const fetchActiveProducts = (page = 0, size = 10) =>
  fetcher(`/products/active?page=${page}&size=${size}`)

export const fetchProductsByCategory = (categoryId, page = 0, size = 10) =>
  fetcher(`/products/by-category/${categoryId}?page=${page}&size=${size}`)

export const fetchProductBySku = (sku) =>
  fetcher(`/products/search/by-sku?sku=${encodeURIComponent(sku)}`)

export const fetchLowStockProducts = () => fetcher('/products/low-stock')

export const getProduct = (id) => fetcher(`/products/${id}`)

export const createProduct = (data) =>
  fetcher('/products', { method: 'POST', body: JSON.stringify(data) })

export const updateProduct = (id, data) =>
  fetcher(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const setProductActive = (id, active) =>
  fetcher(`/products/${id}/active?active=${active}`, { method: 'PATCH' })

export const deleteProduct = (id) =>
  fetcher(`/products/${id}`, { method: 'DELETE' })

// ─── Categories ─────────────
export const fetchCategories = () => fetcher('/categories')

export const getCategory = (id) => fetcher(`/categories/${id}`)

export const createCategory = (data) =>
  fetcher('/categories', { method: 'POST', body: JSON.stringify(data) })

export const updateCategory = (id, data) =>
  fetcher(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const searchCategoryByName = (name) =>
  fetcher(`/categories/search/by-name?name=${encodeURIComponent(name)}`)

export const deleteCategory = (id) =>
  fetcher(`/categories/${id}`, { method: 'DELETE' })

// ─── Customers ─────────────
export const getCustomers = () => fetcher('/customers')

export const getCustomer = (id) => fetcher(`/customers/${id}`)

export const createCustomer = (data) =>
  fetcher('/customers', { method: 'POST', body: JSON.stringify(data) })

export const updateCustomer = (id, data) =>
  fetcher(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const searchCustomersByEmail = (email) =>
  fetcher(`/customers/search/by-email?email=${encodeURIComponent(email)}`)

export const searchCustomersByStatus = (status) =>
  fetcher(`/customers/search/by-status?status=${encodeURIComponent(status)}`)

export const getCustomerMe = () => fetcher('/customers/me')

export const updateCustomerMe = (data) =>
  fetcher('/customers/me', { method: 'PUT', body: JSON.stringify(data) })

export const setCustomerStatus = (id, status) =>
  fetcher(`/customers/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PATCH' })

export const deleteCustomer = (id) =>
  fetcher(`/customers/${id}`, { method: 'DELETE' })

// ─── Addresses ─────────────
export const createAddress = (customerId, data) =>
  fetcher(`/addresses/${customerId}`, { method: 'POST', body: JSON.stringify(data) })

export const updateAddress = (customerId, addressId, data) =>
  fetcher(`/addresses/${customerId}/${addressId}`, { method: 'PUT', body: JSON.stringify(data) })

export const getAddress = (id) => fetcher(`/addresses/${id}`)

export const getCustomerAddresses = (customerId) =>
  fetcher(`/addresses/customer/${customerId}`)

export const deleteAddress = (customerId, addressId) =>
  fetcher(`/addresses/${customerId}/${addressId}`, { method: 'DELETE' })

// ─── Inventory ─────────────
export const fetchInventories = (page = 0, size = 50, sort = 'availableStock,asc') =>
  fetcher(`/inventories?page=${page}&size=${size}&sort=${sort}`)

export const fetchLowStockInventories = (page = 0, size = 50) =>
  fetcher(`/inventories/low-stock?page=${page}&size=${size}`)

export const getInventory = (inventoryId) => fetcher(`/inventories/${inventoryId}`)

export const getProductInventory = (productId) =>
  fetcher(`/inventories/by-product/${productId}`)

export const createInventory = (productId, data) =>
  fetcher(`/inventories/by-product/${productId}`, { method: 'POST', body: JSON.stringify(data) })

export const updateInventory = (productId, data) =>
  fetcher(`/inventories/by-product/${productId}`, { method: 'PUT', body: JSON.stringify(data) })

export const adjustStock = (productId, delta) =>
  fetcher(`/inventories/by-product/${productId}/adjust?delta=${delta}`, { method: 'PATCH' })

export const deleteInventory = (inventoryId) =>
  fetcher(`/inventories/${inventoryId}`, { method: 'DELETE' })

// ─── Orders ─────────────
export const fetchOrders = () => fetcher('/orders')

export const getOrder = (id) => fetcher(`/orders/${id}`)

export const createOrder = (data) =>
  fetcher('/orders', { method: 'POST', body: JSON.stringify(data) })

export const getOrdersByCustomer = (customerId) =>
  fetcher(`/orders/by-customer/${customerId}`)

export const fetchOrdersByFilters = (params = {}) => {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  return fetcher(`/orders/search${qs ? '?' + qs : ''}`)
}

export const updateOrderStatus = (orderId, status, notes) => {
  let path = `/orders/${orderId}/status?status=${encodeURIComponent(status)}`
  if (notes) path += `&notes=${encodeURIComponent(notes)}`
  return fetcher(path, { method: 'PATCH' })
}

// ─── Order Status History ─────────────
export const getOrderHistory = (orderId) =>
  fetcher(`/orders/${orderId}/history`)

// ─── Order Items ─────────────
export const getOrderItems = (orderId) =>
  fetcher(`/orders/${orderId}/items`)

export const addOrderItem = (orderId, data) =>
  fetcher(`/orders/${orderId}/items`, { method: 'POST', body: JSON.stringify(data) })

export const updateOrderItemQuantity = (orderId, orderItemId, quantity) =>
  fetcher(`/orders/${orderId}/items/${orderItemId}?quantity=${quantity}`, { method: 'PATCH' })

export const deleteOrderItem = (orderId, orderItemId) =>
  fetcher(`/orders/${orderId}/items/${orderItemId}`, { method: 'DELETE' })

// ─── Reports ─────────────
export const fetchMonthlyIncome = () => fetcher('/reports/monthly-income')

export const fetchTopCustomers = () => fetcher('/reports/top-customers')

export const fetchTopCategoriesByVolume = () => fetcher('/reports/top-categories-by-volume')

const getDefaultDateRange = () => {
  const now = new Date()
  const from = new Date(now)
  from.setDate(from.getDate() - 30)
  return { from: from.toISOString(), to: now.toISOString() }
}

export const fetchBestSellingProducts = (from, to) => {
  if (!from || !to) {
    const range = getDefaultDateRange()
    from = range.from
    to = range.to
  }
  return fetcher(`/reports/best-selling-products?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
}
