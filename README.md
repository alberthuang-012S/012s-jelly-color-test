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

## GitHub Pages

The included workflow deploys `main` to:

`https://alberthuang-012s.github.io/012s-jelly-color-test/`

After connecting this directory to the GitHub repository `012s-jelly-color-test`, enable **GitHub Actions** as the Pages source.

> 本測試為螢幕色彩辨識挑戰。dCDT 為本次裝置與顯示條件下的相對估算值，可能受到螢幕顯色、亮度、色彩模式、環境光線及裝置差異影響，不作為醫療診斷依據。
