import { isInSrgbGamut } from './gamut'
import { distributionOverlap, grayscaleLeakage, luminanceDistribution, meanLuminanceDifference } from '../psychophysics/luminance'
import { relativeLuminance, rgbToUvPrime, uvDistance, type RGB } from '../psychophysics/colorSpace'
import type { PlateDot, PlateValidation } from '../test/types'

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length)
}

/** Mean chromaticities of the actual quantized dot colors sent to canvas. */
export function dotNominalDistance(dots: PlateDot[]): number {
  const meanUv = (figure: boolean) => {
    const colors = dots.filter((dot) => dot.isFigure === figure).map((dot) => rgbToUvPrime(dot.color))
    return { u: average(colors.map((uv) => uv.u)), v: average(colors.map((uv) => uv.v)) }
  }
  return uvDistance(meanUv(true), meanUv(false))
}

export function validatePlate(
  dots: PlateDot[],
  figureColor: RGB,
  backgroundColor: RGB,
  expectedDistance: number,
): PlateValidation {
  const figureDots = dots.filter((dot) => dot.isFigure)
  const backgroundDots = dots.filter((dot) => !dot.isFigure)
  const figureColors = figureDots.map((dot) => dot.color)
  const backgroundColors = backgroundDots.map((dot) => dot.color)
  const figureLuminance = figureColors.map(relativeLuminance)
  const backgroundLuminance = backgroundColors.map(relativeLuminance)
  const overlap = distributionOverlap(luminanceDistribution(figureLuminance), luminanceDistribution(backgroundLuminance))
  const actualDistance = uvDistance(rgbToUvPrime(figureColor), rgbToUvPrime(backgroundColor))
  const renderedDistance = dotNominalDistance(dots)
  const meanDifference = meanLuminanceDifference(figureColors, backgroundColors)
  const leakage = grayscaleLeakage(figureColors, backgroundColors)
  const density = figureDots.length / Math.max(1, dots.length)
  const rejectedReasons: string[] = []
  const checks = {
    // Centered single digits occupy less area than two-digit targets.
    maskCoverage: density >= 0.08 && density <= 0.68,
    dotCount: dots.length >= 300 && dots.length <= 800,
    figureBackgroundDensity: figureDots.length >= 40 && backgroundDots.length >= 180,
    nominalChromaticDistance: Number.isFinite(expectedDistance) && actualDistance > 0 && Math.abs(actualDistance - expectedDistance) <= Math.max(0.0002, expectedDistance * 0.02) && Math.abs(renderedDistance - expectedDistance) <= Math.max(0.0002, expectedDistance * 0.02),
    meanLuminanceDifference: meanDifference <= 0.035,
    luminanceDistributionOverlap: overlap >= 0.55,
    grayscaleLeakage: leakage <= 0.18,
    noInvalidRgbClipping: [figureColor, backgroundColor, ...figureColors, ...backgroundColors].every(isInSrgbGamut) && dots.every((dot) => [dot.x, dot.y, dot.radius].every(Number.isFinite) && dot.radius > 0),
  }
  Object.entries(checks).forEach(([key, passed]) => {
    if (!passed) rejectedReasons.push(key)
  })
  return { ...checks, productionValid: rejectedReasons.length === 0, rejectedReasons }
}

export function luminanceSummary(dots: PlateDot[]): { meanFigure: number; meanBackground: number } {
  const figure = dots.filter((dot) => dot.isFigure).map((dot) => relativeLuminance(dot.color))
  const background = dots.filter((dot) => !dot.isFigure).map((dot) => relativeLuminance(dot.color))
  return { meanFigure: average(figure), meanBackground: average(background) }
}
