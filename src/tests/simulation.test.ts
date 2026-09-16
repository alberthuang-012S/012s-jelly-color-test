import { describe, expect, it } from 'vitest'
import { runVirtualObserverSimulation } from './simulation'

describe('virtual observer simulation', () => {
  it('estimates three simulated thresholds with bounded error', () => {
    const result = runVirtualObserverSimulation({ threshold: 0.02, sessions: 120, seed: 90210 })
    expect(result.validSessions).toBeGreaterThan(100)
    expect(result.estimatedMedian).toBeGreaterThan(0.01)
    expect(result.estimatedMedian).toBeLessThan(0.035)
    expect(result.meanAbsoluteError).toBeLessThan(0.015)
  }, 30_000)
})
