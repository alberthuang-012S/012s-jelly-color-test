import { describe, expect, it } from 'vitest'
import { generatePlate } from '../plate/generator'
import { generatePalette } from '../plate/palettes'
import { validatePlate, dotNominalDistance } from '../plate/validator'
import { createEngineState, recordTrial, selectNextTrial, progressPercent, questionCountEstimate } from '../test/scheduler'
import { createStaircase, updateStaircase } from '../psychophysics/staircase'
import { estimateThreshold, overallThreshold } from '../psychophysics/threshold'
import { calculateAllMetrics } from '../psychophysics/metrics'
import { calculateConsistencyIndex } from '../psychophysics/consistency'
import { question } from './fixtures'

function next(state = createEngineState(123)) {
  const spec = selectNextTrial(state)!
  const plate = generatePlate({ direction: spec.directionId, requestedDistance: spec.requestedDistance, number: spec.targetNumber, seed: spec.seed, phase: spec.phase })
  return { spec, plate }
}

describe('measurement engine invariants', () => {
  it('uses actual presented distance for moves and reversals', () => {
    const track = { ...createStaircase('A', 0.05), previousMovement: 'harder' as const }
    const updated = updateStaircase(track, false, undefined, 0.025)
    expect(updated.reversals).toEqual([0.025])
    expect(updated.currentDistance).toBeCloseTo(0.037)
  })
  it('does not count a blocked boundary move as a reversal', () => {
    const track = { ...createStaircase('A', 0.075), previousMovement: 'harder' as const }
    expect(updateStaircase(track, false).reversals).toHaveLength(0)
  })
  it('stops at max on a first-correct hold without claiming convergence', () => {
    const track = { ...createStaircase('A'), trialCount: 17 }
    expect(updateStaircase(track, true)).toMatchObject({ stopped: true, converged: false, convergenceQuality: 'low' })
  })
  it('does not truncate at 35 adaptive trials', () => {
    let state = createEngineState(123)
    expect(questionCountEstimate(state)).toMatchObject({ answered: 0, minimumTotal: 41, maximumTotal: 71, exact: false })
    for (let guard = 0; guard < 80 && state.status === 'in-progress'; guard++) {
      const { spec, plate } = next(state)
      state = recordTrial(state, spec, spec.targetNumber, 800, false, plate)
    }
    expect(state.status).toBe('complete')
    expect(state.adaptiveTrialCount).toBe(54)
    expect(state.questions.some((item) => ![6, 12, 29, 45, 74].includes(item.targetNumber))).toBe(true)
    expect(Object.values(state.tracks).every((track) => track.stopped && !track.converged)).toBe(true)
    expect(progressPercent(state)).toBe(100)
    expect(calculateAllMetrics(state).overallDcdt).toBeUndefined()
  })
  it('updates the visible count range after calibration and converged tracks', () => {
    let state = createEngineState(123)
    for (let guard = 0; guard < 20 && state.phase !== 'adaptive'; guard++) {
      const { spec, plate } = next(state)
      state = recordTrial(state, spec, spec.targetNumber, 800, false, plate)
    }
    expect(state.phase).toBe('adaptive')
    const afterCalibration = questionCountEstimate(state)
    expect(afterCalibration.answered).toBe(state.questions.length)
    expect(afterCalibration.minimumTotal).toBeGreaterThanOrEqual(afterCalibration.answered)
    expect(afterCalibration.maximumTotal).toBeGreaterThanOrEqual(afterCalibration.minimumTotal)
    expect(afterCalibration.maximumTotal).toBeLessThanOrEqual(71)
  })
  it('calibration failure cannot produce anchors or thresholds', () => {
    let state = createEngineState(123)
    for (let guard = 0; guard < 80 && state.status === 'in-progress'; guard++) {
      const { spec, plate } = next(state)
      state = recordTrial(state, spec, null, 800, false, plate)
    }
    expect(state.status).toBe('complete')
    expect(state.questions.filter((item) => item.phase === 'anchor')).toHaveLength(0)
    expect(Object.values(state.calibrationFailed)).toEqual([true, true, true])
    expect(calculateAllMetrics(state).overallDcdt).toBeUndefined()
  })
  it('rejects invalid plates, mismatched plates, duplicate submissions, and invalid responses', () => {
    const state = createEngineState(123)
    const { spec, plate } = next(state)
    expect(() => recordTrial(state, spec, 6, 800, false, { ...plate, validation: { ...plate.validation, productionValid: false } })).toThrow()
    expect(() => recordTrial(state, spec, 6, 800, false, { ...plate, seed: 999 })).toThrow()
    expect(() => recordTrial(state, spec, 100, 800, false, plate)).toThrow()
    expect(() => recordTrial(state, spec, 6, NaN, false, plate)).toThrow()
    const updated = recordTrial(state, spec, 6, 800, false, plate)
    expect(() => recordTrial(updated, spec, 6, 800, false, plate)).toThrow()
    expect(state.questions).toHaveLength(0)
  })
  it('is reproducible with a seed and changes layout between seeds', () => {
    expect(next(createEngineState(1))).toEqual(next(createEngineState(1)))
    expect(next(createEngineState(1)).plate.dots).not.toEqual(next(createEngineState(2)).plate.dots)
  })
  it('records the rendered dot distance rather than the requested distance', () => {
    const state = createEngineState(123)
    const { spec, plate } = next(state)
    expect(plate.actualNominalDeltaUv).toBe(dotNominalDistance(plate.dots))
    expect(recordTrial(state, spec, 6, 800, false, plate).questions[0].nominalDeltaUv).toBe(plate.actualNominalDeltaUv)
  })
  it('fails closed for unsupported distances and invalid geometry', () => {
    expect(() => generatePalette('A', 0.2, 1)).toThrow()
    expect(() => generatePalette('A', NaN, 1)).toThrow()
    const { plate } = next()
    const dots = plate.dots.map((dot, index) => index ? dot : { ...dot, radius: NaN })
    expect(validatePlate(dots, plate.figureColor, plate.backgroundColor, plate.requestedDistance).productionValid).toBe(false)
  })
})

