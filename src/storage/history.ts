import type { TestSession } from '../test/types'
import { resultPresentation } from '../test/report'

export const HISTORY_KEY = 'jelly-color-test.sessions.v2'
const LEGACY_HISTORY_KEY = 'jelly-color-test.sessions.v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeSession(value: unknown): TestSession | undefined {
  if (!isRecord(value) || typeof value.id !== 'string' || !Array.isArray(value.questions)) return undefined
  const metrics = isRecord(value.metrics) ? value.metrics : undefined
  const quality = metrics && isRecord(metrics.quality) ? metrics.quality : undefined
  const rawQuality = typeof value.resultQualityIndex === 'number' ? value.resultQualityIndex : typeof quality?.score === 'number' ? quality.score : 0
  const rawQuestions = value.questions as TestSession['questions']
  const directionals = Array.isArray(value.directionalThresholds) ? value.directionalThresholds : metrics && Array.isArray(metrics.directionalThresholds) ? metrics.directionalThresholds : []
  const normalized = {
    ...value,
    testMode: value.testMode === 'supplemental' ? 'supplemental' : 'core',
    questions: rawQuestions,
    directionalThresholds: directionals,
    resultQualityIndex: rawQuality,
  } as TestSession
  return normalized
}

export function readHistory(): TestSession[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY) ?? localStorage.getItem(LEGACY_HISTORY_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as unknown
    if (!Array.isArray(parsed)) return []
    const seen = new Set<string>()
    const sessions = parsed.map(normalizeSession).filter((session): session is TestSession => {
      if (!session || seen.has(session.id)) return false
      seen.add(session.id)
      return true
    }).slice(0, 20)
    if (!localStorage.getItem(HISTORY_KEY) && sessions.length) {
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions)) } catch { /* keep the readable in-memory history */ }
    }
    return sessions
  } catch {
    return []
  }
}

export function saveSession(session: TestSession): TestSession[] {
  const next = [session, ...readHistory().filter((item) => item.id !== session.id)].slice(0, 20)
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)) } catch { return next }
  return next
}

export function usableHistory(sessions: TestSession[]): TestSession[] {
  return sessions.filter((session) => resultPresentation(session).usable)
}
