# Jelly Color Test measurement-engine audit

## Run metadata

- Date: 2026-09-17 (Asia/Taipei)
- Engine version: `uv5-expanded-directions`
- Git SHA under audit: `f7733cd` (full revision is recorded in Git)
- Scope: current production `buildTestSession()` engine and current `generatePlate()` generator
- Result: **PASS — engineering regression gates**

This file describes the current `uv5-expanded-directions` engine. Earlier engine numbers are not carried forward as current-engine evidence.

## Commands

```bash
npm run typecheck
npm test
npm run audit
npm run build
```

The audit command was run from the SHA above with:

```bash
npm run audit
```

The full verification run also passed: TypeScript type check, 14 test files / 55 tests, and the production Vite build.

## Plate validation

The matrix contains 5 color directions × 100 target numbers (0–99) × 10 evenly spaced requested distances × 3 deterministic seed families = **15,000 cases**. Distances include the configured `0.0035` minimum, `0.075` maximum, and eight intermediate values. Each successful case was generated twice and compared as a deterministic seeded plate.

| Check | Result |
| --- | ---: |
| Generation success | 15,000 / 15,000 (100%) |
| `productionValid` | 15,000 / 15,000 (100%) |
| Coverage failures | 0 |
| Figure/background separation failures | 0 |
| Out-of-gamut / invalid RGB failures | 0 |
| Unexpected regeneration | 0 |
| Target/direction/seed substitution failures | 0 |
| Unsupported target `100` accepted | 0 |
| Reproducibility failures | 0 |

`generatePlate()` fails closed when a target is outside 0–99 or when production validation fails. The audit does not treat a regenerated or substituted plate as a successful fallback.

## Virtual-observer regression

Each group contains 500 deterministic sessions. The observer uses the existing open-response simulation philosophy: logistic probability in log nominal distance, slope 4, 75% correct at the configured threshold, and no 50% guessing floor. “Usable” is the existing result-eligibility concept: at least two finite direction estimates, complete data, and RQI ≥ 60. Convergence is reported separately; reaching the 18-trial ceiling remains low convergence and is not reclassified as convergence.

| Configured threshold | Usable rate | Median estimate | Bias | MAE | Mean trials | Median trials | Min–max trials | Convergence | Low convergence | Psychometric fit | Reversal fallback | Failed calibration |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0.010 | 500/500 (100%) | 0.009852 | -0.000148 | 0.001024 | 106.848 | 107 | 104–108 | 0/500 (0%) | 500/500 (100%) | 75.27% | 24.73% | 0/500 (0%) |
| 0.020 | 500/500 (100%) | 0.020068 | +0.000068 | 0.001561 | 106.462 | 107 | 102–108 | 0/500 (0%) | 500/500 (100%) | 88.92% | 11.08% | 0/500 (0%) |
| 0.040 | 500/500 (100%) | 0.038872 | -0.001128 | 0.002357 | 105.374 | 106 | 96–110 | 1/500 (0.2%) | 499/500 (99.8%) | 94.95% | 5.05% | 0/500 (0%) |

Directional estimate counts were 2,499, 2,499 and 2,497 in the three groups. Fit/fallback percentages are usage across those estimates. Existing audit gates were retained: usable estimate rate ≥ 90%, absolute median bias ≤ 25% of configured threshold, MAE ≤ 35%, and maximum session length ≤ 117 trials. The audit additionally requires the five-direction plate matrix to complete with zero validation, substitution, regeneration, gamut, and reproducibility failures. All gates passed.

## What was not changed

This revision keeps the staircase mathematics, 75% criterion, adaptive minimum/maximum distances, color space, palette validation, and dCDT/CA/CI/RQI formulas. It adds two display-relative color axes (purple–green and cyan–red), expands calibration, interleaving, anchors and per-direction metrics to five directions, and bumps the engine version so earlier three-direction results remain readable but are not compared with the new engine.

## Limitations

- dCDT is a display-relative nominal `Δu′v′` estimate, not an instrument-measured panel output.
- The environment checklist records user confirmation only; lighting and physical monitor calibration are not measured automatically.
- No clinical validation, population norm, percentile, diagnosis, or normal/abnormal range is established.
- Virtual observers cover one response model and do not establish real-user accuracy, lapse/guess behavior, device equivalence, confidence intervals, or empirical repeatability.
- The current 18-trial stopping rule produces a high low-convergence rate in this simulation. That is reported honestly; low convergence is not silently promoted to a convergence claim, and the existing audit gates were not weakened to hide it.
- A/B are opposite color polarities; C/D/E are display-relative supplemental directions rather than clinical confusion axes.
- The audit is a software regression check, not evidence that the measurement is clinically valid.
