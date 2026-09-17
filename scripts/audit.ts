import { adaptiveConfig, DIRECTION_ORDER } from '../src/psychophysics/config'
import { generatePlate } from '../src/plate/generator'
import { runAllSimulationGroups } from '../src/tests/simulation'
import { createEngineState, questionCountEstimate } from '../src/test/scheduler'

const directions = [...DIRECTION_ORDER]
const targetNumbers = Array.from({ length: 100 }, (_, number) => number)
const distances = Array.from({ length: 10 }, (_, index) => adaptiveConfig.minDistance + index * (adaptiveConfig.maxDistance - adaptiveConfig.minDistance) / 9)
const seeds = [1000, 2000, 3000]
const totalCases = directions.length * targetNumbers.length * distances.length * seeds.length
const maximumQuestionCount = questionCountEstimate(createEngineState(1)).maximumTotal
const started = Date.now()
let successful = 0
let productionInvalid = 0
let coverageFailures = 0
let separationFailures = 0
let gamutFailures = 0
let regenerated = 0
let substitutionFailures = 0
let reproducibilityFailures = 0
let generationFailures = 0

for (const direction of directions) {
  for (const number of targetNumbers) {
    for (const requestedDistance of distances) {
      for (const seedBase of seeds) {
        const seed = seedBase + number * 101 + Math.round(requestedDistance * 1_000_000) + direction.charCodeAt(0)
        const request = { direction, requestedDistance, number, seed, phase: 'adaptive' as const }
        try {
          const plate = generatePlate(request)
          const repeat = generatePlate(request)
          successful += 1
          if (!plate.validation.productionValid) productionInvalid += 1
          if (!plate.validation.maskCoverage || !plate.validation.dotCount || !plate.validation.figureBackgroundDensity) coverageFailures += 1
          if (!plate.validation.nominalChromaticDistance || !plate.validation.meanLuminanceDifference || !plate.validation.luminanceDistributionOverlap) separationFailures += 1
          if (!plate.validation.noInvalidRgbClipping) gamutFailures += 1
          if (plate.regenerated) regenerated += 1
          if (plate.targetNumber !== number || plate.directionId !== direction || plate.seed !== seed || plate.requestedDistance !== requestedDistance) substitutionFailures += 1
          if (JSON.stringify(plate) !== JSON.stringify(repeat)) reproducibilityFailures += 1
        } catch {
          generationFailures += 1
        }
      }
    }
  }
}

let unsupportedTargetAccepted = 0
try {
  generatePlate({ direction: 'A', requestedDistance: adaptiveConfig.initialDistance, number: 100, seed: 777, phase: 'adaptive' })
  unsupportedTargetAccepted += 1
} catch {
  // Unsupported targets must fail explicitly; they must not be substituted.
}

const plateElapsedMs = Date.now() - started
const simulation = runAllSimulationGroups(500)
console.log(JSON.stringify({
  engine: 'uv6-bipolar-red-green',
  plateValidation: {
    cases: totalCases,
    successful,
    generationFailures,
    productionValid: successful - productionInvalid,
    productionInvalid,
    coverageFailures,
    separationFailures,
    gamutFailures,
    regenerated,
    substitutionFailures,
    unsupportedTargetAccepted,
    reproducibilityFailures,
    coverage: {
      directions: directions.length,
      targets: '0–99',
      distances: distances.map((distance) => Number(distance.toFixed(6))),
      seeds: seeds.length,
    },
    elapsedMs: plateElapsedMs,
  },
  virtualObservers: simulation,
}, null, 2))

// Engineering regression gates, not clinical validity or normative claims.
const simulationFailed = simulation.some((group) => !Number.isFinite(group.meanAbsoluteError)
  || group.validSessions / group.sessions < 0.9
  || group.usableRate < 0.9
  || Math.abs(group.bias) > group.configuredThreshold * 0.25
  || group.meanAbsoluteError > group.configuredThreshold * 0.35
  || group.maxTrialCount > maximumQuestionCount)
if (successful !== totalCases || generationFailures || productionInvalid || coverageFailures || separationFailures || gamutFailures
  || regenerated || substitutionFailures || unsupportedTargetAccepted || reproducibilityFailures || simulationFailed) {
  throw new Error('Measurement regression audit failed')
}
