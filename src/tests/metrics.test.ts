import { describe, expect, it } from 'vitest'
import { calculateConsistencyIndex } from '../psychophysics/consistency'
import { question } from './fixtures'

describe('consistency index', () => {
  it('does not award fit quality for insufficient observations', () => {
    const questions = [
      question({ id: 'a1', nominalDeltaUv: 0.01, correct: false, answer: null }),
      question({ id: 'a2', nominalDeltaUv: 0.02, correct: true, anchorKey: 'anchor-A-0', phase: 'anchor' }),
      question({ id: 'a3', nominalDeltaUv: 0.02, correct: true, anchorKey: 'anchor-A-0', phase: 'anchor' }),
      question({ id: 'a4', nominalDeltaUv: 0.04, correct: true }),
    ]
    const result = calculateConsistencyIndex(questions)
    expect(result.score).toBeLessThan(80)
    expect(result.fitQuality).toBe(0)
    expect(result.anchorAgreement).toBe(100)
  })

  it('reduces score for anchor disagreement and non-monotonic responses', () => {
    const questions = [
      question({ id: 'a1', nominalDeltaUv: 0.01, correct: true }),
      question({ id: 'a2', nominalDeltaUv: 0.02, correct: false, anchorKey: 'anchor-A-0', phase: 'anchor' }),
      question({ id: 'a3', nominalDeltaUv: 0.02, correct: true, anchorKey: 'anchor-A-0', phase: 'anchor' }),
      question({ id: 'a4', nominalDeltaUv: 0.04, correct: false }),
    ]
    const result = calculateConsistencyIndex(questions)
    expect(result.anchorAgreement).toBe(0)
    expect(result.score).toBeLessThan(65)
  })
})
