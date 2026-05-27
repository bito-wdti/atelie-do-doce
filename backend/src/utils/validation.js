export function cleanString(value, { max = 255, required = false } = {}) {
  if (value === undefined || value === null) {
    if (required) throw new Error('Campo obrigatorio ausente')
    return undefined
  }

  const text = String(value).trim().replace(/\s+/g, ' ')
  if (required && !text) throw new Error('Campo obrigatorio ausente')
  return text.slice(0, max)
}

export function positiveNumber(value, { min = 0.01, max = 999999 } = {}) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error('Numero invalido')
  }
  return Number(number.toFixed(2))
}

export function positiveInteger(value, { min = 1, max = 999 } = {}) {
  const number = Number(value)
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error('Quantidade invalida')
  }
  return number
}

export function clampLimit(value, { fallback = 100, max = 200 } = {}) {
  const number = Number(value)
  if (!Number.isInteger(number) || number <= 0) return fallback
  return Math.min(number, max)
}
