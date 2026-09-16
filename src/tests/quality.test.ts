import { describe, expect, it } from 'vitest'
import { calculateResultQualityIndex } from '../psychophysics/quality'
import { createEngineState } from '../test/scheduler'
import { question } from './fixtures'

describe('result quality index', () => {
  it('is high for complete, controlled, consistent data', () => {
    const engine = { ...createEngineState(), status: 'complete' as const }
    const questions = [
      question({ id: 'c1', phase: 'control', correct: true, directionId: undefined, nominalDeltaUv: undefined }),
      question({ id: 'c2', phase: 'control', correct: true, directionId: undefined, nominalDeltaUv: undefined }),
      ...Array.from({ length: 12 }, (_, index) => question({ id: `a-${index}`, nominalDeltaUv: 0.01 + index * 0.003, correct: true, responseTimeMs: 800 })),
    ]
    const result = calculateResultQualityIndex(questions, 95, engine)
    expect(result.score).toBeGreaterThanOrEqual(90)
    expect(result.classification).toBe('HIGH')
  })

  it('is low when controls fail and timing/focus anomalies accumulate', () => {
    const engine = { ...createEngineState(), status: 'partial' as const }
    const questions = [
      question({ id: 'c1', phase: 'control', correct: false, answer: null, directionId: undefined, nominalDeltaUv: undefined }),
      question({ id: 'c2', phase: 'control', correct: false, answer: null, directionId: undefined, nominalDeltaUv: undefined }),
      ...Array.from({ length: 10 }, (_, index) => question({ id: `bad-${index}`, nominalDeltaUv: 0.01, correct: false, answer: null, responseTimeMs: index % 2 ? 31_000 : 120, focusInterrupted: true })),
    ]
    const result = calculateResultQualityIndex(questions, 35, engine)
    expect(result.score).toBeLessThan(60)
    expect(result.classification).toBe('LOW')
    expect(result.interruptions).toBe(10)
  })
})
