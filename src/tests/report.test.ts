import { describe, expect, it } from 'vitest'
import { canCompareResults, resultPresentation } from '../test/report'
import { buildTestSession, readDeviceInfo } from '../test/session'
import { createEngineState } from '../test/scheduler'
import { question } from './fixtures'
import type { TestSession } from '../test/types'
import { DIRECTION_ORDER } from '../psychophysics/config'

export function reportFixture(): TestSession {
  const session = buildTestSession(createEngineState(1), new Date(0).toISOString(), readDeviceInfo())
  session.id = 'fixture-current'
  session.status = 'complete'
  session.overallDcdt = 0.02
  session.resultQualityIndex = 92
  session.consistencyIndex = 90
  session.questions = Array.from({ length: DIRECTION_ORDER.length * 18 }, (_, index) => question({ id: String(index) }))
  session.metrics.directionalThresholds = DIRECTION_ORDER.map((directionId, index) => ({ directionId, threshold: 0.018 + index * 0.002, thresholdMethod: 'psychometric' as const, trialCount: 18, reversalCount: 7, convergenceQuality: 'high' as const }))
  return session
}

describe('report interpretation', () => {
  it('requires usable data before highlighting a threshold', () => {
    const session = reportFixture()
    expect(resultPresentation(session).qualityLabel).toBe('可供參考')
    for (const change of [{ resultQualityIndex: 59 }, { status: 'partial' as const }, { overallDcdt: NaN }]) {
      expect(resultPresentation({ ...session, ...change }).usable).toBe(false)
    }
    session.metrics.directionalThresholds[0].insufficientCalibration = true
    session.metrics.directionalThresholds.slice(1, 4).forEach((threshold) => { threshold.threshold = undefined })
    expect(resultPresentation(session).qualityLabel).toBe('資料不足')
  })
  it('keeps fallback estimates readable without forcing retesting language', () => {
    const session = reportFixture()
    session.metrics.directionalThresholds[0].thresholdMethod = 'reversal-fallback'
    session.metrics.quality.interruptions = 2
    const view = resultPresentation(session)
    expect(view.tentative).toBe(true)
    expect(view.qualityLabel).toBe('可供參考')
    expect(view.suggestions).toHaveLength(2)
    expect(view.suggestions[0]).toContain('中斷')
    const copy = [view.qualityLabel, view.qualityReason, view.summary, ...view.suggestions].join(' ')
    expect(copy).not.toMatch(/建議重測|不確定性|暫定|可信度|不穩定|有些波動/)
  })
  it('does not report stable answers without enough adaptive observations', () => {
    const session = reportFixture()
    session.questions = []
    expect(resultPresentation(session).stabilityLabel).toBe('資料不足')
  })
  it('compares only eligible different sessions with matching versions and recorded devices', () => {
    const current = reportFixture()
    const previous = { ...reportFixture(), id: 'previous' }
    expect(canCompareResults(current, previous)).toBe(true)
    expect(canCompareResults(current, current)).toBe(false)
    expect(canCompareResults(current, { ...previous, engineVersion: 'old' })).toBe(false)
    expect(canCompareResults(current, { ...previous, resultQualityIndex: 20 })).toBe(false)
    expect(canCompareResults(current, { ...previous, deviceInfo: { ...previous.deviceInfo, viewport: 'other' } })).toBe(false)
  })
})
