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

The audit includes a 3,000-plate production validation stress test and 500-session virtual-observer simulations for thresholds 0.010, 0.020 and 0.040.

## Measurement model

- Adaptive distance: nominal CIE 1976 `u′v′`; CIEDE2000 is retained for QA only.
- Test flow: 2 control trials → per-direction calibration → three interleaved 2-down/1-up tracks → six repeated-level anchor trials → analysis.
- Threshold: psychometric logistic fit at 75% predicted correct; last-four-reversal median fallback when the fit is not usable.
- Core metrics: dCDT, Chromatic Difficulty Curve, Color Direction Profile, CA, CI and RQI.
- Response time and focus interruptions are retained for timing flags and RQI; they do not directly reduce color ability metrics.
- History is local-only and limited to 20 sessions. RQI < 60 remains visible but is excluded from usable trend data.

### Engine revision: `uv2-open-response`

- Each direction runs for at least 10 and at most 18 adaptive trials; 7 reversals indicate convergence. Hitting 18 trials stops a track with low convergence quality, not a claim of convergence. The former 35-trial session cap is removed. A fully calibrated session uses 41–71 total trials.
- Palettes are generated symmetrically around neutral in nominal u′v′ at equal nominal luminance. A/B are opposite polarities, not independent clinical axes. Luminance noise is applied in linear RGB, then quantized to the actual canvas byte colors. Recorded distance is the separation of mean dot chromaticities. Out-of-gamut requests and failed plate checks fail closed.
- Threshold fits use adaptive trials only, at least 10 observations, a converged increasing fit, and a 75% crossing inside the sampled range. Fallback requires four finite, in-range reversals. Failed calibration never yields a threshold; fewer than two usable directions never yield an overall value.
- The reversal median is a separate approximate staircase summary, **not a validated 75% psychometric threshold**. Method labels are retained. No confidence interval or clinical equivalence is claimed.
- CI monotonicity and fit are evaluated within directions. Fit quality is a descriptive, sampling-noise-adjusted binned calibration score, not a statistical goodness-of-fit test. Missing fit evidence scores zero. RQI completion uses calibration, trial coverage, reversals, threshold availability, and anchors rather than the completed flag alone.
- Fresh sessions use different recorded seeds; explicit seeds reproduce simulations. Results record the engine version. The previous-session comparison excludes older versions and low-quality sessions.
- The audit covers the full 3 directions × 5 target numbers × 20 distances (including limits), with 10 seeds per combination. Its open-response observer has no assumed 50% guessing floor, uses slope 4 on log-distance, and has 75% correct at the configured threshold. Three 500-session groups must each have ≥90% usable estimates, absolute median bias ≤25% of threshold, MAE ≤35%, and ≤71 trials. These are engineering regression gates, not clinical acceptance criteria. Real observers, lapse/guess behavior, display calibration, and repeatability still require empirical validation.

## GitHub Pages

The included workflow deploys `main` to:

`https://alberthuang-012s.github.io/012s-jelly-color-test/`

After connecting this directory to the GitHub repository `012s-jelly-color-test`, enable **GitHub Actions** as the Pages source.

> 本測試為螢幕色彩辨識挑戰。dCDT 為本次裝置與顯示條件下的相對估算值，可能受到螢幕顯色、亮度、色彩模式、環境光線及裝置差異影響，不作為醫療診斷依據。
