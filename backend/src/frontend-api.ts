// ============================================================
//  src/api.ts  —  Pedilivery Frontend API Service
//  Todas as chamadas ao backend passam por aqui.
//  Substitui as chamadas diretas ao supabase nos componentes.
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// ─── Helper: request com token automático ───────────────────
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('adminToken')

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Erro ${res.status}`)
  }

  return res.json()
}

// ════════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════════
export const authApi = {
  /**
   * POST /auth/login
   * Faz login do admin e salva o JWT no localStorage.
   *
   * Onde usar: pages/AdminLogin.tsx
   *
   * Antes (supabase direto):
   *   localStorage.setItem('isAdminAuthenticated', 'true')
   *
   * Depois:
   *   const { token } = await authApi.login(password)
   *   localStorage.setItem('adminToken', token)
   */
  async login(password: string) {
    const data = await request<{ token: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password })
    })
    localStorage.setItem('adminToken', data.token)
    return data
  },

  /**
   * POST /auth/verify
   * Verifica se o token guardado ainda é válido.
   *
   * Onde usar: App.tsx — AdminProtectedRoute
   */
  async verify() {
    return request<{ valid: boolean; role: string }>('/auth/verify', {
      method: 'POST'
    })
  },

  logout() {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('isAdminAuthenticated')
  },

  isAuthenticated() {
    return !!localStorage.getItem('adminToken')
  }
}

// ════════════════════════════════════════════════════════════
//  PRODUTOS
// ════════════════════════════════════════════════════════════
export interface Product {
  id: number
  name: string
  detail?: string
  category?: string
  price: number
  stock: string
  img?: string
}

export const productsApi = {
  /**
   * GET /products?category=&search=&status=
   * Lista produtos com filtros opcionais.
   *
   * Onde usar: pages/ClientHome.tsx, pages/AdminCatalog.tsx
   *
   * Antes:
   *   const { data } = await supabase.from('products').select('*')
   *
   * Depois:
   *   const data = await productsApi.list()
   *   const data = await productsApi.list({ category: 'Bolos', search: 'vulcão' })
   */
  async list(params: { category?: string; search?: string; status?: string } = {}) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][]
    ).toString()
    return request<Product[]>(`/products${qs ? `?${qs}` : ''}`)
  },

  /**
   * GET /products/categories
   * Lista as categorias existentes.
   *
   * Onde usar: pages/AdminCatalog.tsx, pages/ClientHome.tsx (filtros)
   */
  async categories() {
    return request<string[]>('/products/categories')
  },

  /**
   * GET /products/:id
   * Detalhe de um produto.
   */
  async get(id: number | string) {
    return request<Product>(`/products/${id}`)
  },

  /**
   * POST /products  [Admin]
   * Cria um produto novo.
   *
   * Onde usar: pages/AdminCatalog.tsx — handleSaveProduct
   *
   * Antes:
   *   await supabase.from('products').insert([formData])
   *
   * Depois:
   *   await productsApi.create(formData)
   */
  async create(data: Omit<Product, 'id'>) {
    return request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  /**
   * PUT /products/:id  [Admin]
   * Atualiza um produto.
   *
   * Onde usar: pages/AdminCatalog.tsx — handleSaveProduct (modo edit)
   *
   * Antes:
   *   await supabase.from('products').update(formData).eq('id', id)
   *
   * Depois:
   *   await productsApi.update(id, formData)
   */
  async update(id: number | string, data: Partial<Product>) {
    return request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  /**
   * DELETE /products/:id  [Admin]
   * Remove um produto.
   *
   * Onde usar: pages/AdminCatalog.tsx — handleDeleteProduct
   *
   * Antes:
   *   await supabase.from('products').delete().eq('id', id)
   *
   * Depois:
   *   await productsApi.delete(id)
   */
  async delete(id: number | string) {
    return request<{ message: string }>(`/products/${id}`, { method: 'DELETE' })
  },

  /**
   * PATCH /products/reorder  [Admin]
   * Salva nova ordem após drag & drop.
   *
   * Onde usar: pages/AdminCatalog.tsx — handleDragEnd
   *
   * Antes:
   *   (não tinha — era só estado local)
   *
   * Depois:
   *   await productsApi.reorder(products.map(p => p.id))
   */
  async reorder(orderedIds: number[]) {
    return request<{ message: string }>('/products/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds })
    })
  }
}

// ════════════════════════════════════════════════════════════
//  PEDIDOS
// ════════════════════════════════════════════════════════════
export interface OrderItem {
  product_id?: number
  product_name: string
  quantity: number
  unit_price: number
}

export interface CreateOrderPayload {
  customer_name: string
  customer_phone?: string
  total_amount: number
  payment_method?: string
  delivery_address?: string
  notes?: string
  items: OrderItem[]
}

export const ordersApi = {
  /**
   * POST /orders
   * Cliente finaliza a compra.
   *
   * Onde usar: pages/ClientCheckout.tsx — handlePlaceOrder
   *
   * Antes:
   *   const { data } = await supabase.from('orders').insert([...])
   *   await supabase.from('order_items').insert([...])
   *
   * Depois (UMA única chamada):
   *   const order = await ordersApi.create({ ...formData, items: cartItems })
   *   navigate(`/tracking/${order.id}`)
   */
  async create(payload: CreateOrderPayload) {
    return request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  /**
   * GET /orders/:id
   * Cliente rastreia o próprio pedido pelo ID.
   *
   * Onde usar: pages/ClientTracking.tsx
   *
   * Antes:
   *   const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', id)
   *
   * Depois:
   *   const order = await ordersApi.get(orderId)
   */
  async get(id: number | string) {
    return request<any>(`/orders/${id}`)
  },

  /**
   * GET /orders?status=&search=&startDate=&endDate=  [Admin]
   * Lista todos os pedidos com filtros.
   *
   * Onde usar: pages/AdminOrders.tsx — fetchOrders
   *
   * Antes:
   *   const { data } = await supabase.from('orders').select('*, order_items(*)')
   *
   * Depois:
   *   const orders = await ordersApi.list({ status: 'Pendente' })
   */
  async list(params: { status?: string; search?: string; startDate?: string; endDate?: string } = {}) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][]
    ).toString()
    return request<any[]>(`/orders${qs ? `?${qs}` : ''}`)
  },

  /**
   * GET /orders/metrics/summary  [Admin]
   * Resumo de métricas para o dashboard.
   *
   * Onde usar: pages/AdminDashboard.tsx
   *
   * Antes:
   *   múltiplas queries supabase para contar pedidos, somar receita, etc.
   *
   * Depois:
   *   const { total, revenue, pending, delivered } = await ordersApi.metrics()
   */
  async metrics(params: { startDate?: string; endDate?: string } = {}) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][]
    ).toString()
    return request<{
      total: number
      revenue: number
      pending: number
      delivered: number
      canceled: number
    }>(`/orders/metrics/summary${qs ? `?${qs}` : ''}`)
  },

  /**
   * PATCH /orders/:id/status  [Admin]
   * Atualiza o status de um pedido.
   *
   * Onde usar: pages/AdminOrders.tsx — handleStatusChange
   *
   * Antes:
   *   await supabase.from('orders').update({ status }).eq('id', id)
   *
   * Depois:
   *   await ordersApi.updateStatus(id, 'Em Preparo')
   */
  async updateStatus(id: number | string, status: string) {
    return request<any>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  },

  /**
   * DELETE /orders/:id  [Admin]
   * Remove um pedido.
   *
   * Onde usar: pages/AdminOrders.tsx
   */
  async delete(id: number | string) {
    return request<{ message: string }>(`/orders/${id}`, { method: 'DELETE' })
  }
}

// ════════════════════════════════════════════════════════════
//  CONFIGURAÇÕES DA LOJA
// ════════════════════════════════════════════════════════════
export interface StoreSettings {
  id: number
  store_name: string
  phone?: string
  address?: string
  logo_url?: string
  opening_hours?: Record<string, any>
}

export const settingsApi = {
  /**
   * GET /settings
   * Carrega dados da loja (nome, telefone, endereço).
   *
   * Onde usar: pages/ClientCheckout.tsx, pages/AdminSettings.tsx
   *
   * Antes:
   *   const { data } = await supabase.from('store_settings').select('*').single()
   *
   * Depois:
   *   const settings = await settingsApi.get()
   */
  async get() {
    return request<StoreSettings>('/settings')
  },

  /**
   * PUT /settings  [Admin]
   * Salva configurações da loja.
   *
   * Onde usar: pages/AdminSettings.tsx — handleSave
   *
   * Antes:
   *   await supabase.from('store_settings').update(data).eq('id', id)
   *
   * Depois:
   *   await settingsApi.update({ store_name, phone, address, logo_url })
   */
  async update(data: Partial<StoreSettings>) {
    return request<StoreSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
}
