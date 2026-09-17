import { clamp } from './colorSpace'
import { DIRECTION_ORDER } from './config'
import { fitPsychometricCurve } from './psychometric'
import type { ConsistencyBreakdown, QuestionResult } from '../test/types'

function anchorAgreement(questions: QuestionResult[]): number {
  const grouped = new Map<string, QuestionResult[]>()
  questions
    .filter((question) => question.phase === 'anchor' && question.anchorKey)
    .forEach((question) => {
      const list = grouped.get(question.anchorKey as string) ?? []
      list.push(question)
      grouped.set(question.anchorKey as string, list)
    })
  const pairs = [...grouped.values()].filter((group) => group.length === 2 && group[0].directionId === group[1].directionId && group[0].requestedDistance === group[1].requestedDistance)
  if (!pairs.length) return 50
  return (pairs.reduce((sum, pair) => sum + (pair[0].correct === pair[1].correct ? 100 : 0), 0) / pairs.length)
}

function monotonicity(questions: QuestionResult[]): number {
  const valid = questions
    .filter((question) => question.phase !== 'control' && question.nominalDeltaUv !== undefined)
    .sort((first, second) => (first.nominalDeltaUv as number) - (second.nominalDeltaUv as number))
  let inversions = 0
  let comparablePairs = 0
  for (let firstIndex = 0; firstIndex < valid.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < valid.length; secondIndex += 1) {
      const first = valid[firstIndex]
      const second = valid[secondIndex]
      if (first.directionId !== second.directionId) continue
      if ((second.nominalDeltaUv as number) - (first.nominalDeltaUv as number) < 0.001) continue
      comparablePairs += 1
      if (first.correct && !second.correct) inversions += 1
    }
  }
  if (!comparablePairs) return 50
  const rate = inversions / comparablePairs
  return clamp(1 - Math.max(0, rate - 0.08) / 0.42) * 100
}

function fitQuality(questions: QuestionResult[]): number {
  const points = questions
    .filter((question) => question.phase !== 'control' && question.nominalDeltaUv !== undefined)
    .map((question) => ({ distance: question.nominalDeltaUv as number, correct: question.correct }))
  const fit = fitPsychometricCurve(points)
  if (fit?.converged) return fit.quality
  return 0
}

export function calculateConsistencyIndex(questions: QuestionResult[]): ConsistencyBreakdown {
  const anchor = anchorAgreement(questions)
  const mono = monotonicity(questions)
  const fit = DIRECTION_ORDER.reduce((sum, direction) => sum + fitQuality(questions.filter((question) => question.directionId === direction && question.phase === 'adaptive')), 0) / DIRECTION_ORDER.length
  const score = Math.round(anchor * 0.4 + mono * 0.3 + fit * 0.3)
  return {
    score: clamp(score, 0, 100),
    anchorAgreement: Math.round(anchor),
    monotonicity: Math.round(mono),
    fitQuality: Math.round(fit),
  }
}

export function consistencyLabel(score: number): 'High Consistency' | 'Moderate Consistency' | 'Low Consistency' {
  if (score >= 85) return 'High Consistency'
  if (score >= 65) return 'Moderate Consistency'
  return 'Low Consistency'
}
