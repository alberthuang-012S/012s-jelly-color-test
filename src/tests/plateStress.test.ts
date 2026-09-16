import { describe, expect, it } from 'vitest'
import { generatePlate } from '../plate/generator'

describe('plate generator stress', () => {
  it('generates 3000 valid seeded production plates without NaN or crashes', () => {
    let rejected = 0
    for (let index = 0; index < 3000; index += 1) {
      const plate = generatePlate({
        direction: (['A', 'B', 'C'] as const)[index % 3],
        requestedDistance: 0.0035 + (Math.floor(index / 300) % 10) * (0.075 - 0.0035) / 9,
        number: Math.floor(index / 3) % 100,
        seed: 1000 + index,
        phase: 'adaptive',
      })
      if (!plate.validation.productionValid) rejected += 1
      expect(Number.isFinite(plate.actualNominalDeltaUv)).toBe(true)
      expect(plate.dots.every((dot) => Object.values(dot.color).every(Number.isFinite))).toBe(true)
    }
    expect(rejected).toBe(0)
  })
})
