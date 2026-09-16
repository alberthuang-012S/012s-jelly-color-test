import { clamp } from './colorSpace'
import { consistencyLabel } from './consistency'
import { adaptiveConfig, DIRECTION_ORDER } from './config'
import { estimateThreshold } from './threshold'
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
  return DIRECTION_ORDER.reduce((sum, direction) => {
    const track = engine.tracks[direction]
    if (!engine.calibrationComplete[direction] || engine.calibrationFailed[direction]) return sum
    const threshold = estimateThreshold(direction, engine.questions, track)
    const coverage = Math.min(1, track.trialCount / adaptiveConfig.minimumTrials)
    const reversals = Math.min(1, track.reversals.length / adaptiveConfig.targetReversals)
    const anchors = engine.anchorSlots.filter((slot) => slot.directionId === direction && slot.answered).length / 2
    return sum + coverage * 25 + reversals * 25 + (threshold.threshold !== undefined ? 40 : 0) + anchors * 10
  }, 0) / 3
}

export function calculateResultQualityIndex(
  questions: QuestionResult[],
  consistencyIndex: number,
  engine: TestEngineState,
): QualityBreakdown {
  const control = questions.filter((question) => question.phase === 'control')
  const controlQuality = Math.min(1, control.filter((question) => question.correct).length / 2) * 100
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
      consistencyIndex < 65 ? `${consistencyLabel(consistencyIndex)}：回答模式差異較大` : undefined,
      questions.some((question) => question.focusInterrupted) ? '有題目期間曾中斷畫面' : undefined,
      completion < 100 ? '部分 adaptive track 未達完整品質' : undefined,
    ].filter((reason): reason is string => Boolean(reason)),
  }
}
