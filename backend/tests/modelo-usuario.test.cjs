const criarConsulta = (result) => {
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
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

let modeloUsuario
beforeAll(async () => {
  ({ userModel: modeloUsuario } = await import('../src/models/userModel.js'))
})

describe('Modelo de Usuário', () => {
  beforeEach(() => {
    supabase.from.mockReset()
  })

  it('deve retornar usuário por email quando encontrado', async () => {
    const usuario = { id: 1, email: 'joao@example.com' }
    supabase.from.mockImplementation(() => criarConsulta({ data: usuario, error: null }))

    const resultado = await modeloUsuario.findByEmail('joao@example.com')

    expect(resultado).toEqual(usuario)
    expect(supabase.from).toHaveBeenCalledWith('users')
  })

  it('deve criar um novo usuário e retornar o registro criado', async () => {
    const usuarioCriado = { id: 2, email: 'maria@example.com' }
    supabase.from.mockImplementation(() => criarConsulta({ data: [usuarioCriado], error: null }))

    const resultado = await modeloUsuario.create({ name: 'Maria', email: 'maria@example.com', password: 'senha123', role: 'Cliente' })

    expect(resultado).toEqual(usuarioCriado)
    expect(supabase.from).toHaveBeenCalledWith('users')
  })
})
