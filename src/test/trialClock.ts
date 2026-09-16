export interface TrialClock {
  startedAt: number
  paused: boolean
}

export function startTrial(now: number): TrialClock {
  if (!Number.isFinite(now)) throw new Error('Invalid trial start time')
  return { startedAt: now, paused: false }
}

export function pauseTrial(clock: TrialClock): TrialClock {
  return { ...clock, paused: true }
}

/** Resuming intentionally starts the same trial's response window again. */
export function resumeTrial(clock: TrialClock, now: number): TrialClock {
  if (!Number.isFinite(now)) throw new Error('Invalid trial resume time')
  return { startedAt: now, paused: false }
}

export function responseTimeMs(clock: TrialClock, now: number): number | undefined {
  if (clock.paused || !Number.isFinite(now)) return undefined
  return Math.max(0, now - clock.startedAt)
}

export function canSubmitTrial(paused: boolean, locked = false): boolean {
  return !paused && !locked
}
