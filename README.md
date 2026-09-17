# Jelly Color Test

Hidden Number 色彩辨識挑戰。Phase 1 採用 display-relative psychophysics 模型，結果描述本次裝置與顯示條件下的相對辨識輪廓，不是醫療診斷工具。

## Local development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run typecheck
npm test
npm run audit
npm run build
```

The audit includes a 15,000-case production validation matrix (5 directions × 100 targets × 10 distances × 3 deterministic seeds) and 500-session virtual-observer simulations for thresholds 0.010, 0.020 and 0.040. See [`docs/measurement-engine-audit.md`](docs/measurement-engine-audit.md) for the recorded run.

## Measurement model

- Adaptive distance: nominal CIE 1976 `u′v′`; CIEDE2000 is retained for QA only.
- Test flow: 2 control trials → per-direction calibration → five interleaved 2-down/1-up tracks → ten repeated-level anchor trials → analysis.
- Threshold: psychometric logistic fit at 75% predicted correct; last-four-reversal median fallback when the fit is not usable.
- Core metrics: dCDT, Chromatic Difficulty Curve, Color Direction Profile, CA, CI and RQI.
- Response time and focus interruptions are retained for timing flags and RQI; they do not directly reduce color ability metrics.
- History is local-only and limited to 20 sessions. RQI < 60 remains visible but is excluded from usable trend data.

### Engine revision: `uv5-expanded-directions`

- Single- and two-digit masks use equal physical glyph-cell proportions on the 5:3 canvas, with a shared height and centered placement. Single digits are no longer stretched across the entire plate. The coverage gate now allows the smaller single-digit figure (8% coverage, at least 40 figure dots); all 100 targets are covered by plate stress tests. This stimulus geometry change uses a new version to avoid direct comparison with older results.
- The answering layout places controls beside the plate on desktop and uses a compact two-row keypad on portrait phones. Read-only answer display avoids triggering a second on-screen keyboard; physical number keys, deletion and Enter from the answer field remain supported. Very small viewports or accessibility zoom may still require scrolling rather than cropping content.

- Answers are sampled uniformly from 0–99 with replacement on every trial (including controls and anchors). Repeated answers are allowed. All ten digit masks are explicit; unsupported targets throw rather than silently rendering another digit. Session seeds reproduce the answer sequence. Changing the target set changes stimulus composition, so this revision is not directly compared with older results.

- Each direction runs for at least 10 and at most 18 adaptive trials; 7 reversals indicate convergence. Hitting 18 trials stops a track with low convergence quality, not a claim of convergence. The former 35-trial session cap is removed. Five directions and their anchors produce an estimated 67–117 total trials, depending on calibration and stopping points.
- Palettes are generated symmetrically around neutral in nominal u′v′ at equal nominal luminance. A/B are opposite polarities; C, D and E add blue–yellow, purple–green and cyan–red display-relative directions. These are not clinical confusion axes. Luminance noise is applied in linear RGB, then quantized to the actual canvas byte colors. Recorded distance is the separation of mean dot chromaticities. Out-of-gamut requests and failed plate checks fail closed.
- Threshold fits use adaptive trials only, at least 10 observations, a converged increasing fit, and a 75% crossing inside the sampled range. Fallback requires four finite, in-range reversals. Failed calibration never yields a threshold; fewer than two usable directions never yield an overall value.
- The reversal median is a separate approximate staircase summary, **not a validated 75% psychometric threshold**. Method labels are retained. No confidence interval or clinical equivalence is claimed.
- CI monotonicity and fit are evaluated within directions. Fit quality is a descriptive, sampling-noise-adjusted binned calibration score, not a statistical goodness-of-fit test. Missing fit evidence scores zero. RQI completion uses calibration, trial coverage, reversals, threshold availability, and anchors rather than the completed flag alone.
- Fresh sessions use different recorded seeds; explicit seeds reproduce simulations. Results record the engine version. Comparison searches directly for the latest earlier session that passes the complete eligibility rule: same engine, usable RQI, and matching viewport, pixel ratio, browser context, color depth, gamut and color scheme. History keeps all records locally, while trends use only that comparable subset.
- Phase 2A adds a required environment confirmation, an intentional pause that hides the plate and restarts the current trial clock on resume, player-facing phase/progress labels, and a read-first result summary. The audit now covers the full 5 directions × 100 target numbers × 10 distances (including limits) × 3 deterministic seeds. Its open-response observer has no assumed 50% guessing floor, uses slope 4 on log-distance, and has 75% correct at the configured threshold. Three 500-session groups must each have ≥90% usable estimates, absolute median bias ≤25% of threshold, MAE ≤35%, and no more than the engine's 117-trial upper bound. These are engineering regression gates, not clinical acceptance criteria. Real observers, lapse/guess behavior, display calibration, and repeatability still require empirical validation. The prior audit reports apply only to earlier engine revisions and are archived in the commit history, not represented as current-engine evidence.

## GitHub Pages

The included workflow deploys `main` to:

`https://alberthuang-012s.github.io/012s-jelly-color-test/`

After connecting this directory to the GitHub repository `012s-jelly-color-test`, enable **GitHub Actions** as the Pages source.

> 本測試為螢幕色彩辨識挑戰。dCDT 為本次裝置與顯示條件下的相對估算值，可能受到螢幕顯色、亮度、色彩模式、環境光線及裝置差異影響，不作為醫療診斷依據。
