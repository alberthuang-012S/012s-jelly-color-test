import { fitPsychometricCurve, type PsychometricPoint } from './psychometric'
import { adaptiveConfig } from './config'
import type { ColorDirectionId, DirectionThreshold, QuestionResult, StaircaseState } from '../test/types'

function median(values: number[]): number | undefined {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (!sorted.length) return undefined
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function pointsForDirection(questions: QuestionResult[], directionId: ColorDirectionId): PsychometricPoint[] {
  return questions
    .filter(
      (question) =>
        question.directionId === directionId &&
        question.phase === 'adaptive' &&
        Number.isFinite(question.nominalDeltaUv) && (question.nominalDeltaUv ?? 0) > 0,
    )
    .map((question) => ({ distance: question.nominalDeltaUv as number, correct: question.correct }))
}

export function estimateThreshold(
  directionId: ColorDirectionId,
  questions: QuestionResult[],
  staircase?: StaircaseState,
): DirectionThreshold {
  const points = pointsForDirection(questions, directionId)
  const insufficient = staircase?.insufficientCalibration || points.length < adaptiveConfig.minimumTrials
  if (insufficient) return {
    directionId, trialCount: points.length, reversalCount: staircase?.reversals.length ?? 0,
    convergenceQuality: 'low', insufficientCalibration: staircase?.insufficientCalibration ?? false,
  }
  const fit = fitPsychometricCurve(points)
  const minimum = Math.min(...points.map((point) => point.distance))
  const maximum = Math.max(...points.map((point) => point.distance))
  if (fit && fit.converged && Number.isFinite(fit.threshold75) && fit.threshold75 >= minimum && fit.threshold75 <= maximum) {
    return {
      directionId,
      threshold: fit.threshold75,
      thresholdMethod: 'psychometric',
      trialCount: points.length,
      reversalCount: staircase?.reversals.length ?? 0,
      convergenceQuality: staircase?.convergenceQuality ?? 'pending',
      fitQuality: fit.quality,
      insufficientCalibration: staircase?.insufficientCalibration ?? false,
    }
  }

  const reversals = (staircase?.reversals ?? []).filter((distance) => Number.isFinite(distance) && distance >= minimum && distance <= maximum)
  const fallback = reversals.length >= 4 ? median(reversals.slice(-4)) : undefined
  if (fallback !== undefined) {
    return {
      directionId,
      threshold: fallback,
      thresholdMethod: 'reversal-fallback',
      trialCount: points.length,
      reversalCount: staircase?.reversals.length ?? 0,
      convergenceQuality: staircase?.convergenceQuality ?? 'low',
      fitQuality: fit?.quality,
      insufficientCalibration: staircase?.insufficientCalibration ?? false,
    }
  }
  return {
    directionId,
    trialCount: points.length,
    reversalCount: staircase?.reversals.length ?? 0,
    convergenceQuality: 'low',
    fitQuality: fit?.quality,
    insufficientCalibration: staircase?.insufficientCalibration ?? false,
  }
}

export function overallThreshold(thresholds: DirectionThreshold[]): number | undefined {
  const values = thresholds.filter((item) => !item.insufficientCalibration).map((item) => item.threshold).filter((value): value is number => value !== undefined && Number.isFinite(value) && value > 0)
  if (values.length < 2) return undefined
  return median(values)
}

export function thresholdCriterionLabel(): string {
  return `${Math.round(adaptiveConfig.thresholdCriterion * 100)}% predicted correct`
}
