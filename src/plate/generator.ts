import { rgbToUvPrime, type RGB } from '../psychophysics/colorSpace'
import { seededRandom } from './rng'
import { buildDotLayout } from './mask'
import { generatePalette } from './palettes'
import { validatePlate } from './validator'
import type { ColorDirectionId, GeneratedPlate } from '../test/types'

export interface PlateRequest {
  direction?: ColorDirectionId
  requestedDistance: number
  number: number
  seed: number
  phase?: 'control' | 'calibration' | 'adaptive' | 'anchor'
}

function noisyColor(base: RGB, random: () => number): RGB {
  const factor = 0.91 + random() * 0.18
  return {
    r: base.r * factor,
    g: base.g * factor,
    b: base.b * factor,
  }
}

export function generatePlate(request: PlateRequest): GeneratedPlate {
  const direction = request.direction ?? 'A'
  let bestPlate: GeneratedPlate | undefined
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const attemptSeed = request.seed + attempt * 7919
    const palette = generatePalette(direction, request.requestedDistance, attemptSeed)
    const random = seededRandom(attemptSeed ^ 0x9e3779b9)
    const dots = buildDotLayout(request.number, attemptSeed)
    dots.forEach((dot) => {
      dot.color = noisyColor(dot.isFigure ? palette.figureColor : palette.backgroundColor, random)
    })
    const validation = validatePlate(dots, palette.figureColor, palette.backgroundColor, request.requestedDistance)
    const plate: GeneratedPlate = {
      id: `plate-${request.phase ?? 'trial'}-${request.seed}`,
      paletteId: palette.paletteId,
      seed: request.seed,
      targetNumber: request.number,
      directionId: direction,
      requestedDistance: request.requestedDistance,
      actualNominalDeltaUv: palette.actualNominalDeltaUv,
      figureColor: palette.figureColor,
      backgroundColor: palette.backgroundColor,
      dots,
      validation,
      regenerated: attempt > 0,
    }
    bestPlate = plate
    if (validation.productionValid) return plate
  }
  return bestPlate as GeneratedPlate
}

export function rgbText(rgb: RGB): string {
  return `rgb(${Math.round(rgb.r)} ${Math.round(rgb.g)} ${Math.round(rgb.b)})`
}

export function verifyNominalDistance(figureColor: RGB, backgroundColor: RGB): number {
  return Math.hypot(
    rgbToUvPrime(figureColor).u - rgbToUvPrime(backgroundColor).u,
    rgbToUvPrime(figureColor).v - rgbToUvPrime(backgroundColor).v,
  )
}
