import type { RGB } from '../psychophysics/colorSpace'

export function isInSrgbGamut(color: RGB): boolean {
  return [color.r, color.g, color.b].every((channel) => Number.isFinite(channel) && channel >= 0 && channel <= 255)
}

export function gamutDistanceFromEdge(color: RGB): number {
  return Math.min(color.r, color.g, color.b, 255 - color.r, 255 - color.g, 255 - color.b)
}
