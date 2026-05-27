import { SettingsModel } from '../models/settingsModel.js'
import { supabase } from '../config/supabase.js'

async function uploadLogoToStorage(logoData) {
  if (!logoData || typeof logoData !== 'string' || !logoData.startsWith('data:image/')) {
    const error = new Error('Imagem invalida')
    error.status = 400
    throw error
  }

  const match = logoData.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/)
  if (!match) {
    const error = new Error('Formato de imagem nao suportado')
    error.status = 400
    throw error
  }

  const contentType = match[1] === 'image/jpg' ? 'image/jpeg' : match[1]
  const extension = contentType.split('/')[1].replace('jpeg', 'jpg')
  const buffer = Buffer.from(match[2], 'base64')

  if (buffer.length > 1.5 * 1024 * 1024) {
    const error = new Error('Imagem muito grande')
    error.status = 400
    throw error
  }

  const fileName = `logo-${Date.now()}.${extension}`
  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(fileName, buffer, { contentType, upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('logos')
    .getPublicUrl(fileName)

  return data.publicUrl
}

export const SettingsController = {
  async show(req, res) {
    try {
      const settings = await SettingsModel.get()
      if (!settings) return res.status(404).json({ error: 'Configuracoes nao encontradas' })
      return res.json(settings)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  async update(req, res) {
    try {
      const { store_name, phone, address, logo_url, opening_hours, payment_methods, notifications, delivery_fee, pix_key } = req.body
      const settings = await SettingsModel.upsert({
        store_name,
        phone,
        address,
        logo_url,
        opening_hours,
        payment_methods,
        notifications,
        delivery_fee,
        pix_key
      })
      return res.json(settings)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  async uploadLogo(req, res) {
    try {
      const logo_url = await uploadLogoToStorage(req.body.logo_data)
      const settings = await SettingsModel.upsert({ logo_url })
      return res.json({ logo_url: settings.logo_url || logo_url })
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message || 'Erro ao enviar logo' })
    }
  }
}
