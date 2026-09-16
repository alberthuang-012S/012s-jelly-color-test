import { expect, it } from 'vitest'
import { buildDotLayout } from '../plate/mask'
import { createEngineState, selectNextTrial } from '../test/scheduler'

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
