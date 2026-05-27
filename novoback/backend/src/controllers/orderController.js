import { OrderModel } from '../models/orderModel.js'
import { ProductModel } from '../models/productModel.js'
import { decodeToken, signToken } from '../middlewares/authMiddleware.js'
import { clampLimit, cleanString, positiveInteger } from '../utils/validation.js'

const VALID_STATUSES = ['Pendente', 'Em Preparo', 'Saiu para Entrega', 'Entregue', 'Cancelado']
const PAYMENT_METHODS = ['PIX', 'Cartão', 'Cartao', 'Dinheiro']
const DELIVERY_FEE = 5

function createTrackingToken(orderId) {
  return signToken({ type: 'order_tracking', orderId: String(orderId) }, { expiresIn: '30d' })
}

function validateTrackingToken(token, orderId) {
  if (!token) return false
  try {
    const decoded = decodeToken(token)
    return decoded.type === 'order_tracking' && String(decoded.orderId) === String(orderId)
  } catch (err) {
    return false
  }
}

function normalizePaymentMethod(value) {
  const payment = cleanString(value, { max: 80, required: true })
  if (!PAYMENT_METHODS.some(method => payment.includes(method))) {
    throw new Error('Forma de pagamento invalida')
  }
  return payment
}

async function buildOrderItems(rawItems, deliveryAddress) {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 100) {
    throw new Error('Itens do pedido invalidos')
  }

  const productIds = rawItems.map(item => item.product_id || item.id)
  const products = await ProductModel.findByIds(productIds)
  const productById = new Map(products.map(product => [Number(product.id), product]))

  const items = rawItems.map(item => {
    const productId = Number(item.product_id || item.id)
    const product = productById.get(productId)
    if (!product) throw new Error('Produto indisponivel')

    const quantity = positiveInteger(item.quantity, { min: 1, max: 99 })
    const unitPrice = Number(product.price)
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) throw new Error('Produto com preco invalido')

    return {
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit_price: Number(unitPrice.toFixed(2)),
      observation: cleanString(item.observation, { max: 300 })
    }
  })

  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const deliveryFee = deliveryAddress === 'Retirada na Loja' ? 0 : DELIVERY_FEE

  return {
    items,
    total_amount: Number((subtotal + deliveryFee).toFixed(2))
  }
}

export const OrderController = {
  async index(req, res) {
    try {
      const { status, search, startDate, endDate, limit } = req.query
      const orders = await OrderModel.findAll({
        status,
        search,
        startDate,
        endDate,
        limit: clampLimit(Number(limit), { fallback: 100, max: 200 })
      })
      return res.json(orders)
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar pedidos' })
    }
  },

  async metrics(req, res) {
    try {
      const { startDate, endDate } = req.query
      const data = await OrderModel.getMetrics({ startDate, endDate })
      return res.json(data)
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao calcular metricas' })
    }
  },

  async show(req, res) {
    try {
      const trackingToken = req.get('X-Order-Token') || req.query.token
      if (!req.admin && !validateTrackingToken(trackingToken, req.params.id)) {
        return res.status(401).json({ error: 'Token de rastreio invalido ou ausente' })
      }

      const order = await OrderModel.findById(req.params.id)
      if (!order) return res.status(404).json({ error: 'Pedido nao encontrado' })
      return res.json(order)
    } catch (err) {
      return res.status(404).json({ error: 'Pedido nao encontrado' })
    }
  },

  async create(req, res) {
    try {
      const customer_name = cleanString(req.body.customer_name, { max: 120, required: true })
      const customer_phone = cleanString(req.body.customer_phone, { max: 30 })
      const delivery_address = cleanString(req.body.delivery_address, { max: 500, required: true })
      const payment_method = normalizePaymentMethod(req.body.payment_method)
      const notes = cleanString(req.body.notes, { max: 800 })
      const { items, total_amount } = await buildOrderItems(req.body.items, delivery_address)

      const order = await OrderModel.create({
        customer_name,
        customer_phone,
        total_amount,
        payment_method,
        delivery_address,
        notes,
        items
      })

      return res.status(201).json({
        ...order,
        tracking_token: createTrackingToken(order.id)
      })
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Pedido invalido' })
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body

      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: `Status invalido. Use: ${VALID_STATUSES.join(', ')}` })
      }

      const order = await OrderModel.updateStatus(req.params.id, status)
      return res.json(order)
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao atualizar status' })
    }
  },

  async destroy(req, res) {
    try {
      await OrderModel.delete(req.params.id)
      return res.json({ message: 'Pedido removido com sucesso' })
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao remover pedido' })
    }
  }
}
