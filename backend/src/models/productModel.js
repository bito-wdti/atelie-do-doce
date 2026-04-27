import { supabase } from '../config/supabase.js'

export const ProductModel = {
  // Buscar todos os produtos (com filtros opcionais)
  async findAll({ category, search, status } = {}) {
    let query = supabase
      .from('products')
      .select('*')
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
    if (error) throw error
    return data
  },

  // Buscar produto por ID
  async findById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Criar produto
  async create({ name, detail, category, price, stock, img }) {
    const { data, error } = await supabase
      .from('products')
      .insert([{ name, detail, category, price, stock, img }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Atualizar produto
  async update(id, fields) {
    const { data, error } = await supabase
      .from('products')
      .update(fields)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Deletar produto
  async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // Buscar categorias únicas
  async getCategories() {
    const { data, error } = await supabase
      .from('products')
      .select('category')

    if (error) throw error
    const unique = [...new Set(data.map(p => p.category).filter(Boolean))]
    return unique
  },

  // Atualizar ordem dos produtos (drag & drop)
  async updateOrder(orderedIds) {
    const updates = orderedIds.map((id, index) =>
      supabase.from('products').update({ order_index: index }).eq('id', id)
    )
    await Promise.all(updates)
    return true
  }
}
