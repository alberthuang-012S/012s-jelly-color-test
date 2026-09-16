import type { TestSession } from '../test/types'

interface DcdtTrendProps {
  sessions: TestSession[]
}

function dateLabel(value: string): string {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '—'
  return new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric' }).format(date)
}

function median(values: number[]): number | undefined {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((first, second) => first - second)
  if (!sorted.length) return undefined
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

export function DcdtTrend({ sessions }: DcdtTrendProps) {
  const values = sessions.map((session) => session.overallDcdt as number).filter((value) => Number.isFinite(value))
  if (!values.length) {
    return <div className="trend-empty">目前沒有符合相同測量條件的紀錄，完成幾次測驗後會在這裡形成趨勢。</div>
  }

  const width = 760
  const height = 250
  const left = 58
  const right = 22
  const top = 24
  const bottom = 52
  const plotWidth = width - left - right
  const plotHeight = height - top - bottom
  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const padding = Math.max((maximum - minimum) * 0.2, maximum * 0.08, 0.0005)
  const low = Math.max(0, minimum - padding)
  const high = maximum + padding
  const x = (index: number) => left + (sessions.length === 1 ? plotWidth / 2 : (index / (sessions.length - 1)) * plotWidth)
  const y = (value: number) => top + ((high - value) / (high - low)) * plotHeight
  const points = sessions.map((session, index) => `${x(index)},${y(session.overallDcdt as number)}`).join(' ')
  const recentMedian = median(sessions.slice(-3).map((session) => session.overallDcdt as number))
  const gridValues = [high, high - (high - low) / 2, low]

  return (
    <div className="trend-card">
      <div className="trend-summary"><span>可比較紀錄 <strong>{sessions.length} 次</strong></span><span>最近三次中位數 <strong>{recentMedian?.toFixed(4) ?? '—'}</strong></span></div>
      <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="可比較測量紀錄的 dCDT 趨勢圖">
        {gridValues.map((value) => <g key={value}>
          <line className="trend-grid-line" x1={left} x2={width - right} y1={y(value)} y2={y(value)} />
          <text className="trend-axis-text" x={left - 10} y={y(value) + 4} textAnchor="end">{value.toFixed(4)}</text>
        </g>)}
        <line className="trend-axis-line" x1={left} x2={left} y1={top} y2={height - bottom} />
        <line className="trend-axis-line" x1={left} x2={width - right} y1={height - bottom} y2={height - bottom} />
        <polyline className="trend-line" points={points} />
        {sessions.map((session, index) => <g key={session.id}>
          <circle className={index === sessions.length - 1 ? 'trend-point trend-point-latest' : 'trend-point'} cx={x(index)} cy={y(session.overallDcdt as number)} r={index === sessions.length - 1 ? 6 : 4} />
          <text className="trend-date" x={x(index)} y={height - bottom + 25} textAnchor="middle">{dateLabel(session.startedAt)}</text>
        </g>)}
        <text className="trend-axis-caption" x={left} y={height - 8}>較低 = 本次可辨識的色差較細微</text>
      </svg>
      <p className="trend-footnote">趨勢只連結測量引擎、裝置與顯示條件相容且品質足夠的紀錄；它不是能力排名，也不是醫療判定。</p>
    </div>
  )
}
