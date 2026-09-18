export interface TrialClock {
  startedAt: number
}

export function startTrial(now: number): TrialClock {
  if (!Number.isFinite(now)) throw new Error('Invalid trial start time')
  return { startedAt: now }
}

export function responseTimeMs(clock: TrialClock, now: number): number | undefined {
  if (!Number.isFinite(now)) return undefined
  return Math.max(0, now - clock.startedAt)
}
