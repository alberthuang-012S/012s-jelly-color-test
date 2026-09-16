import { describe, expect, it } from 'vitest'
import { canSubmitTrial, pauseTrial, responseTimeMs, resumeTrial, startTrial } from '../test/trialClock'
import { createEngineState, selectNextTrial } from '../test/scheduler'

describe('intentional pause timing', () => {
  it('excludes the pause and restarts response timing on the same trial after resume', () => {
    const started = startTrial(1_000)
    const paused = pauseTrial(started)
    expect(responseTimeMs(paused, 31_000)).toBeUndefined()
    const resumed = resumeTrial(paused, 31_000)
    expect(resumed.paused).toBe(false)
    expect(responseTimeMs(resumed, 31_450)).toBe(450)
  })

  it('blocks answer submission only while paused or already locked', () => {
    expect(canSubmitTrial(true, false)).toBe(false)
    expect(canSubmitTrial(false, true)).toBe(false)
    expect(canSubmitTrial(false, false)).toBe(true)
  })

  it('keeps the scheduler trial unchanged while the UI is paused', () => {
    const engine = createEngineState(123)
    const beforePause = selectNextTrial(engine)
    expect(selectNextTrial(engine)).toEqual(beforePause)
  })
})
