import { generatePlate } from '../plate/generator'
import { buildTestSession } from '../test/session'
import { createEngineState, recordTrial, selectNextTrial } from '../test/scheduler'
import { seededRandom } from '../plate/rng'

export interface SimulationConfig {
  threshold: number
  sessions: number
  seed: number
}

export interface SimulationResult {
  configuredThreshold: number
  estimatedMedian: number
  bias: number
  meanAbsoluteError: number
  sessions: number
  validSessions: number
  averageTrialCount: number
  minTrialCount: number
  maxTrialCount: number
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

export function runVirtualObserverSimulation(config: SimulationConfig): SimulationResult {
  const estimates: number[] = []
  const trialCounts: number[] = []
  for (let sessionIndex = 0; sessionIndex < config.sessions; sessionIndex += 1) {
    const random = seededRandom(config.seed + sessionIndex * 131)
    let state = createEngineState(config.seed + sessionIndex * 131)
    let guard = 0
    while (state.status === 'in-progress' && guard < 160) {
      const spec = selectNextTrial(state)
      if (!spec) break
      const plate = generatePlate({
        direction: spec.directionId,
        requestedDistance: spec.requestedDistance,
        number: spec.targetNumber,
        seed: spec.seed,
        phase: spec.phase,
      })
      // Independent open-response observer: P(correct | threshold) = .75, no 50% guessing floor.
      const probability = spec.phase === 'control' ? 0.985 : 1 / (1 + Math.exp(-(Math.log(3) + 4 * Math.log(plate.actualNominalDeltaUv / config.threshold))))
      const correct = random() < probability
      const answer = correct ? spec.targetNumber : null
      state = recordTrial(state, spec, answer, 600 + random() * 900, false, plate)
      guard += 1
    }
    if (state.status !== 'complete') throw new Error('Simulation did not terminate')
    trialCounts.push(state.questions.length)
    const session = buildTestSession(state, new Date(0).toISOString(), {
      viewport: 'simulation',
      devicePixelRatio: 1,
      browser: 'virtual-observer',
      colorDepth: 24,
      prefersColorScheme: 'light',
      colorGamut: 'srgb',
    })
    if (session.overallDcdt !== undefined && session.metrics.directionalThresholds.filter((item) => item.threshold !== undefined).length >= 2) {
      estimates.push(session.overallDcdt)
    }
  }
  const estimatedMedian = estimates.length ? median(estimates) : Number.NaN
  const absoluteErrors = estimates.map((estimate) => Math.abs(estimate - config.threshold))
  const bias = estimates.length ? estimatedMedian - config.threshold : Number.NaN
  return {
    configuredThreshold: config.threshold,
    estimatedMedian,
    bias,
    meanAbsoluteError: absoluteErrors.length ? absoluteErrors.reduce((sum, value) => sum + value, 0) / absoluteErrors.length : Number.NaN,
    sessions: config.sessions,
    validSessions: estimates.length,
    averageTrialCount: trialCounts.length ? trialCounts.reduce((sum, value) => sum + value, 0) / trialCounts.length : Number.NaN,
    minTrialCount: trialCounts.length ? Math.min(...trialCounts) : 0,
    maxTrialCount: trialCounts.length ? Math.max(...trialCounts) : 0,
  }
}

export function runAllSimulationGroups(sessions = 500): SimulationResult[] {
  return [0.01, 0.02, 0.04].map((threshold, index) => runVirtualObserverSimulation({ threshold, sessions, seed: 4200 + index * 100 }))
}
