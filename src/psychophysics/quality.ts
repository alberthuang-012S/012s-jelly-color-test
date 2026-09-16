import { clamp } from './colorSpace'
import { consistencyLabel } from './consistency'
import type { QualityBreakdown, QuestionResult, TestEngineState } from '../test/types'

export function timingFlagFor(responseTimeMs: number, focusInterrupted: boolean): string | undefined {
  const flags: string[] = []
  if (responseTimeMs < 250) flags.push('extreme-fast')
  if (responseTimeMs > 30_000) flags.push('extreme-slow')
  if (focusInterrupted) flags.push('focus-interrupted')
  return flags.length ? flags.join(',') : undefined
}

function timingQuality(questions: QuestionResult[]): number {
  const nonControl = questions.filter((question) => question.phase !== 'control')
  if (!nonControl.length) return 0
  const fast = nonControl.filter((question) => question.responseTimeMs < 250).length
  const slow = nonControl.filter((question) => question.responseTimeMs > 30_000).length
  const interrupted = nonControl.filter((question) => question.focusInterrupted).length
  const penalty = fast + slow + interrupted * 1.5
  return clamp(1 - penalty / nonControl.length) * 100
}

function completionQuality(engine: TestEngineState): number {
  if (engine.status === 'complete') {
    const failed = Object.values(engine.calibrationFailed).filter(Boolean).length
    return clamp(1 - failed * 0.2) * 100
  }
  if (engine.questions.length < 10) return 20
  return 55
}

export function calculateResultQualityIndex(
  questions: QuestionResult[],
  consistencyIndex: number,
  engine: TestEngineState,
): QualityBreakdown {
  const control = questions.filter((question) => question.phase === 'control')
  const controlQuality = (control.filter((question) => question.correct).length / 2) * 100
  const time = timingQuality(questions)
  const completion = completionQuality(engine)
  const score = Math.round(controlQuality * 0.3 + consistencyIndex * 0.3 + time * 0.2 + completion * 0.2)
  const classification = score >= 90 ? 'HIGH' : score >= 75 ? 'GOOD' : score >= 60 ? 'MODERATE' : 'LOW'
  return {
    score: clamp(score, 0, 100),
    classification,
    controlQuality: Math.round(controlQuality),
    consistencyQuality: Math.round(consistencyIndex),
    timingQuality: Math.round(time),
    completionQuality: Math.round(completion),
    interruptions: questions.filter((question) => question.focusInterrupted).length,
    extremeFastCount: questions.filter((question) => question.responseTimeMs < 250).length,
    extremeSlowCount: questions.filter((question) => question.responseTimeMs > 30_000).length,
    reasons: [
      controlQuality < 100 ? 'Control 題未完全通過' : undefined,
      consistencyIndex < 65 ? `${consistencyLabel(consistencyIndex)}：回答模式較不穩定` : undefined,
      questions.some((question) => question.focusInterrupted) ? '有題目期間曾中斷畫面' : undefined,
      completion < 100 ? '部分 adaptive track 未達完整品質' : undefined,
    ].filter((reason): reason is string => Boolean(reason)),
  }
}
