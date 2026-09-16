import { clamp, relativeLuminance, rgbToUvPrime, uvDistance, type RGB } from '../psychophysics/colorSpace'
import type { ColorDirectionId } from '../test/types'

export interface PaletteResult {
  paletteId: string
  figureColor: RGB
  backgroundColor: RGB
  actualNominalDeltaUv: number
  gamutSafe: boolean
}

const DIRECTION_PAIRS: Record<ColorDirectionId, { background: RGB; figure: RGB }> = {
  A: { background: { r: 176, g: 128, b: 150 }, figure: { r: 132, g: 171, b: 138 } },
  B: { background: { r: 132, g: 171, b: 138 }, figure: { r: 176, g: 128, b: 150 } },
  C: { background: { r: 112, g: 153, b: 174 }, figure: { r: 179, g: 149, b: 100 } },
}

function mix(first: RGB, second: RGB, amount: number): RGB {
  return {
    r: first.r + (second.r - first.r) * amount,
    g: first.g + (second.g - first.g) * amount,
    b: first.b + (second.b - first.b) * amount,
  }
}

function equalizeLuminance(color: RGB, target: number): RGB {
  const maximumFactor = Math.min(2, 255 / Math.max(color.r, color.g, color.b, 1))
  let low = 0.2
  let high = maximumFactor
  for (let iteration = 0; iteration < 18; iteration += 1) {
    const factor = (low + high) / 2
    const luminance = relativeLuminance({ r: color.r * factor, g: color.g * factor, b: color.b * factor })
    if (luminance < target) low = factor
    else high = factor
  }
  const factor = (low + high) / 2
  return { r: color.r * factor, g: color.g * factor, b: color.b * factor }
}

function pairAt(directionId: ColorDirectionId, amount: number): { backgroundColor: RGB; figureColor: RGB } {
  const pair = DIRECTION_PAIRS[directionId]
  const midpoint = mix(pair.background, pair.figure, 0.5)
  const backgroundRaw = mix(midpoint, pair.background, amount)
  const figureRaw = mix(midpoint, pair.figure, amount)
  const targetLuminance = (relativeLuminance(backgroundRaw) + relativeLuminance(figureRaw)) / 2
  return {
    backgroundColor: equalizeLuminance(backgroundRaw, targetLuminance),
    figureColor: equalizeLuminance(figureRaw, targetLuminance),
  }
}

export function generatePalette(
  directionId: ColorDirectionId,
  requestedDistance: number,
  seed: number,
): PaletteResult {
  const target = clamp(requestedDistance, 0.001, 0.075)
  let low = 0.01
  let high = 1
  let best = pairAt(directionId, 1)
  for (let iteration = 0; iteration < 24; iteration += 1) {
    const amount = (low + high) / 2
    const pair = pairAt(directionId, amount)
    const distance = uvDistance(rgbToUvPrime(pair.figureColor), rgbToUvPrime(pair.backgroundColor))
    best = pair
    if (distance < target) low = amount
    else high = amount
  }
  const actual = uvDistance(rgbToUvPrime(best.figureColor), rgbToUvPrime(best.backgroundColor))
  const figureColor = best.figureColor
  const backgroundColor = best.backgroundColor
  const gamutSafe = [figureColor, backgroundColor].every((color) =>
    [color.r, color.g, color.b].every((channel) => channel >= 0 && channel <= 255),
  )
  return {
    paletteId: `p-${directionId}-${Math.round(actual * 100000)}-${seed}`,
    figureColor,
    backgroundColor,
    actualNominalDeltaUv: uvDistance(rgbToUvPrime(figureColor), rgbToUvPrime(backgroundColor)),
    gamutSafe,
  }
}
