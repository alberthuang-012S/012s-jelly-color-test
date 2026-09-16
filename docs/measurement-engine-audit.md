# Measurement engine regression audit — 2026-09-16

Engine: `uv2-open-response`. Local verification, not a clinical validation or deployment report.

## Verified

- TypeScript type check and production build pass.
- 8 test files, 32 tests pass, including stale/duplicate submissions, invalid plate/response rejection, actual-distance staircase updates, boundary reversals, maximum-trial stopping, failed calibration, insufficient threshold evidence, direction-specific consistency and non-overlapping bands.
- 3,000 plates: full 3 directions × 5 supported numbers × 20 distances × 10 seeds. Includes 0.0035 and 0.075 limits. Zero invalid plates; zero regenerations.
- Three independent seeded observer groups, 500 completed sessions each. Observer probability is logistic in log-distance, slope 4, with 75% correct at the configured threshold and no 50% guessing floor. Controls succeed with probability 0.985.

| Configured threshold | Estimated median | Median bias | MAE | Usable estimates | Mean trials |
| --- | --- | --- | --- | --- | --- |
| 0.010 | 0.009938 | -0.000062 | 0.001241 | 500/500 | 64.936 |
| 0.020 | 0.020135 | +0.000135 | 0.001936 | 500/500 | 64.690 |
| 0.040 | 0.039227 | -0.000773 | 0.002936 | 500/500 | 63.940 |

All audit regression gates pass. “Usable” means two or more eligible direction thresholds, not high RQI or high convergence quality. Stopping at the 18-trial maximum remains explicitly low convergence quality.

## Limits

The reversal fallback remains a separately labelled approximate staircase summary, not an established 75% threshold. Simulated observers match one model family; these results do not establish real-user accuracy, device equivalence, confidence intervals, or clinical validity. A/B are reversed polarities rather than independent clinical axes. Empirical repeatability, alternate slopes, guessing/lapses, grayscale perceptual leakage, and calibrated physical display measurements remain future validation work. Visual browser QA was not performed for this engine revision.

The 0–9 input controls were preserved. No remote deployment was performed.
