# Jelly Color Test measurement-engine audit

## Run metadata

- Date: 2026-09-18 (Asia/Taipei)
- Engine version: `uv10-quick-core-multi-optional`
- Git SHA under audit: `4d397017bb545b6e6eda6e7c2c2c7ac418ec7ce6`
- Scope: current production `buildTestSession()` engine and current `generatePlate()` generator
- Result: **PASS — engineering regression gates**

This file describes the current `uv10-quick-core-multi-optional` engine. Earlier engine numbers are not carried forward as current-engine evidence.

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

The full verification run also passed: TypeScript type check, 14 test files / 64 tests, and the production Vite build.

## Question ranges

The default core session measures red-green bipolar and blue-yellow directions. Purple-green, red-orange-blue-green, yellow-green-blue-violet and red-violet-blue-green are selected later from the core report and saved as separate supplemental sessions. The new picker offers four optional combinations and limits each supplemental run to at most two selected directions.

| Session mode | Initial lower bound | Initial upper bound |
| --- | ---: | ---: |
| Core quick session | 28 | 40 |
| One supplemental direction | 15 | 21 |
| Two supplemental directions | 28 | 40 |

The bounds include 2 control trials, per-direction calibration, 10–14 adaptive trials per direction, and 2 repeated-level anchor trials per direction. The range updates as calibration and tracks finish.

## Plate validation

The matrix contains 6 active measurement axes × 100 target numbers (0–99) × 10 evenly spaced requested distances × 3 deterministic seed families = **18,000 cases**. The red–green axis deterministically alternates its two polarities; the other active axes cover blue–yellow, purple–green, red-orange-blue-green, yellow-green-blue-violet and red-violet-blue-green. The former cyan–red axis remains available only for reading legacy records. Distances include the configured `0.0035` minimum, `0.075` maximum, and eight intermediate values. Each successful case was generated twice and compared as a deterministic seeded plate.

| Check | Result |
| --- | ---: |
| Generation success | 18,000 / 18,000 (100%) |
| `productionValid` | 18,000 / 18,000 (100%) |
| Coverage failures | 0 |
| Figure/background separation failures | 0 |
| Out-of-gamut / invalid RGB failures | 0 |
| Unexpected regeneration | 0 |
| Target/direction/seed substitution failures | 0 |
| Unsupported target `100` accepted | 0 |
| Reproducibility failures | 0 |

`generatePlate()` fails closed when a target is outside 0–99 or when production validation fails. The audit does not treat a regenerated or substituted plate as a successful fallback.

## Virtual-observer regression

Each group contains 500 deterministic core sessions. The observer uses the existing open-response simulation philosophy: logistic probability in log nominal distance, slope 4, 75% correct at the configured threshold, and no 50% guessing floor. “Usable” is the existing core result-eligibility concept: two finite direction estimates, complete data, and RQI ≥ 60. Convergence is reported separately; reaching the 14-trial ceiling remains low convergence and is not reclassified as convergence.

| Configured threshold | Usable rate | Median estimate | Bias | MAE | Mean trials | Median trials | Min–max trials | Convergence | Low convergence | Psychometric fit | Reversal fallback | Failed calibration |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0.010 | 481/500 (96.2%) | 0.011162 | +0.001162 | 0.001707 | 35.908 | 36 | 34–36 | 14/500 (2.8%) | 485/500 (97.0%) | 42.35% | 57.65% | 0/500 (0%) |
| 0.020 | 463/500 (92.6%) | 0.020664 | +0.000664 | 0.002613 | 35.720 | 36 | 30–37 | 34/500 (6.8%) | 465/500 (93.0%) | 79.31% | 20.69% | 0/500 (0%) |
| 0.040 | 489/500 (97.8%) | 0.038817 | -0.001183 | 0.003347 | 34.794 | 35 | 29–37 | 96/500 (19.2%) | 404/500 (80.8%) | 88.27% | 11.73% | 0/500 (0%) |

Directional estimate counts were 980, 962 and 989 in the three groups. Fit/fallback percentages are usage across those estimates. Existing audit gates were retained: usable estimate rate ≥ 90%, absolute median bias ≤ 25% of configured threshold, MAE ≤ 35%, and maximum session length no more than the core engine's 40-trial upper bound. The audit additionally requires the six-axis plate matrix to complete with zero validation, substitution, regeneration, gamut, and reproducibility failures. All gates passed. The shorter ceiling increases the use of reversal fallback, especially at the lowest configured threshold; that trade-off is retained in the record rather than hidden.

## What was not changed

This revision keeps the staircase mathematics, 75% criterion, adaptive minimum/maximum distances, color space, palette validation, and dCDT/CA/CI/RQI formulas. The default core session measures red–green as one bipolar axis and blue–yellow; purple–green, red-orange-blue-green, yellow-green-blue-violet and red-violet-blue-green are available as explicitly selected supplemental directions. The former cyan–red axis is retained only for legacy record readability. Each selected axis runs for 10–14 adaptive trials with a five-reversal stopping target and paired anchors. Core and supplemental records retain their mode and direction list; supplemental results do not enter the core dCDT trend. The engine version is bumped so earlier results remain readable but are not compared with this scope revision.

## Limitations

- dCDT is a display-relative nominal `Δu′v′` estimate, not an instrument-measured panel output.
- The environment checklist records user confirmation only; lighting and physical monitor calibration are not measured automatically.
- No clinical validation, population norm, percentile, diagnosis, or normal/abnormal range is established.
- Virtual observers cover one response model and do not establish real-user accuracy, lapse/guess behavior, device equivalence, confidence intervals, or empirical repeatability.
- The current 14-trial stopping rule produces a high low-convergence rate and more reversal fallbacks in this simulation. That is reported honestly; low convergence is not silently promoted to a convergence claim, and the existing audit gates were not weakened to hide it.
- The red–green axis alternates its two polarities; blue–yellow is part of the core, while purple–green, red-orange-blue-green, yellow-green-blue-violet and red-violet-blue-green are display-relative supplemental directions rather than clinical confusion axes. Cyan–red is a legacy-only direction in the current engine.
- The audit is a software regression check, not evidence that the measurement is clinically valid.
