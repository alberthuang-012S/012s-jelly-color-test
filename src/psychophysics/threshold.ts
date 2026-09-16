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
        (question.phase === 'adaptive' || question.phase === 'anchor') &&
        question.nominalDeltaUv !== undefined,
    )
    .map((question) => ({ distance: question.nominalDeltaUv as number, correct: question.correct }))
}

export function estimateThreshold(
  directionId: ColorDirectionId,
  questions: QuestionResult[],
  staircase?: StaircaseState,
): DirectionThreshold {
  const directionQuestions = questions.filter((question) => question.directionId === directionId)
  const points = pointsForDirection(questions, directionId)
  const fit = fitPsychometricCurve(points)
  if (fit && fit.converged && Number.isFinite(fit.threshold75)) {
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

  const fallback = median((staircase?.reversals ?? []).slice(-4))
  if (fallback !== undefined && directionQuestions.length >= 4) {
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
  const values = thresholds.map((item) => item.threshold).filter((value): value is number => value !== undefined)
  if (values.length < 2) return undefined
  return median(values)
}

export function thresholdCriterionLabel(): string {
  return `${Math.round(adaptiveConfig.thresholdCriterion * 100)}% predicted correct`
}
