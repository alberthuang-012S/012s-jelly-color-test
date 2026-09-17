import { describe, expect, it } from 'vitest'
import { runVirtualObserverSimulation } from './simulation'

describe('virtual observer simulation', () => {
  it.each([0.01, 0.02, 0.04])('estimates a %s threshold under an open-response observer', (threshold) => {
    const result = runVirtualObserverSimulation({ threshold, sessions: 120, seed: 90210 })
    expect(result.validSessions / result.sessions).toBeGreaterThanOrEqual(0.9)
    expect(Math.abs(result.bias)).toBeLessThan(threshold * 0.25)
    expect(result.meanAbsoluteError).toBeLessThan(threshold * 0.35)
    expect(result.maxTrialCount).toBeLessThanOrEqual(117)
    expect(result.usableRate).toBeGreaterThanOrEqual(0.9)
    expect(result.convergenceRate).toBeGreaterThanOrEqual(0)
    expect(result.lowConvergenceRate).toBeGreaterThanOrEqual(0)
    expect(result.psychometricFitUsageRate + result.reversalFallbackUsageRate).toBeGreaterThanOrEqual(0.9)
    expect(result.failedCalibrationRate).toBeGreaterThanOrEqual(0)
  }, 30_000)
})
