import { ProductModel } from '../models/productModel.js'
import { cleanString, positiveNumber } from '../utils/validation.js'

const STOCK_STATUSES = ['Em estoque', 'Disponivel', 'Disponível', 'Indisponivel', 'Indisponível', 'Esgotado']

function validateProductPayload(body, { partial = false } = {}) {
  const payload = {}

  if (!partial || body.name !== undefined) {
    payload.name = cleanString(body.name, { max: 120, required: !partial })
  }

  if (body.detail !== undefined) payload.detail = cleanString(body.detail, { max: 800 })
  if (body.category !== undefined) payload.category = cleanString(body.category, { max: 80 })

  if (!partial || body.price !== undefined) {
    payload.price = positiveNumber(body.price, { min: 0.01, max: 99999 })
  }

  if (body.stock !== undefined) {
    payload.stock = cleanString(body.stock, { max: 40 })
    if (payload.stock && !STOCK_STATUSES.includes(payload.stock)) {
      throw new Error('Status de estoque invalido')
    }
  }

  if (body.img !== undefined) {
    const img = cleanString(body.img, { max: 1500000 })
    if (img && !/^https?:\/\//.test(img) && !img.startsWith('data:image/')) {
      throw new Error('Imagem invalida')
    }
    payload.img = img
  }

  return payload
}

export const ProductController = {
  async index(req, res) {
    try {
      const { category, search, status } = req.query
      const products = await ProductModel.findAll({ category, search, status })
      return res.json(products)
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar produtos' })
    }
  },

  async categories(req, res) {
    try {
      const categories = await ProductModel.getCategories()
      return res.json(categories)
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar categorias' })
    }
  },

  async show(req, res) {
    try {
      const product = await ProductModel.findById(req.params.id)
      if (!product) return res.status(404).json({ error: 'Produto nao encontrado' })
      return res.json(product)
    } catch (err) {
      return res.status(404).json({ error: 'Produto nao encontrado' })
    }
  },

  async create(req, res) {
    try {
      const product = await ProductModel.create(validateProductPayload(req.body))
      return res.status(201).json(product)
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Produto invalido' })
    }
  },

  async update(req, res) {
    try {
      const product = await ProductModel.update(req.params.id, validateProductPayload(req.body, { partial: true }))
      return res.json(product)
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Produto invalido' })
    }
  },

  async destroy(req, res) {
    try {
      await ProductModel.delete(req.params.id)
      return res.json({ message: 'Produto removido com sucesso' })
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao remover produto' })
    }
  },

  async reorder(req, res) {
    try {
      const { orderedIds } = req.body
      if (!Array.isArray(orderedIds) || orderedIds.length > 500) {
        return res.status(400).json({ error: 'Lista de ordenacao invalida' })
      }
      await ProductModel.updateOrder(orderedIds)
      return res.json({ message: 'Ordem atualizada' })
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao salvar ordem dos produtos' })
    }
  }
}
