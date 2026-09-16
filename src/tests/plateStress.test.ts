import { describe, expect, it } from 'vitest'
import { generatePlate } from '../plate/generator'

describe('plate generator stress', () => {
  it('generates 3000 valid seeded production plates without NaN or crashes', () => {
    let rejected = 0
    for (let index = 0; index < 3000; index += 1) {
      const plate = generatePlate({
        direction: (['A', 'B', 'C'] as const)[index % 3],
        requestedDistance: 0.006 + (index % 15) * 0.0045,
        number: [6, 12, 29, 45, 74][index % 5],
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
