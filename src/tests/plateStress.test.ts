import { describe, expect, it } from 'vitest'
import { generatePlate } from '../plate/generator'
import { generatePalette } from '../plate/palettes'
import { DIRECTION_ORDER } from '../psychophysics/config'

describe('plate generator stress', () => {
  it('generates 3000 valid seeded production plates without NaN or crashes', () => {
    let rejected = 0
    for (let index = 0; index < 3000; index += 1) {
      const plate = generatePlate({
        direction: DIRECTION_ORDER[index % DIRECTION_ORDER.length],
        requestedDistance: 0.0035 + (Math.floor(index / 300) % 10) * (0.075 - 0.0035) / 9,
        number: Math.floor(index / DIRECTION_ORDER.length) % 100,
        seed: 1000 + index,
        phase: 'adaptive',
      })
      if (!plate.validation.productionValid) rejected += 1
      expect(Number.isFinite(plate.actualNominalDeltaUv)).toBe(true)
      expect(plate.dots.every((dot) => Object.values(dot.color).every(Number.isFinite))).toBe(true)
      expect(plate.validation.productionValid).toBe(true)
      expect(plate.validation.maskCoverage).toBe(true)
      expect(plate.validation.figureBackgroundDensity).toBe(true)
      expect(plate.validation.nominalChromaticDistance).toBe(true)
      expect(plate.validation.meanLuminanceDifference).toBe(true)
      expect(plate.validation.luminanceDistributionOverlap).toBe(true)
      expect(plate.validation.noInvalidRgbClipping).toBe(true)
      expect(plate.regenerated).toBe(false)
    }
    expect(rejected).toBe(0)
  })

  it('rejects targets outside the supported 0–99 range instead of substituting them', () => {
    for (const number of [-1, 100, 101, Number.NaN]) {
      expect(() => generatePlate({ direction: 'A', requestedDistance: 0.042, number, seed: 7, phase: 'adaptive' })).toThrow('Unsupported target number')
    }
  })

  it('switches red-green polarity deterministically on the bipolar axis', () => {
    const first = generatePalette('RG', 0.042, 100)
    const second = generatePalette('RG', 0.042, 101)
    expect(first.polarityId).toBeDefined()
    expect(second.polarityId).toBeDefined()
    expect(first.polarityId).not.toBe(second.polarityId)
    expect(first).toEqual(generatePalette('RG', 0.042, 100))
  })

  it('is reproducible at the distance limits and an intermediate distance', () => {
    for (const requestedDistance of [0.0035, 0.03125, 0.075]) {
      const request = { direction: 'C' as const, requestedDistance, number: 42, seed: 90210, phase: 'adaptive' as const }
      expect(generatePlate(request)).toEqual(generatePlate(request))
    }
  })
})
