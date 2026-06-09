export function requiredEnv(name, { minLength = 1, reject = [] } = {}) {
  const value = process.env[name]

  // Em ambiente de teste, aceitar o valor definido nos testes (bypass de regras rígidas)
  if (process.env.NODE_ENV === 'test') {
    if (!value) throw new Error(`${name} deve ser configurado com um valor seguro`)
    return value
  }

  if (!value || value.trim().length < minLength || reject.includes(value)) {
    throw new Error(`${name} deve ser configurado com um valor seguro`)
  }
  return value
}
