import test from 'node:test'
import assert from 'node:assert/strict'
import { cleanString, clampLimit, positiveInteger, positiveNumber } from '../src/utils/validation.js'

test('positiveNumber rejects invalid prices', () => {
  assert.throws(() => positiveNumber(-1))
  assert.throws(() => positiveNumber('abc'))
  assert.equal(positiveNumber('12.345'), 12.35)
})

test('positiveInteger rejects invalid quantities', () => {
  assert.throws(() => positiveInteger(0))
  assert.throws(() => positiveInteger(1.5))
  assert.equal(positiveInteger('3'), 3)
})

test('cleanString trims and caps external text', () => {
  assert.equal(cleanString('  bolo   de pote  '), 'bolo de pote')
  assert.equal(cleanString('abcdef', { max: 3 }), 'abc')
})

test('clampLimit applies a production cap', () => {
  assert.equal(clampLimit(9999, { max: 200 }), 200)
  assert.equal(clampLimit('x', { fallback: 50 }), 50)
})
