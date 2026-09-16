import { describe, expect, it } from 'vitest'
import { createStaircase, detectReversal, updateStaircase } from '../psychophysics/staircase'

describe('2-down / 1-up staircase', () => {
  it('waits for two consecutive correct answers before getting harder', () => {
    const initial = createStaircase('A', 0.03)
    const afterOne = updateStaircase(initial, true)
    const afterTwo = updateStaircase(afterOne, true)
    expect(afterOne.currentDistance).toBe(0.03)
    expect(afterTwo.currentDistance).toBeLessThan(0.03)
  })

  it('gets easier after one incorrect answer', () => {
    const initial = createStaircase('A', 0.03)
    const after = updateStaircase(initial, false)
    expect(after.currentDistance).toBeGreaterThan(0.03)
    expect(after.consecutiveCorrect).toBe(0)
  })

  it('does not treat correct then incorrect as a 2-down movement', () => {
    const initial = createStaircase('A', 0.03)
    const afterCorrect = updateStaircase(initial, true)
    const afterIncorrect = updateStaircase(afterCorrect, false)
    expect(afterCorrect.currentDistance).toBe(0.03)
    expect(afterIncorrect.currentDistance).toBeGreaterThan(0.03)
  })

  it('detects reversals and reduces step size', () => {
    expect(detectReversal('harder', 'easier')).toBe(true)
    expect(detectReversal('easier', 'harder')).toBe(true)
    const initial = createStaircase('A', 0.03)
    const easier = updateStaircase(initial, false)
    const harder = updateStaircase(updateStaircase(easier, true), true)
    expect(harder.reversals.length).toBe(1)
    const secondEasier = updateStaircase(harder, false)
    const secondHarder = updateStaircase(updateStaircase(secondEasier, true), true)
    expect(secondHarder.reversals.length).toBe(3)
    expect(secondHarder.currentStep).toBeLessThan(initial.currentStep)
  })

  it('stops on the maximum trial guard even without convergence', () => {
    let state = createStaircase('A', 0.03)
    for (let index = 0; index < 18; index += 1) state = updateStaircase(state, true)
    expect(state.stopped).toBe(true)
    expect(state.converged).toBe(false)
    expect(state.convergenceQuality).toBe('low')
    expect(state.trialCount).toBe(18)
  })
})
