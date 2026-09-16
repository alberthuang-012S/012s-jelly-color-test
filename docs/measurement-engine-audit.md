# Jelly Color Test measurement-engine audit

## Run metadata

- Date: 2026-09-16 (Asia/Taipei)
- Engine version: `uv4-proportional-targets`
- Git SHA under audit: `3061ffefd6a94295b0374d729f8b5941320de3fd`
- Scope: current production `buildTestSession()` engine and current `generatePlate()` generator
- Result: **PASS — engineering regression gates**

This file describes the current `uv4-proportional-targets` engine. Earlier `uv2-open-response` numbers are not carried forward as current-engine evidence.

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

The full verification run also passed: TypeScript type check, 13 test files / 51 tests, and the production Vite build.

## Plate validation

The matrix contains 3 color directions × 100 target numbers (0–99) × 10 evenly spaced requested distances × 3 deterministic seed families = **9,000 cases**. Distances include the configured `0.0035` minimum, `0.075` maximum, and eight intermediate values. Each successful case was generated twice and compared as a deterministic seeded plate.

| Check | Result |
| --- | ---: |
| Generation success | 9,000 / 9,000 (100%) |
| `productionValid` | 9,000 / 9,000 (100%) |
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
| 0.010 | 500/500 (100%) | 0.009963 | -0.000037 | 0.001269 | 64.932 | 65 | 63–65 | 1/500 (0.2%) | 499/500 (99.8%) | 76.32% | 23.68% | 0/500 (0%) |
| 0.020 | 500/500 (100%) | 0.020100 | +0.000100 | 0.001970 | 64.708 | 65 | 60–66 | 1/500 (0.2%) | 499/500 (99.8%) | 89.53% | 10.47% | 0/500 (0%) |
| 0.040 | 500/500 (100%) | 0.039253 | -0.000747 | 0.002893 | 63.944 | 65 | 56–68 | 14/500 (2.8%) | 486/500 (97.2%) | 94.33% | 5.67% | 0/500 (0%) |

Directional estimate counts were 1,499 in each group. Fit/fallback percentages are usage across those estimates. Existing audit gates were retained: usable estimate rate ≥ 90%, absolute median bias ≤ 25% of configured threshold, MAE ≤ 35%, and maximum session length ≤ 71 trials. The audit additionally requires the new plate matrix to complete with zero validation, substitution, regeneration, gamut, and reproducibility failures. All gates passed.

## What was not changed

The Phase 2A work did not change staircase mathematics, the 75% criterion, adaptive minimum/maximum distances, color space, palette validation, or the dCDT/CA/CI/RQI calculation model. It added audit coverage and reporting around the existing engine, plus presentation, pause timing, history, and storage changes.

## Limitations

- dCDT is a display-relative nominal `Δu′v′` estimate, not an instrument-measured panel output.
- The environment checklist records user confirmation only; lighting and physical monitor calibration are not measured automatically.
- No clinical validation, population norm, percentile, diagnosis, or normal/abnormal range is established.
- Virtual observers cover one response model and do not establish real-user accuracy, lapse/guess behavior, device equivalence, confidence intervals, or empirical repeatability.
- The current 18-trial stopping rule produces a high low-convergence rate in this simulation. That is reported honestly; low convergence is not silently promoted to a convergence claim, and the existing audit gates were not weakened to hide it.
- A/B are opposite color polarities rather than independent clinical axes.
- The audit is a software regression check, not evidence that the measurement is clinically valid.
