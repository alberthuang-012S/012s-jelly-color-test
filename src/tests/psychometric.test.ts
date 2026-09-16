import { describe, expect, it } from 'vitest'
import { fitPsychometricCurve } from '../psychophysics/psychometric'

describe('psychometric fit', () => {
  it('recovers a threshold from a monotonic artificial data set', () => {
    const points = [
      ...Array.from({ length: 8 }, () => ({ distance: 0.008, correct: false })),
      ...Array.from({ length: 8 }, () => ({ distance: 0.012, correct: false })),
      ...Array.from({ length: 8 }, () => ({ distance: 0.018, correct: true })),
      ...Array.from({ length: 8 }, () => ({ distance: 0.026, correct: true })),
      ...Array.from({ length: 8 }, () => ({ distance: 0.04, correct: true })),
    ]
    const fit = fitPsychometricCurve(points)
    expect(fit).not.toBeNull()
    expect(fit?.threshold75).toBeGreaterThan(0.012)
    expect(fit?.threshold75).toBeLessThan(0.04)
  })

  it('rejects data with no outcome variation so callers can use fallback', () => {
    const fit = fitPsychometricCurve(Array.from({ length: 12 }, (_, index) => ({ distance: 0.01 + index * 0.001, correct: true })))
    expect(fit).toBeNull()
  })
})
