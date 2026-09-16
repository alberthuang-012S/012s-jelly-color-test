import { canCompareResults, hasThreshold, resultPresentation } from './report'
import type { TestSession } from './types'

function reportDate(session: TestSession): number {
  const time = Date.parse(session.startedAt)
  return Number.isFinite(time) ? time : 0
}

function hasUsableDcdt(session: TestSession): boolean {
  return resultPresentation(session).usable && Number.isFinite(session.overallDcdt) && (session.overallDcdt ?? 0) > 0
}

export function comparableSessions(current: TestSession, sessions: TestSession[]): TestSession[] {
  const currentTime = reportDate(current)
  return sessions
    .filter((session) => session.id !== current.id && reportDate(session) < currentTime && canCompareResults(current, session))
    .sort((first, second) => reportDate(second) - reportDate(first))
}

export function latestComparablePrevious(current: TestSession, sessions: TestSession[]): TestSession | undefined {
  return comparableSessions(current, sessions)[0]
}

export interface HistoryTrend {
  reference?: TestSession
  sessions: TestSession[]
  median?: number
}

function median(values: number[]): number | undefined {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b)
  if (!sorted.length) return undefined
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

/** Trend is anchored to the newest usable result, so every point shares its comparison rules. */
export function buildHistoryTrend(sessions: TestSession[]): HistoryTrend {
  const reference = sessions
    .filter(hasUsableDcdt)
    .sort((first, second) => reportDate(second) - reportDate(first))[0]
  if (!reference) return { sessions: [] }
  const comparable = [reference, ...comparableSessions(reference, sessions)].sort((first, second) => reportDate(first) - reportDate(second))
  return { reference, sessions: comparable, median: median(comparable.map((session) => session.overallDcdt as number)) }
}

export function selectHistorySession(sessions: TestSession[], id: string): TestSession | undefined {
  return sessions.find((session) => session.id === id)
}

export function thresholdCount(session: TestSession): number {
  return (session.metrics?.directionalThresholds ?? session.directionalThresholds ?? []).filter(hasThreshold).length
}
