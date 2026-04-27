import { supabase } from '../config/supabase.js'

export const SettingsModel = {
  // Buscar configurações da loja (sempre retorna a 1ª linha)
  async get() {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return data
  },

  // Criar configurações iniciais
  async create(fields) {
    const { data, error } = await supabase
      .from('store_settings')
      .insert([fields])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Atualizar configurações
  async update(id, fields) {
    const { data, error } = await supabase
      .from('store_settings')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Buscar ou criar (upsert seguro)
  async upsert(fields) {
    const existing = await SettingsModel.get()
    if (existing) {
      return await SettingsModel.update(existing.id, fields)
    }
    return await SettingsModel.create(fields)
  }
}
