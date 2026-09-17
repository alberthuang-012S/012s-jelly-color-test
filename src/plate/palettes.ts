import { rgbToUvPrime, uvPrimeToRgb, uvDistance, type RGB } from '../psychophysics/colorSpace'
import { isInSrgbGamut } from './gamut'
import type { ColorDirectionId } from '../test/types'

export interface PaletteResult {
  paletteId: string
  figureColor: RGB
  backgroundColor: RGB
  actualNominalDeltaUv: number
  gamutSafe: boolean
}

// Display-relative directions, not clinical confusion axes. A/B reverse polarity;
// D/E add two complementary chromatic axes while preserving the original three.
type ColorAxis = readonly [number, number]
const AXES: Record<ColorDirectionId, ColorAxis> = {
  A: [-0.9, 0.435889894],
  B: [0.9, -0.435889894],
  C: [0.4, 0.916515139],
  D: [0.707106781, -0.707106781],
  E: [-0.866025404, -0.5],
}

export function generatePalette(directionId: ColorDirectionId, requestedDistance: number, seed: number): PaletteResult {
  if (!Number.isFinite(requestedDistance) || requestedDistance < 0.0035 || requestedDistance > 0.075) {
    throw new Error('Requested distance outside supported range')
  }
  const center = rgbToUvPrime({ r: 150, g: 150, b: 150 })
  const [u, v] = AXES[directionId]
  const scale = requestedDistance / (2 * Math.hypot(u, v))
  const figureColor = uvPrimeToRgb({ u: center.u + u * scale, v: center.v + v * scale }, 0.27)
  const backgroundColor = uvPrimeToRgb({ u: center.u - u * scale, v: center.v - v * scale }, 0.27)
  const gamutSafe = [figureColor, backgroundColor].every(isInSrgbGamut)
  if (!gamutSafe) throw new Error('Requested palette outside sRGB gamut')
  const actualNominalDeltaUv = uvDistance(rgbToUvPrime(figureColor), rgbToUvPrime(backgroundColor))
  return { paletteId: `uv2-${directionId}-${seed}`, figureColor, backgroundColor, actualNominalDeltaUv, gamutSafe }
}
