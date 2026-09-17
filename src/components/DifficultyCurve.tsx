import type { DifficultyCurve as DifficultyCurveData } from '../test/types'

interface DifficultyCurveProps {
  curve: DifficultyCurveData
}

function formatDistance(value: number): string {
  return value.toFixed(3)
}

export function DifficultyCurve({ curve }: DifficultyCurveProps) {
  const width = 720
  const height = 260
  const left = 48
  const right = 18
  const top = 18
  const bottom = 42
  const allDistances = [...curve.observed, ...curve.fitted].map((point) => point.distance)
  const min = Math.min(...allDistances, 0.004)
  const max = Math.max(...allDistances, 0.06)
  const x = (distance: number) => left + (1 - (distance - min) / Math.max(1e-9, max - min)) * (width - left - right)
  const y = (probability: number) => top + (1 - probability) * (height - top - bottom)
  const path = curve.fitted.map((point, index) => `${index ? 'L' : 'M'} ${x(point.distance).toFixed(2)} ${y(point.probability).toFixed(2)}`).join(' ')
  const markerX = curve.threshold75 === undefined ? undefined : x(curve.threshold75)
  return (
    <section className="result-section curve-section">
      <div className="section-heading"><div><span className="section-kicker">03 / CHROMATIC DIFFICULTY CURVE</span><h2>色差越細微，辨識機率如何變化？</h2></div><span className="section-index">{curve.fitted.length ? 'DIRECTION FITS' : 'OBSERVED DATA'}</span></div>
      <div className="curve-card">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="色差與正確機率曲線">
          <line className="axis-line" x1={left} x2={width - right} y1={height - bottom} y2={height - bottom} />
          <line className="axis-line" x1={left} x2={left} y1={top} y2={height - bottom} />
          {[0, 0.5, 1].map((value) => <g key={value}><line className="grid-line" x1={left} x2={width - right} y1={y(value)} y2={y(value)} /><text className="axis-text" x={left - 10} y={y(value) + 4} textAnchor="end">{Math.round(value * 100)}%</text></g>)}
          {markerX !== undefined && <><line className="threshold-line" x1={markerX} x2={markerX} y1={top} y2={height - bottom} /><text className="threshold-text" x={markerX + 6} y={top + 13}>75% threshold</text></>}
          {path && <path className="fit-path" d={path} />}
          {curve.observed.map((point) => <circle className="observed-point" key={`${point.distance}-${point.count}`} cx={x(point.distance)} cy={y(point.probability)} r={Math.min(6, 3 + (point.count ?? 1) / 3)} />)}
          <text className="axis-caption" x={left} y={height - 12}>較容易辨識 · 高色差</text>
          <text className="axis-caption" x={width - right} y={height - 12} textAnchor="end">較細微色差</text>
        </svg>
        <div className="curve-legend"><span><i className="legend-dot" /> observed data</span><span><i className="legend-line" /> fitted curve</span><span><i className="legend-marker" /> 75% marker</span></div>
      </div>
      <div className="band-grid">
        {curve.bands.map((band) => <div key={band.label} className="band-item"><span>{band.label}</span><strong>{band.accuracy.toFixed(1)}%</strong><small>{band.count} trials · session-relative</small></div>)}
      </div>
      <p className="footnote">曲線為各色彩方向各自擬合後的平均機率，僅供描述，不用來估算整體門檻。X 軸為 nominal Δu′v′，不是實際量測到的面板光譜輸出。</p>
    </section>
  )
}
