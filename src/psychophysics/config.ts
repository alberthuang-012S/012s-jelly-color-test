import type { ColorDirectionId } from '../test/types'

// A/B are retained for reading legacy sessions. The quick professional
// session uses the bipolar red-green axis and blue-yellow axis. The remaining
// display-relative axes are available as optional follow-up measurements.
export const DIRECTION_ORDER: ColorDirectionId[] = ['RG', 'C']
export const OPTIONAL_DIRECTION_ORDER: ColorDirectionId[] = ['D', 'E']
export const ALL_DIRECTION_ORDER: ColorDirectionId[] = [...DIRECTION_ORDER, ...OPTIONAL_DIRECTION_ORDER]

export const DIRECTION_LABELS: Record<ColorDirectionId, string> = {
  A: '紅－綠方向',
  B: '綠－紅方向',
  C: '藍－黃方向',
  D: '紫－綠方向',
  E: '青－紅方向',
  RG: '紅－綠雙向軸',
}

export const adaptiveConfig = {
  minDistance: 0.0035,
  maxDistance: 0.075,
  initialDistance: 0.042,
  calibrationStartDistance: 0.055,
  calibrationMaxContrast: 0.075,
  baseStep: 0.012,
  stepFactors: [1, 1, 0.6, 0.6, 0.35],
  minimumTrials: 10,
  maximumTrials: 14,
  targetReversals: 5,
  thresholdCriterion: 0.75,
  anchorCountPerDirection: 2,
} as const

export function stepSizeForReversals(reversalCount: number): number {
  const index = Math.min(reversalCount, adaptiveConfig.stepFactors.length - 1)
  return adaptiveConfig.baseStep * adaptiveConfig.stepFactors[index]
}
