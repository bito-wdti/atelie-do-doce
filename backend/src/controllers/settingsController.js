import { SettingsModel } from '../models/settingsModel.js'

export const SettingsController = {
  // GET /api/settings  [Público - frontend precisa do nome da loja, telefone, etc.]
  async show(req, res) {
    try {
      const settings = await SettingsModel.get()
      if (!settings) return res.status(404).json({ error: 'Configurações não encontradas' })
      return res.json(settings)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  // PUT /api/settings  [Admin]
  async update(req, res) {
    try {
      const { store_name, phone, address, logo_url, opening_hours } = req.body
      const settings = await SettingsModel.upsert({
        store_name,
        phone,
        address,
        logo_url,
        opening_hours
      })
      return res.json(settings)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
}
