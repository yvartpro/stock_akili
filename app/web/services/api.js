const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('aps_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || data.message || `Erreur requête (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProductById: (id) => request(`/products/${id}`),
  createProduct: (productData) => request('/products', { method: 'POST', body: JSON.stringify(productData) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateProductStatus: (id, statusData) => request(`/products/${id}/status`, { method: 'PATCH', body: JSON.stringify(statusData) }),
  getAlerts: () => request('/products/alerts'),

  // Categories
  getBrands: () => request('/categories/brands'),
  createBrand: (data) => request('/categories/brands', { method: 'POST', body: JSON.stringify(data) }),
  createModel: (data) => request('/categories/models', { method: 'POST', body: JSON.stringify(data) }),
  getColors: () => request('/categories/colors'),
  createColor: (data) => request('/categories/colors', { method: 'POST', body: JSON.stringify(data) }),

  // Suppliers (Fournisseurs)
  getSuppliers: () => request('/suppliers'),
  getSupplierById: (id) => request(`/suppliers/${id}`),
  createSupplier: (data) => request('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id, data) => request(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Shops (Points de vente passifs)
  getShops: () => request('/shops'),
  getShopById: (id) => request(`/shops/${id}`),
  createShop: (data) => request('/shops', { method: 'POST', body: JSON.stringify(data) }),
  updateShop: (id, data) => request(`/shops/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Receptions (Entrées)
  getReceptions: () => request('/receptions'),
  getReceptionById: (id) => request(`/receptions/${id}`),
  createReception: (data) => request('/receptions', { method: 'POST', body: JSON.stringify(data) }),

  // Exit Vouchers (Bons de sortie)
  getExitVouchers: () => request('/exit-vouchers'),
  getExitVoucherById: (id) => request(`/exit-vouchers/${id}`),
  createExitVoucher: (data) => request('/exit-vouchers', { method: 'POST', body: JSON.stringify(data) }),

  // Inventories (Inventaires périodiques)
  getInventories: () => request('/inventories'),
  prepareInventory: () => request('/inventories/prepare'),
  getInventoryById: (id) => request(`/inventories/${id}`),
  createInventory: (data) => request('/inventories', { method: 'POST', body: JSON.stringify(data) }),
  adjustInventory: (id) => request(`/inventories/${id}/adjust`, { method: 'POST' }),

  // Damaged (Section 11)
  getDamagedProducts: () => request('/damaged'),
  declareDamaged: (data) => request('/damaged', { method: 'POST', body: JSON.stringify(data) }),

  // Reports
  getDashboardStats: () => request('/reports/dashboard'),
  getMovements: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reports/movements${query ? `?${query}` : ''}`);
  },

  // Audit (Admin)
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/audit${query ? `?${query}` : ''}`);
  },

  // Users (Admin)
  getUsers: () => request('/users'),
  createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};
