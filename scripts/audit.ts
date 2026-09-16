import { generatePlate } from '../src/plate/generator'
import { runAllSimulationGroups } from '../src/tests/simulation'

let rejected = 0
let regenerated = 0
const started = Date.now()
for (let index = 0; index < 3000; index += 1) {
  const plate = generatePlate({
    direction: (['A', 'B', 'C'] as const)[index % 3],
    requestedDistance: 0.0035 + (Math.floor(index / 300) % 10) * (0.075 - 0.0035) / 9,
    number: Math.floor(index / 3) % 100,
    seed: 1000 + index,
    phase: 'adaptive',
  })
  if (!plate.validation.productionValid) rejected += 1
  if (plate.regenerated) regenerated += 1
}
const plateElapsedMs = Date.now() - started
const simulation = runAllSimulationGroups(500)
console.log(JSON.stringify({
  plateStress: { generated: 3000, rejected, regenerated, productionInvalid: rejected, elapsedMs: plateElapsedMs },
  simulation,
}, null, 2))
// Engineering regression gates, not clinical validity or normative claims.
if (rejected || simulation.some((group) => !Number.isFinite(group.meanAbsoluteError) || group.validSessions / group.sessions < 0.9 || Math.abs(group.bias) > group.configuredThreshold * 0.25 || group.meanAbsoluteError > group.configuredThreshold * 0.35 || group.maxTrialCount > 71)) {
  throw new Error('Measurement regression audit failed')
}
