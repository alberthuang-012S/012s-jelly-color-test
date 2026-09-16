import { generatePlate } from '../src/plate/generator'
import { runAllSimulationGroups } from '../src/tests/simulation'

let rejected = 0
const started = Date.now()
for (let index = 0; index < 3000; index += 1) {
  const plate = generatePlate({
    direction: (['A', 'B', 'C'] as const)[index % 3],
    requestedDistance: 0.006 + (index % 15) * 0.0045,
    number: [6, 12, 29, 45, 74][index % 5],
    seed: 1000 + index,
    phase: 'adaptive',
  })
  if (!plate.validation.productionValid) rejected += 1
}
console.log(JSON.stringify({
  plateStress: { generated: 3000, rejected, productionInvalid: rejected, elapsedMs: Date.now() - started },
  simulation: runAllSimulationGroups(500),
}, null, 2))
