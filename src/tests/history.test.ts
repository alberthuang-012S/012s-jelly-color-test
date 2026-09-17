// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { buildHistoryTrend, latestComparablePrevious, selectHistorySession } from '../test/history'
import { HISTORY_KEY, readHistory, saveSession } from '../storage/history'
import { buildTestSession } from '../test/session'
import { createEngineState } from '../test/scheduler'
import { question } from './fixtures'
import type { TestSession } from '../test/types'
import { DIRECTION_ORDER } from '../psychophysics/config'

const device = {
  viewport: '1280×800',
  devicePixelRatio: 1,
  browser: 'test-browser',
  colorDepth: 24,
  prefersColorScheme: 'light',
  colorGamut: 'srgb',
}

function makeSession(id: string, date: string, changes: Partial<TestSession> = {}): TestSession {
  const session = buildTestSession(createEngineState(10), date, device)
  session.id = id
  session.status = 'complete'
  session.overallDcdt = 0.02
  session.resultQualityIndex = 90
  session.consistencyIndex = 88
  session.questions = Array.from({ length: 12 }, (_, index) => question({ id: `${id}-${index}` }))
  session.metrics.directionalThresholds = DIRECTION_ORDER.map((directionId, index) => ({
    directionId,
    threshold: 0.018 + index * 0.002,
    thresholdMethod: 'psychometric' as const,
    trialCount: 12,
    reversalCount: 7,
    convergenceQuality: 'high' as const,
  }))
  return { ...session, ...changes }
}

describe('history comparison and trend selection', () => {
  it('selects the latest truly comparable earlier session, skipping a newer incompatible one', () => {
    const current = makeSession('current', '2026-09-10T10:00:00.000Z')
    const incompatibleNewer = makeSession('incompatible', '2026-09-09T10:00:00.000Z', { engineVersion: 'old-engine' })
    const compatibleOlder = makeSession('older', '2026-09-01T10:00:00.000Z')
    expect(latestComparablePrevious(current, [incompatibleNewer, compatibleOlder])).toBe(compatibleOlder)
  })

  it('keeps only compatible usable sessions in the trend and opens the requested card', () => {
    const newest = makeSession('newest', '2026-09-10T10:00:00.000Z')
    const older = makeSession('older', '2026-09-01T10:00:00.000Z', { overallDcdt: 0.021 })
    const wrongEngine = makeSession('wrong-engine', '2026-09-05T10:00:00.000Z', { engineVersion: 'old-engine' })
    const lowQuality = makeSession('low-quality', '2026-09-04T10:00:00.000Z', { resultQualityIndex: 40, status: 'low-quality' })
    const trend = buildHistoryTrend([newest, older, wrongEngine, lowQuality])
    expect(trend.reference).toBe(newest)
    expect(trend.sessions.map((session) => session.id)).toEqual(['older', 'newest'])
    expect(selectHistorySession([newest, older], 'older')).toBe(older)
  })

  it('keeps supplemental direction records out of the core dCDT trend', () => {
    const core = makeSession('core', '2026-09-10T10:00:00.000Z')
    const supplemental = makeSession('supplemental', '2026-09-09T10:00:00.000Z', { testMode: 'supplemental' })
    expect(buildHistoryTrend([supplemental, core]).sessions.map((session) => session.id)).toEqual(['core'])
    expect(latestComparablePrevious(supplemental, [core])).toBeUndefined()
  })

  it('replaces a saved session with the same id instead of creating a duplicate', () => {
    localStorage.clear()
    const first = makeSession('same-id', '2026-09-10T10:00:00.000Z')
    saveSession(first)
    saveSession({ ...first, overallDcdt: 0.019 })
    expect(readHistory()).toHaveLength(1)
    expect(JSON.parse(localStorage.getItem(HISTORY_KEY)!).at(0).overallDcdt).toBe(0.019)
  })

  it('migrates a readable legacy array into the versioned history key', () => {
    localStorage.clear()
    const legacy = makeSession('legacy', '2026-08-01T10:00:00.000Z')
    localStorage.setItem('jelly-color-test.sessions.v1', JSON.stringify([legacy]))
    expect(readHistory().map((session) => session.id)).toEqual(['legacy'])
    expect(localStorage.getItem(HISTORY_KEY)).toContain('legacy')
  })
})
