import { clamp, relativeLuminance, type RGB } from './colorSpace'

export function luminanceDistribution(values: number[], binCount = 8, minimum = 0, maximum = 1): number[] {
  if (!values.length) return Array.from({ length: binCount }, () => 0)
  const span = Math.max(maximum - minimum, 1e-9)
  const bins = Array.from({ length: binCount }, () => 0)
  values.forEach((value) => {
    const index = Math.min(binCount - 1, Math.max(0, Math.floor(((value - minimum) / span) * binCount)))
    bins[index] += 1
  })
  return bins.map((value) => value / values.length)
}

export function distributionOverlap(first: number[], second: number[]): number {
  const size = Math.max(first.length, second.length)
  if (!size) return 1
  let difference = 0
  for (let index = 0; index < size; index += 1) {
    difference += Math.abs((first[index] ?? 0) - (second[index] ?? 0))
  }
  return clamp(1 - difference / 2)
}

export function meanLuminanceDifference(first: RGB[], second: RGB[]): number {
  const firstMean = first.reduce((sum, color) => sum + relativeLuminance(color), 0) / Math.max(1, first.length)
  const secondMean = second.reduce((sum, color) => sum + relativeLuminance(color), 0) / Math.max(1, second.length)
  return Math.abs(firstMean - secondMean)
}

export function grayscaleLeakage(first: RGB[], second: RGB[]): number {
  if (!first.length || !second.length) return 1
  const firstMean = first.reduce((sum, color) => sum + relativeLuminance(color), 0) / first.length
  const secondMean = second.reduce((sum, color) => sum + relativeLuminance(color), 0) / second.length
  const firstValues = first.map(relativeLuminance)
  const secondValues = second.map(relativeLuminance)
  const overlap = distributionOverlap(luminanceDistribution(firstValues), luminanceDistribution(secondValues))
  return clamp(Math.abs(firstMean - secondMean) * 7 + (1 - overlap) * 0.2)
}
