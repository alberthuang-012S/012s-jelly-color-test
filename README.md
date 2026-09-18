# 012S Color Test

瀏覽器上的自適應色彩辨識測驗，透過 Hidden Number 色彩圓點題板，估計使用者在不同色彩方向上的相對辨識門檻。

## 主要功能

- Adaptive color discrimination test
- Hidden Number plates
- Core color directions
- Optional supplemental directions
- dCDT
- CA
- CI
- RQI
- Local history
- Historical comparison
- Responsive desktop / mobile UI

## 使用方式

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run typecheck
npm run build
npm run audit
```

## 資料保存

結果只保存在瀏覽器 `localStorage`，最多保留最近 20 筆紀錄。

## 限制

- 結果會受到螢幕、色彩模式、觀看角度與環境光影響。
- 這是 display-relative measurement，不等同實驗室顯示器校正。
- 本測驗結果不作為醫療診斷。
