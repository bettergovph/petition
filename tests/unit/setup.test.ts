import { describe, it, expect } from 'vitest'

describe('Vitest Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true)
  })

  it('should support basic assertions', () => {
    const sum = 1 + 1
    expect(sum).toBe(2)
  })
})
