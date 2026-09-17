import type { ColorDirectionId } from '../test/types'

export const DIRECTION_ORDER: ColorDirectionId[] = ['A', 'B', 'C', 'D', 'E']

export const DIRECTION_LABELS: Record<ColorDirectionId, string> = {
  A: '紅－綠方向',
  B: '綠－紅方向',
  C: '藍－黃方向',
  D: '紫－綠方向',
  E: '青－紅方向',
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
  maximumTrials: 18,
  targetReversals: 7,
  thresholdCriterion: 0.75,
  anchorCountPerDirection: 2,
} as const

export function stepSizeForReversals(reversalCount: number): number {
  const index = Math.min(reversalCount, adaptiveConfig.stepFactors.length - 1)
  return adaptiveConfig.baseStep * adaptiveConfig.stepFactors[index]
}
