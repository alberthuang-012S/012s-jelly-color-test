import { DIRECTION_LABELS } from '../psychophysics/config'
import type { DirectionThreshold } from '../test/types'

interface DirectionProfileProps {
  thresholds: DirectionThreshold[]
}

export function DirectionProfile({ thresholds }: DirectionProfileProps) {
  const values = thresholds.map((item) => item.threshold ?? 0)
  const max = Math.max(...values, 0.001)
  const hardest = thresholds.filter((item) => item.threshold !== undefined).sort((a, b) => (b.threshold ?? 0) - (a.threshold ?? 0))[0]
  return (
    <section className="result-section">
      <div className="section-heading"><div><span className="section-kicker">02 / COLOR DIRECTION PROFILE</span><h2>三條色彩方向，三種辨識輪廓。</h2></div><span className="section-index">DIRECTION</span></div>
      <div className="direction-list">
        {thresholds.map((item) => (
          <div className="direction-row" key={item.directionId}>
            <div className="direction-name"><span className={`direction-swatch swatch-${item.directionId.toLowerCase()}`} /> <span><strong>Direction {item.directionId}</strong><small>{item.label ?? DIRECTION_LABELS[item.directionId]}</small></span></div>
            <div className="direction-bar"><span style={{ width: `${item.threshold === undefined ? 8 : Math.max(12, (item.threshold / max) * 100)}%` }} /></div>
            <div className="direction-value">{item.threshold === undefined ? '資料不足' : item.threshold.toFixed(4)}<small>{item.thresholdMethod === 'psychometric' ? 'FIT' : item.thresholdMethod ? 'REVERSAL' : '—'}</small></div>
          </div>
        ))}
      </div>
      {hardest && <p className="insight-line"><span>↗</span> 本次 <strong>Direction {hardest.directionId}</strong> 的辨識門檻相對較高，代表這條方向在本次顯示條件下較具挑戰。</p>}
      <p className="footnote">這些是 Chromatic Direction，不對應任何疾病或臨床分類。</p>
    </section>
  )
}
