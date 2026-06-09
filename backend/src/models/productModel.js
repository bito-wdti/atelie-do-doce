import { supabase } from '../config/supabase.js'

function stripUndefined(fields) {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined))
}

export const ProductModel = {
  async findAll({ category, search, status } = {}) {
    let query = supabase
      .from('products')
      .select('*')
      .order('order_index', { ascending: true, nullsFirst: false })
      .order('id', { ascending: true })

    if (category && category !== 'Todos') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (status) {
      query = query.eq('stock', status)
    }

    const { data, error } = await query
    if (!error) return data

    let fallbackQuery = supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true })

    if (category && category !== 'Todos') {
      fallbackQuery = fallbackQuery.eq('category', category)
    }

    if (search) {
      fallbackQuery = fallbackQuery.ilike('name', `%${search}%`)
    }

    if (status) {
      fallbackQuery = fallbackQuery.eq('stock', status)
    }

    const { data: fallbackData, error: fallbackError } = await fallbackQuery
    if (fallbackError) throw error
    return fallbackData
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async findByIds(ids) {
    const uniqueIds = [...new Set(ids.map(id => Number(id)).filter(Number.isInteger))]
    if (uniqueIds.length === 0) return []

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', uniqueIds)

    if (error) throw error
    return data
  },

  async create(fields) {
    const { data, error } = await supabase
      .from('products')
      .insert([stripUndefined(fields)])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id, fields) {
    const { data, error } = await supabase
      .from('products')
      .update(stripUndefined(fields))
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('products')
      .select('category')

    if (error) throw error
    return [...new Set(data.map(p => p.category).filter(Boolean))]
  },

  async updateOrder(orderedIds) {
    const updates = orderedIds.map((id, index) =>
      supabase.from('products').update({ order_index: index + 1 }).eq('id', id)
    )
    const results = await Promise.all(updates)
    const failed = results.find(result => result.error)
    if (failed) throw failed.error
    return true
  }
}
