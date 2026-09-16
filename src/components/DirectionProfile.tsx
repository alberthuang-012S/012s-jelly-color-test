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
  const unsettled = valid.some((item) => item.convergenceQuality !== 'high' || item.thresholdMethod !== 'psychometric')
  return (
    <section className="result-section report-directions" aria-labelledby="report-directions-title">
      <div className="section-heading"><div><span className="section-kicker">看看不同顏色的表現</span><h2 id="report-directions-title">不同色彩方向的估計</h2></div></div>
      <p className="direction-guide">{usable ? '線條越短，代表本次估計能辨認的色差越細微；只閱讀這次有資料的方向。' : '本次資料尚不適合比較方向差異，已有估計保留在詳細資料中。'}</p>
      <div className="direction-list">
        {thresholds.map((item) => {
          const available = hasThreshold(item)
          const showBar = available && usable
          const description = !available ? '目前的資料還不足以估計' : !usable ? '本次估計需重測確認' : item.convergenceQuality !== 'high' || item.thresholdMethod !== 'psychometric' ? '估計仍有不確定性' : '本次估計可供參考'
          return <div className="direction-row" key={item.directionId}>
            <div className="direction-name"><span aria-hidden="true" className={`direction-swatch swatch-${item.directionId.toLowerCase()}`} /><span><strong>{DIRECTION_LABELS[item.directionId]}</strong><small>{description}</small></span></div>
            <div className={`direction-bar ${showBar ? '' : 'direction-bar-unavailable'}`} aria-hidden="true">{showBar && <span style={{ width: `${item.threshold! / max * 100}%` }} />}</div>
            <div className="direction-value">{showBar ? item.threshold!.toFixed(4) : available ? '待確認' : '尚無法估計'}</div>
          </div>
        })}
      </div>
      <p className="footnote">{!usable || unsettled ? '部分估計尚不穩定，目前不判定哪個方向較弱。' : '小幅數值差異不一定有實際意義，不據此判定最弱方向。'}沒有資料的方向不代表能力較差。</p>
    </section>
  )
}
