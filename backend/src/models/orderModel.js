import { supabase } from '../config/supabase.js'

export const OrderModel = {
  // Buscar todos os pedidos com filtros
  async findAll({ status, search, startDate, endDate, limit = 100 } = {}) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          product_name,
          product:products (id, name, img)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status && status !== 'Todos') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.ilike('customer_name', `%${search}%`)
    }

    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString())
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query = query.lte('created_at', end.toISOString())
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Buscar pedido por ID
  async findById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          product_name,
          product:products (id, name, img)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Criar pedido com seus itens (transação)
  async create({ customer_name, customer_phone, total_amount, status, payment_method, delivery_address, notes, items }) {
    // 1. Criar o pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name,
        customer_phone,
        total_amount,
        status: status || 'Pendente',
        payment_method,
        delivery_address,
        notes
      }])
      .select()
      .single()

    if (orderError) throw orderError

    // 2. Criar os itens do pedido
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        product_name: item.product_name
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError
    }

    // 3. Retornar pedido completo
    return await OrderModel.findById(order.id)
  },

  // Atualizar status do pedido
  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Deletar pedido
  async delete(id) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // Métricas para o dashboard
  async getMetrics({ startDate, endDate } = {}) {
    let query = supabase
      .from('orders')
      .select('id, total_amount, status, created_at')

    if (startDate) query = query.gte('created_at', new Date(startDate).toISOString())
    if (endDate) {
      const end = new Date(endDate); end.setHours(23, 59, 59, 999)
      query = query.lte('created_at', end.toISOString())
    }

    const { data, error } = await query
    if (error) throw error

    const total = data.length
    const revenue = data
      .filter(o => o.status !== 'Cancelado')
      .reduce((acc, o) => acc + Number(o.total_amount), 0)
    const pending = data.filter(o => o.status === 'Pendente').length
    const delivered = data.filter(o => o.status === 'Entregue').length
    const canceled = data.filter(o => o.status === 'Cancelado').length

    return { total, revenue, pending, delivered, canceled }
  }
}
