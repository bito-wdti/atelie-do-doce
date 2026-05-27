const criarConsulta = (result) => {
  const query = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    then(onFulfilled, onRejected) {
      return Promise.resolve(result).then(onFulfilled, onRejected)
    }
  }
  return query
}

const supabase = {
  from: jest.fn()
}

jest.unstable_mockModule('../src/config/supabase.js', () => ({ supabase }))

let ModeloProduto
beforeAll(async () => {
  ({ ProductModel: ModeloProduto } = await import('../src/models/productModel.js'))
})

describe('Modelo de Produto', () => {
  beforeEach(() => {
    supabase.from.mockReset()
  })

  it('deve retornar produtos quando findAll for chamado', async () => {
    const data = [{ id: 1, name: 'Sabonete' }]
    supabase.from.mockImplementation(() => criarConsulta({ data, error: null }))

    const resultado = await ModeloProduto.findAll({ category: 'Todos', search: 'sab', status: 'available' })

    expect(resultado).toEqual(data)
    expect(supabase.from).toHaveBeenCalledWith('products')
  })

  it('deve retornar produto por id usando findById', async () => {
    const data = { id: 11, name: 'Creme' }
    supabase.from.mockImplementation(() => criarConsulta({ data, error: null }))

    const resultado = await ModeloProduto.findById(11)

    expect(resultado).toEqual(data)
    expect(supabase.from).toHaveBeenCalledWith('products')
  })
})
