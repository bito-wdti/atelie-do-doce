export function requiredEnv(name, { minLength = 1, reject = [] } = {}) {
  const value = process.env[name]
  if (!value || value.trim().length < minLength || reject.includes(value)) {
    throw new Error(`${name} deve ser configurado com um valor seguro`)
  }
  return value
}
