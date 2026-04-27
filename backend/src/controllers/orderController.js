import { OrderModel } from '../models/orderModel.js'

export const OrderController = {
  // GET /api/orders  [Admin]
  async index(req, res) {
    try {
      const { status, search, startDate, endDate, limit } = req.query
      const orders = await OrderModel.findAll({ status, search, startDate, endDate, limit: Number(limit) || 100 })
      return res.json(orders)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  // GET /api/orders/metrics  [Admin]
  async metrics(req, res) {
    try {
      const { startDate, endDate } = req.query
      const data = await OrderModel.getMetrics({ startDate, endDate })
      return res.json(data)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  // GET /api/orders/:id  [Público - para rastreamento do cliente]
  async show(req, res) {
    try {
      const order = await OrderModel.findById(req.params.id)
      if (!order) return res.status(404).json({ error: 'Pedido não encontrado' })
      return res.json(order)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  // POST /api/orders  [Público - cliente finaliza compra]
  async create(req, res) {
    try {
      const {
        customer_name,
        customer_phone,
        total_amount,
        payment_method,
        delivery_address,
        notes,
        items
      } = req.body

      if (!customer_name || !total_amount || !items || items.length === 0) {
        return res.status(400).json({
          error: 'Nome do cliente, valor total e itens são obrigatórios'
        })
      }

      const order = await OrderModel.create({
        customer_name,
        customer_phone,
        total_amount,
        payment_method,
        delivery_address,
        notes,
        items
      })

      return res.status(201).json(order)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  // PATCH /api/orders/:id/status  [Admin]
  async updateStatus(req, res) {
    try {
      const { status } = req.body
      const validStatuses = ['Pendente', 'Em Preparo', 'Saiu para Entrega', 'Entregue', 'Cancelado']

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Status inválido. Use: ${validStatuses.join(', ')}`
        })
      }

      const order = await OrderModel.updateStatus(req.params.id, status)
      return res.json(order)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  // DELETE /api/orders/:id  [Admin]
  async destroy(req, res) {
    try {
      await OrderModel.delete(req.params.id)
      return res.json({ message: 'Pedido removido com sucesso' })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
}
