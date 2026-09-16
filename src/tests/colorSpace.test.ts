import { describe, expect, it } from 'vitest'
import { rgbToLinearRgb, rgbToUvPrime, rgbToXyz, uvDistance, xyzToUvPrime } from '../psychophysics/colorSpace'

describe('CIE 1976 u′v′ color space', () => {
  it('converts sRGB white to the D65 reference neighborhood', () => {
    const xyz = rgbToXyz({ r: 255, g: 255, b: 255 })
    const uv = xyzToUvPrime(xyz)
    expect(xyz.x).toBeCloseTo(0.95047, 4)
    expect(xyz.y).toBeCloseTo(1, 4)
    expect(uv.u).toBeCloseTo(0.19783, 4)
    expect(uv.v).toBeCloseTo(0.46832, 4)
  })

  it('linearizes the sRGB knee correctly', () => {
    expect(rgbToLinearRgb({ r: 0, g: 12.92, b: 255 }).r).toBe(0)
    expect(rgbToLinearRgb({ r: 0.04045, g: 0.04045, b: 0.04045 }).r).toBeCloseTo(0.00313, 4)
    expect(rgbToLinearRgb({ r: 255, g: 255, b: 255 }).r).toBeCloseTo(1, 8)
  })

  it('keeps uv distance symmetric and zero for identical colors', () => {
    const color = rgbToUvPrime({ r: 120, g: 140, b: 160 })
    const other = rgbToUvPrime({ r: 130, g: 150, b: 140 })
    expect(uvDistance(color, color)).toBe(0)
    expect(uvDistance(color, other)).toBeCloseTo(uvDistance(other, color), 12)
  })
})
