import { Router } from 'express'
import { ProductController } from '../controllers/productController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

const router = Router()

// ─── Rotas públicas (cliente pode acessar) ───────────────────────────────────
// GET /api/products             — lista produtos (aceita ?category= &search= &status=)
router.get('/', ProductController.index)

// GET /api/products/categories  — lista categorias disponíveis
router.get('/categories', ProductController.categories)

// GET /api/products/:id         — detalhe de um produto
router.get('/:id', ProductController.show)

// ─── Rotas protegidas (somente admin) ────────────────────────────────────────
// POST   /api/products          — criar produto
router.post('/', requireAdmin, ProductController.create)

// PATCH  /api/products/reorder  — reordenar produtos (drag & drop)
router.patch('/reorder', requireAdmin, ProductController.reorder)

// PUT    /api/products/:id      — atualizar produto
router.put('/:id', requireAdmin, ProductController.update)

// DELETE /api/products/:id      — remover produto
router.delete('/:id', requireAdmin, ProductController.destroy)

export default router
