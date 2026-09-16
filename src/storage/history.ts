import type { TestSession } from '../test/types'

const HISTORY_KEY = 'jelly-color-test.sessions.v1'

export function readHistory(): TestSession[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as TestSession[]
    return Array.isArray(parsed) ? parsed.slice(0, 20) : []
  } catch {
    return []
  }
}

export function saveSession(session: TestSession): TestSession[] {
  const next = [session, ...readHistory()].slice(0, 20)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  return next
}

export function usableHistory(sessions: TestSession[]): TestSession[] {
  return sessions.filter((session) => session.resultQualityIndex >= 60)
}