describe('threshold and scoring eligibility', () => {
  const observations = Array.from({ length: 12 }, (_, index) => question({ nominalDeltaUv: 0.01 + index * 0.002, correct: index > 4 }))
  it('excludes anchors and requires ten adaptive observations', () => {
    const track = { ...createStaircase('A'), reversals: [0.02, 0.024, 0.018, 0.022] }
    const anchors = observations.map((item) => ({ ...item, phase: 'anchor' as const }))
    expect(estimateThreshold('A', anchors, track).threshold).toBeUndefined()
    expect(estimateThreshold('A', observations.slice(0, 9), track).threshold).toBeUndefined()
    expect(estimateThreshold('A', [...observations, ...anchors], track)).toEqual(estimateThreshold('A', observations, track))
  })
  it('requires four valid reversals for fallback and respects failed calibration', () => {
    const allCorrect = observations.map((item) => ({ ...item, correct: true }))
    const track = { ...createStaircase('A'), reversals: [0.02, 0.024, 0.018] }
    expect(estimateThreshold('A', allCorrect, track).threshold).toBeUndefined()
    const four = { ...track, reversals: [...track.reversals, 0.022] }
    expect(estimateThreshold('A', allCorrect, four).threshold).toBeCloseTo(0.021)
    expect(estimateThreshold('A', allCorrect, { ...four, insufficientCalibration: true }).threshold).toBeUndefined()
  })
  it('requires two finite calibrated directions for the overall result', () => {
    const base = estimateThreshold('A', [])
    expect(overallThreshold([{ ...base, threshold: 0.02 }, { ...base, directionId: 'B', threshold: NaN }])).toBeUndefined()
    expect(overallThreshold([{ ...base, threshold: 0.02 }, { ...base, directionId: 'B', threshold: 0.04, insufficientCalibration: true }])).toBeUndefined()
  })
  it('does not treat differences between directions as monotonicity violations', () => {
    const points = [question({ directionId: 'A', nominalDeltaUv: 0.01, correct: true }), question({ directionId: 'A', nominalDeltaUv: 0.02, correct: true }), question({ directionId: 'B', nominalDeltaUv: 0.04, correct: false }), question({ directionId: 'B', nominalDeltaUv: 0.05, correct: false })]
    expect(calculateConsistencyIndex(points).monotonicity).toBe(100)
  })
  it('counts each trial in exactly one contrast band even with tied distances', () => {
    const state = { ...createEngineState(1), questions: Array.from({ length: 12 }, () => question()) }
    expect(calculateAllMetrics(state).difficultyCurve.bands.reduce((sum, band) => sum + band.count, 0)).toBe(12)
  })
})
