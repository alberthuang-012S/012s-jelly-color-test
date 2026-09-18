import { describe, expect, it } from 'vitest'
import { responseTimeMs, startTrial } from '../test/trialClock'

describe('trial timing', () => {
  it('measures elapsed response time from the current trial start', () => {
    const clock = startTrial(1_000)
    expect(clock).toEqual({ startedAt: 1_000 })
    expect(responseTimeMs(clock, 1_450)).toBe(450)
    expect(responseTimeMs(clock, 900)).toBe(0)
  })

  it('rejects invalid start and response timestamps', () => {
    expect(() => startTrial(Number.NaN)).toThrow('Invalid trial start time')
    expect(responseTimeMs(startTrial(1_000), Number.NaN)).toBeUndefined()
  })
})
