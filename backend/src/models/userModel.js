import { supabase } from '../config/supabase.js'

export const userModel = {

    // Busca todos os usuários com filtros opcionais
    async findAll({ role, startDate, endDate } = {}) {
        let query = supabase
            .from('users')
            .select('*')

        if (role) {
            query = query.eq('role', role)
        }

        if (startDate) {
            query = query.gte('created_at', startDate)
        }

        if (endDate) {
            query = query.lte('created_at', endDate)
        }

        const { data, error } = await query

        if (error) {
            throw new Error(error.message)
        }

        return data
    },

    // Criar novo usuário
    async create({ name, email, password, cpf, telefone, role = 'Cliente', avatar_url = null }) {
        const { data, error } = await supabase
            .from('users')
            .insert([{ name, email, password, cpf, telefone, role, avatar_url }])
            .select()

        if (error) {
            throw new Error(error.message)
        }

        return data[0]
    },

    // Buscar usuário por email
    async findByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single()

        if (error && error.code !== 'PGRST116') {
            throw new Error(error.message)
        }

        return data || null
    },

    // Buscar usuário por ID
    async findById(id) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single()

        if (error && error.code !== 'PGRST116') {
            throw new Error(error.message)
        }

        return data || null
    },

    // Atualizar campos permitidos do usuário
    async updateById(id, fields) {
        const { data, error } = await supabase
            .from('users')
            .update(fields)
            .eq('id', id)
            .select()

        if (error) {
            throw new Error(error.message)
        }

        return data[0]
    }

}