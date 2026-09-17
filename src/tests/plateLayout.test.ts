import { expect, it } from 'vitest'
import { buildDotLayout } from '../plate/mask'
import { generatePlate } from '../plate/generator'
import { adaptiveConfig } from '../psychophysics/config'

const distanceFromPlateCenter = (x: number, y: number) => Math.hypot(x - 0.5, y - 0.5)

it('creates a contained, varied, non-grid dot field', () => {
  const dots = buildDotLayout(26, 2601)
  const radii = dots.map((dot) => dot.radius)
  const xBins = new Set(dots.map((dot) => Math.floor(dot.x * 12)))
  const yBins = new Set(dots.map((dot) => Math.floor(dot.y * 12)))

  expect(dots.length).toBeGreaterThanOrEqual(300)
  expect(dots.length).toBeLessThanOrEqual(800)
  expect(Math.max(...dots.map((dot) => distanceFromPlateCenter(dot.x, dot.y)))).toBeLessThan(0.43)
  expect(Math.max(...dots.map((dot) => distanceFromPlateCenter(dot.x, dot.y) + dot.radius))).toBeLessThan(0.43)
  expect(Math.max(...radii) / Math.min(...radii)).toBeGreaterThan(1.8)
  expect(new Set(radii.map((radius) => radius.toFixed(6))).size).toBeGreaterThan(dots.length * 0.9)
  expect(xBins.size).toBeGreaterThanOrEqual(9)
  expect(yBins.size).toBeGreaterThanOrEqual(9)
})

it('is deterministic for the same seed and changes layout with a different seed', () => {
  expect(buildDotLayout(74, 90210)).toEqual(buildDotLayout(74, 90210))
  expect(buildDotLayout(74, 90210)).not.toEqual(buildDotLayout(74, 90211))
})

it('keeps single and double digit masks populated and production-valid', () => {
  for (const number of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 26, 45, 74, 89]) {
    const dots = buildDotLayout(number, 7000 + number)
    const figureCount = dots.filter((dot) => dot.isFigure).length
    const backgroundCount = dots.length - figureCount
    const plate = generatePlate({
      direction: 'A',
      requestedDistance: 0.042,
      number,
      seed: 7000 + number,
      phase: 'adaptive',
    })

    expect(figureCount).toBeGreaterThanOrEqual(40)
    expect(backgroundCount).toBeGreaterThanOrEqual(180)
    expect(plate.validation.productionValid).toBe(true)
  }
})

it('keeps the clarified 4/5/6 masks production-valid across contrast levels', () => {
  for (const number of [4, 5, 6]) {
    for (const requestedDistance of [adaptiveConfig.minDistance, adaptiveConfig.initialDistance, adaptiveConfig.maxDistance]) {
      const plate = generatePlate({
        direction: 'A',
        requestedDistance,
        number,
        seed: 12000 + number * 100 + Math.round(requestedDistance * 100000),
        phase: 'adaptive',
      })

      expect(plate.validation.productionValid).toBe(true)
    }
  }
})
