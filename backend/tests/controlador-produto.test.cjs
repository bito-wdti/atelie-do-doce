const ModeloProduto = {
  findAll: jest.fn(),
  getCategories: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  updateOrder: jest.fn()
}

jest.unstable_mockModule('../src/models/productModel.js', () => ({ ProductModel: ModeloProduto }))

let ControladorProduto
beforeAll(async () => {
  ({ ProductController: ControladorProduto } = await import('../src/controllers/productController.js'))
})

const criarResposta = () => {
  const resposta = {}
  resposta.statusCode = 200
  resposta.body = null
  resposta.status = (code) => { resposta.statusCode = code; return resposta }
  resposta.json = (payload) => { resposta.body = payload; return resposta }
  return resposta
}

describe('Controlador de Produtos', () => {
  beforeEach(() => {
    Object.values(ModeloProduto).forEach((mockFn) => mockFn.mockReset())
  })

  it('deve retornar a lista de produtos usando findAll', async () => {
    ModeloProduto.findAll.mockResolvedValue([{ id: 1, name: 'Sabonete' }])
    const requisicao = { query: {} }
    const resposta = criarResposta()

    await ControladorProduto.index(requisicao, resposta)

    expect(ModeloProduto.findAll).toHaveBeenCalledWith({ category: undefined, search: undefined, status: undefined })
    expect(resposta.body).toEqual([{ id: 1, name: 'Sabonete' }])
  })

  it('deve retornar 404 quando o produto não for encontrado', async () => {
    ModeloProduto.findById.mockResolvedValue(null)
    const requisicao = { params: { id: '123' } }
    const resposta = criarResposta()

    await ControladorProduto.show(requisicao, resposta)

    expect(resposta.statusCode).toBe(404)
    expect(resposta.body).toEqual({ error: 'Produto não encontrado' })
  })

  it('deve criar um produto e retornar 201', async () => {
    const produto = { id: 2, name: 'Creme', price: 12.0 }
    ModeloProduto.create.mockResolvedValue(produto)
    const requisicao = { body: { name: 'Creme', detail: 'Hidratante', category: 'Beleza', price: 12.0, stock: 10, img: null } }
    const resposta = criarResposta()

    await ControladorProduto.create(requisicao, resposta)

    expect(resposta.statusCode).toBe(201)
    expect(resposta.body).toEqual(produto)
  })
})
