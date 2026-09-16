import { describe, expect, it } from 'vitest'
import { allEnvironmentChecksConfirmed, environmentChecks } from '../test/environment'

describe('environment confirmation', () => {
  it('requires every user-facing condition before starting', () => {
    const empty = Object.fromEntries(environmentChecks.map((id) => [id, false])) as Record<typeof environmentChecks[number], boolean>
    expect(allEnvironmentChecksConfirmed(empty)).toBe(false)
    const confirmed = { ...empty, ...Object.fromEntries(environmentChecks.map((id) => [id, true])) }
    expect(allEnvironmentChecksConfirmed(confirmed)).toBe(true)
  })
})
