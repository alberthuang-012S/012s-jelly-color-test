import { DIRECTION_ORDER, DIRECTION_LABELS } from './config'
import { calculateConsistencyIndex } from './consistency'
import { fitPsychometricCurve } from './psychometric'
import { calculateResultQualityIndex } from './quality'
import { estimateThreshold, overallThreshold } from './threshold'
import type {
  DifficultyCurve,
  DirectionThreshold,
  TestEngineState,
  QuestionResult,
  SessionMetrics,
} from '../test/types'

function calculateAccuracy(questions: QuestionResult[]): number {
  const valid = questions.filter((question) => question.phase !== 'control')
  if (!valid.length) return 0
  return Math.round((valid.filter((question) => question.correct).length / valid.length) * 1000) / 10
}

function directionAccuracy(questions: QuestionResult[], directionId: string): number {
  const valid = questions.filter((question) => question.directionId === directionId && question.phase !== 'control')
  if (!valid.length) return 0
  return Math.round((valid.filter((question) => question.correct).length / valid.length) * 1000) / 10
}

function contrastBands(questions: QuestionResult[]): DifficultyCurve['bands'] {
  const valid = questions
    .filter((question) => question.phase !== 'control' && question.nominalDeltaUv !== undefined)
    .map((question) => question.nominalDeltaUv as number)
  if (!valid.length) return []
  const sorted = [...valid].sort((a, b) => a - b)
  const bounds = [sorted[0], sorted[Math.floor(sorted.length * 0.25)], sorted[Math.floor(sorted.length * 0.5)], sorted[Math.floor(sorted.length * 0.75)], sorted[sorted.length - 1]]
  const labels = ['Very Low Contrast', 'Low Contrast', 'Medium Contrast', 'High Contrast'] as const
  return labels.map((label, index) => {
    const min = bounds[index]
    const max = index === labels.length - 1 ? bounds[index + 1] + 1e-9 : bounds[index + 1]
    const items = questions.filter(
      (question) =>
        question.phase !== 'control' &&
        question.nominalDeltaUv !== undefined &&
        (question.nominalDeltaUv as number) >= min &&
        (question.nominalDeltaUv as number) < max,
    )
    return {
      label,
      min,
      max,
      count: items.length,
      accuracy: items.length ? Math.round((items.filter((item) => item.correct).length / items.length) * 1000) / 10 : 0,
    }
  })
}

function buildDifficultyCurve(questions: QuestionResult[]): DifficultyCurve {
  const valid = questions.filter((question) => question.phase !== 'control' && question.nominalDeltaUv !== undefined)
  const grouped = new Map<string, { distance: number; correct: number; count: number }>()
  valid.forEach((question) => {
    const distance = question.nominalDeltaUv as number
    const key = distance.toFixed(4)
    const current = grouped.get(key) ?? { distance, correct: 0, count: 0 }
    current.count += 1
    if (question.correct) current.correct += 1
    grouped.set(key, current)
  })
  const observed = [...grouped.values()]
    .sort((a, b) => a.distance - b.distance)
    .map((point) => ({ distance: point.distance, probability: point.correct / point.count, count: point.count }))
  // A pooled curve is descriptive only: fit each direction separately, then
  // average probabilities. Do not infer an overall 75% threshold from pooling.
  const fits = DIRECTION_ORDER.map((direction) => fitPsychometricCurve(valid.filter((question) => question.phase === 'adaptive' && question.directionId === direction).map((question) => ({ distance: question.nominalDeltaUv as number, correct: question.correct })))).filter((fit) => fit?.converged)
  const min = Math.min(...valid.map((question) => question.nominalDeltaUv as number), 0.004)
  const max = Math.max(...valid.map((question) => question.nominalDeltaUv as number), 0.06)
  const curve = fits.length === 3
    ? Array.from({ length: 32 }, (_, index) => {
        const distance = min + ((max - min) * index) / 31
        return { distance, probability: fits.reduce((sum, fit) => sum + fit!.predict(distance), 0) / fits.length }
      })
    : []
  return { observed, fitted: curve, bands: contrastBands(questions) }
}

export function calculateAllMetrics(engine: TestEngineState): SessionMetrics {
  const directionalThresholds: DirectionThreshold[] = DIRECTION_ORDER.map((directionId) =>
    estimateThreshold(directionId, engine.questions, engine.tracks[directionId]),
  ).map((threshold) => ({ ...threshold, label: DIRECTION_LABELS[threshold.directionId] }))
  const overallDcdt = overallThreshold(directionalThresholds)
  const consistency = calculateConsistencyIndex(engine.questions)
  const quality = calculateResultQualityIndex(engine.questions, consistency.score, engine)
  return {
    directionalThresholds,
    overallDcdt,
    chromaticAccuracy: calculateAccuracy(engine.questions),
    directionAccuracy: {
      A: directionAccuracy(engine.questions, 'A'),
      B: directionAccuracy(engine.questions, 'B'),
      C: directionAccuracy(engine.questions, 'C'),
    },
    consistency,
    quality,
    difficultyCurve: buildDifficultyCurve(engine.questions),
  }
}
