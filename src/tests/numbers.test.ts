import { expect, it } from 'vitest'
import { buildDotLayout } from '../plate/mask'
import { createEngineState, selectNextTrial } from '../test/scheduler'

function singleDigitCoordinates(x: number, y: number) {
  return { x: (x - 0.35) / 0.3, y: (y - 0.22) / 0.56 }
}

it('renders all 100 numbers as distinct masks without a fallback glyph', () => {
  const masks = Array.from({ length: 100 }, (_, number) => buildDotLayout(number, 1).map((dot) => Number(dot.isFigure)).join(''))
  expect(new Set(masks).size).toBe(100)
  expect(() => buildDotLayout(100, 1)).toThrow()
  expect(() => buildDotLayout(-1, 1)).toThrow()
})

it('can select every answer including zero and uses reproducible seeds', () => {
  const answers = new Set(Array.from({ length: 2000 }, (_, seed) => selectNextTrial(createEngineState(seed))!.targetNumber))
  expect(answers.size).toBe(100)
  expect(selectNextTrial(createEngineState(123))).toEqual(selectNextTrial(createEngineState(123)))
})

it('centers single digits without stretching them to the two-digit width', () => {
  const bounds = (number: number) => {
    const dots = buildDotLayout(number, 1).filter((dot) => dot.isFigure)
    return { left: Math.min(...dots.map((dot) => dot.x)), right: Math.max(...dots.map((dot) => dot.x)), top: Math.min(...dots.map((dot) => dot.y)), bottom: Math.max(...dots.map((dot) => dot.y)) }
  }
  const single = bounds(8)
  const double = bounds(88)
  expect(single.right - single.left).toBeLessThan((double.right - double.left) * 0.55)
  expect(single.bottom - single.top).toBeCloseTo(double.bottom - double.top, 1)
  expect((single.left + single.right) / 2).toBeCloseTo(0.5, 1)
  expect((single.right - single.left) / (single.bottom - single.top)).toBeGreaterThan(0.3)
  expect((single.right - single.left) / (single.bottom - single.top)).toBeLessThan(0.7)
})

it('keeps a readable central counter in the 4 mask', () => {
  const counterFigureCounts = Array.from({ length: 100 }, (_, index) => buildDotLayout(4, 7000 + index)
    .filter((dot) => {
      const point = singleDigitCoordinates(dot.x, dot.y)
      return dot.isFigure && point.x >= 0.49 && point.x <= 0.6 && point.y >= 0.3 && point.y <= 0.48
    }).length)

  expect(Math.max(...counterFigureCounts)).toBeLessThanOrEqual(2)
})

it('keeps the open 5 lower stroke distinct from the closed 6 bowl', () => {
  const lowerRightDifferences = Array.from({ length: 100 }, (_, index) => {
    const seed = 7000 + index
    const countInLowerRight = (number: number) => buildDotLayout(number, seed).filter((dot) => {
      const point = singleDigitCoordinates(dot.x, dot.y)
      return dot.isFigure && point.x >= 0.62 && point.x <= 0.82 && point.y >= 0.46 && point.y <= 0.68
    }).length
    return countInLowerRight(6) - countInLowerRight(5)
  })

  expect(Math.min(...lowerRightDifferences)).toBeGreaterThanOrEqual(1)
})
