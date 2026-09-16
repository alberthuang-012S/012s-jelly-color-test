import type { QuestionResult } from '../test/types'

export function question(overrides: Partial<QuestionResult> = {}): QuestionResult {
  return {
    id: 'q',
    phase: 'adaptive',
    directionId: 'A',
    targetNumber: 6,
    answer: 6,
    correct: true,
    requestedDistance: 0.02,
    nominalDeltaUv: 0.02,
    paletteId: 'p',
    seed: 1,
    responseTimeMs: 800,
    focusInterrupted: false,
    ...overrides,
  }
}
