const jwt = require('jsonwebtoken')

process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret'

let ControladorAutenticacao
beforeAll(async () => {
  ({ AuthController: ControladorAutenticacao } = await import('../src/controllers/authController.js'))
})

const criarResposta = () => {
  const resposta = {}
  resposta.statusCode = 200
  resposta.body = null
  resposta.status = (code) => { resposta.statusCode = code; return resposta }
  resposta.json = (payload) => { resposta.body = payload; return resposta }
  return resposta
}

describe('Controlador de Autenticação', () => {
  it('deve retornar token e mensagem quando a senha estiver correta', async () => {
    const requisicao = { body: { password: 'admin123' } }
    const resposta = criarResposta()

    await ControladorAutenticacao.login(requisicao, resposta)

    expect(resposta.statusCode).toBe(200)
    expect(resposta.body).toHaveProperty('token')
    expect(resposta.body).toHaveProperty('message', 'Login realizado com sucesso')

    const payload = jwt.verify(resposta.body.token, process.env.JWT_SECRET)
    expect(payload.role).toBe('admin')
  })

  it('deve retornar 400 quando a senha estiver ausente', async () => {
    const requisicao = { body: {} }
    const resposta = criarResposta()

    await ControladorAutenticacao.login(requisicao, resposta)

    expect(resposta.statusCode).toBe(400)
    expect(resposta.body).toEqual({ error: 'Senha obrigatoria' })
  })

  it('deve retornar 401 quando a senha estiver incorreta', async () => {
    const requisicao = { body: { password: 'wrong' } }
    const resposta = criarResposta()

    await ControladorAutenticacao.login(requisicao, resposta)

    expect(resposta.statusCode).toBe(401)
    expect(resposta.body).toEqual({ error: 'Credenciais invalidas' })
  })
})
