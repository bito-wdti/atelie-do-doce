import { supabase } from '../config/supabase.js'

export const OrderModel = {
  async findAll({ status, search, startDate, endDate, limit = 100 } = {}) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          observation,
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
      const term = String(search).trim()
      if (/^\d+$/.test(term)) {
        query = query.or(`id.eq.${term},customer_name.ilike.%${term}%`)
      } else {
        query = query.ilike('customer_name', `%${term}%`)
      }
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

  async findById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          observation,
          product_name,
          product:products (id, name, img)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create({ customer_name, customer_phone, total_amount, status, payment_method, delivery_address, notes, items }) {
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

    try {
      if (items && items.length > 0) {
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          product_name: item.product_name,
          observation: item.observation || null
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) throw itemsError
      }
    } catch (err) {
      await supabase.from('orders').delete().eq('id', order.id)
      throw err
    }

    return await OrderModel.findById(order.id)
  },

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

  async delete(id) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  async getMetrics({ startDate, endDate } = {}) {
    let query = supabase
      .from('orders')
      .select('id, total_amount, status, created_at')

    if (startDate) query = query.gte('created_at', new Date(startDate).toISOString())
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
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
