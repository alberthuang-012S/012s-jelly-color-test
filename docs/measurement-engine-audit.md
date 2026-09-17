# Jelly Color Test measurement-engine audit

## Run metadata

- Date: 2026-09-17 (Asia/Taipei)
- Engine version: `uv7-glyph-clarity`
- Git SHA under audit: `f7ec00cee444631eccfc3baf916140a3d2370231`
- Scope: current production `buildTestSession()` engine and current `generatePlate()` generator
- Result: **PASS — engineering regression gates**

This file describes the current `uv7-glyph-clarity` engine. Earlier engine numbers are not carried forward as current-engine evidence.

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

The full verification run also passed: TypeScript type check, 14 test files / 59 tests, and the production Vite build.

## Plate validation

The matrix contains 4 measurement axes × 100 target numbers (0–99) × 10 evenly spaced requested distances × 3 deterministic seed families = **12,000 cases**. The red–green axis deterministically alternates its two polarities; the other axes cover blue–yellow, purple–green and cyan–red. Distances include the configured `0.0035` minimum, `0.075` maximum, and eight intermediate values. Each successful case was generated twice and compared as a deterministic seeded plate.

| Check | Result |
| --- | ---: |
| Generation success | 12,000 / 12,000 (100%) |
| `productionValid` | 12,000 / 12,000 (100%) |
| Coverage failures | 0 |
| Figure/background separation failures | 0 |
| Out-of-gamut / invalid RGB failures | 0 |
| Unexpected regeneration | 0 |
| Target/direction/seed substitution failures | 0 |
| Unsupported target `100` accepted | 0 |
| Reproducibility failures | 0 |

`generatePlate()` fails closed when a target is outside 0–99 or when production validation fails. The audit does not treat a regenerated or substituted plate as a successful fallback.

## Virtual-observer regression

Each group contains 500 deterministic sessions. The observer uses the existing open-response simulation philosophy: logistic probability in log nominal distance, slope 4, 75% correct at the configured threshold, and no 50% guessing floor. “Usable” is the existing result-eligibility concept: at least two finite direction estimates, complete data, and RQI ≥ 60. Convergence is reported separately; reaching the 14-trial ceiling remains low convergence and is not reclassified as convergence.

| Configured threshold | Usable rate | Median estimate | Bias | MAE | Mean trials | Median trials | Min–max trials | Convergence | Low convergence | Psychometric fit | Reversal fallback | Failed calibration |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0.010 | 500/500 (100%) | 0.011897 | +0.001897 | 0.001824 | 69.808 | 70 | 68–71 | 1/500 (0.2%) | 499/500 (99.8%) | 41.63% | 58.37% | 0/500 (0%) |
| 0.020 | 500/500 (100%) | 0.020325 | +0.000325 | 0.001882 | 69.354 | 70 | 63–71 | 0/500 (0%) | 500/500 (100%) | 79.43% | 20.57% | 0/500 (0%) |
| 0.040 | 500/500 (100%) | 0.039025 | -0.000975 | 0.002581 | 67.718 | 68 | 59–73 | 17/500 (3.4%) | 483/500 (96.6%) | 87.94% | 12.06% | 0/500 (0%) |

Directional estimate counts were 1,941, 1,915 and 1,981 in the three groups. Fit/fallback percentages are usage across those estimates. Existing audit gates were retained: usable estimate rate ≥ 90%, absolute median bias ≤ 25% of configured threshold, MAE ≤ 35%, and maximum session length ≤ 78 trials. The audit additionally requires the four-axis plate matrix to complete with zero validation, substitution, regeneration, gamut, and reproducibility failures. All gates passed. The shorter ceiling increases the use of reversal fallback, especially at the lowest configured threshold; that trade-off is retained in the record rather than hidden.

## What was not changed

This revision keeps the staircase mathematics, 75% criterion, adaptive minimum/maximum distances, color space, palette validation, and dCDT/CA/CI/RQI formulas. It treats red–green as one bipolar axis with deterministic polarity switching, retains blue–yellow, and adds purple–green and cyan–red. It shortens each axis to 10–14 adaptive trials with a five-reversal stopping target, keeps paired anchors, and clarifies only the stimulus glyph paths for `4`, `5`, and `6`: `4` has a visible central counter, `5` has an open lower stroke, and `6` has a larger closed bowl. The engine version is bumped so earlier results remain readable but are not compared with this stimulus revision.

## Limitations

- dCDT is a display-relative nominal `Δu′v′` estimate, not an instrument-measured panel output.
- The environment checklist records user confirmation only; lighting and physical monitor calibration are not measured automatically.
- No clinical validation, population norm, percentile, diagnosis, or normal/abnormal range is established.
- Virtual observers cover one response model and do not establish real-user accuracy, lapse/guess behavior, device equivalence, confidence intervals, or empirical repeatability.
- The current 14-trial stopping rule produces a high low-convergence rate and more reversal fallbacks in this simulation. That is reported honestly; low convergence is not silently promoted to a convergence claim, and the existing audit gates were not weakened to hide it.
- The red–green axis alternates its two polarities; blue–yellow, purple–green and cyan–red are display-relative supplemental directions rather than clinical confusion axes.
- The audit is a software regression check, not evidence that the measurement is clinically valid.
