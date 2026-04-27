import { ProductModel } from '../models/productModel.js'

export const ProductController = {
  // GET /api/products
  async index(req, res) {
    try {
      const { category, search, status } = req.query
      const products = await ProductModel.findAll({ category, search, status })
      return res.json(products)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  // GET /api/products/categories
  async categories(req, res) {
    try {
      const categories = await ProductModel.getCategories()
      return res.json(categories)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  // GET /api/products/:id
  async show(req, res) {
    try {
      const product = await ProductModel.findById(req.params.id)
      if (!product) return res.status(404).json({ error: 'Produto não encontrado' })
      return res.json(product)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  // POST /api/products  [Admin]
  async create(req, res) {
    try {
      const { name, detail, category, price, stock, img } = req.body

      if (!name || !price) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' })
      }

      const product = await ProductModel.create({ name, detail, category, price, stock, img })
      return res.status(201).json(product)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  // PUT /api/products/:id  [Admin]
  async update(req, res) {
    try {
      const { name, detail, category, price, stock, img } = req.body
      const product = await ProductModel.update(req.params.id, { name, detail, category, price, stock, img })
      return res.json(product)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  // DELETE /api/products/:id  [Admin]
  async destroy(req, res) {
    try {
      await ProductModel.delete(req.params.id)
      return res.json({ message: 'Produto removido com sucesso' })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  // PATCH /api/products/reorder  [Admin]
  async reorder(req, res) {
    try {
      const { orderedIds } = req.body
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ error: 'orderedIds deve ser um array' })
      }
      await ProductModel.updateOrder(orderedIds)
      return res.json({ message: 'Ordem atualizada' })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
}
