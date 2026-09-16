export const environmentChecks = [
  'night-mode',
  'reflection',
  'viewing-angle',
  'brightness',
] as const

export type EnvironmentCheckId = typeof environmentChecks[number]
export type EnvironmentCheckState = Record<EnvironmentCheckId, boolean>

export function allEnvironmentChecksConfirmed(state: EnvironmentCheckState): boolean {
  return environmentChecks.every((id) => state[id] === true)
}
