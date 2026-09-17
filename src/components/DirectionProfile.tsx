import { DIRECTION_LABELS } from '../psychophysics/config'
import { hasThreshold } from '../test/report'
import type { DirectionThreshold } from '../test/types'

interface DirectionProfileProps {
  thresholds: DirectionThreshold[]
  usable?: boolean
}

export function DirectionProfile({ thresholds, usable = true }: DirectionProfileProps) {
  const valid = thresholds.filter(hasThreshold)
  const max = Math.max(...valid.map((item) => item.threshold!), 0.001)
  return (
    <section className="result-section report-directions" aria-labelledby="report-directions-title">
      <div className="section-heading"><div><span className="section-kicker">看看不同顏色的表現</span><h2 id="report-directions-title">不同色彩方向的估計</h2></div></div>
      <p className="direction-guide">{usable ? '線條越短，代表本次估計能辨認的色差越細微；只閱讀這次有資料的方向。' : '本次資料尚不適合比較方向差異，已有估計保留在詳細資料中。'}</p>
      <div className="direction-list">
        {thresholds.map((item) => {
          const available = hasThreshold(item)
          const showBar = available && usable
          const description = !available ? '目前資料不足以估計' : !usable ? '已記錄於詳細資料' : '本次相對估計'
              return <div className="direction-row" key={item.directionId}>
            <div className="direction-name"><span aria-hidden="true" className={`direction-swatch swatch-${item.directionId.toLowerCase()}`} /><span><strong>{item.label ?? DIRECTION_LABELS[item.directionId] ?? item.directionId}</strong><small>{description}</small></span></div>
            <div className={`direction-bar ${showBar ? '' : 'direction-bar-unavailable'}`} aria-hidden="true">{showBar && <span style={{ width: `${item.threshold! / max * 100}%` }} />}</div>
            <div className="direction-value">{showBar ? item.threshold!.toFixed(4) : available ? '已記錄' : '尚無資料'}</div>
          </div>
        })}
      </div>
      <p className="footnote">方向數值用來描述本次資料；沒有資料的方向不列入整體估計。</p>
    </section>
  )
}
