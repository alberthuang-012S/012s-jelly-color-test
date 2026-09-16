import { consistencyLabel } from '../psychophysics/consistency'
import type { TestSession } from '../test/types'

interface QualityPanelProps {
  session: TestSession
}

export function QualityPanel({ session }: QualityPanelProps) {
  const quality = session.metrics.quality
  const control = session.questions.filter((question) => question.phase === 'control')
  return (
    <section className="result-section quality-section">
      <div className="section-heading"><div><span className="section-kicker">04 / SESSION QUALITY</span><h2>這次結果，值得被怎麼解讀？</h2></div><span className="section-index">QUALITY</span></div>
      <div className="quality-grid">
        <div className="quality-row"><span>Control</span><strong>{control.filter((question) => question.correct).length} / {Math.max(2, control.length)}</strong><small>{quality.controlQuality}%</small></div>
        <div className="quality-row"><span>Consistency Index</span><strong>{session.consistencyIndex} / 100</strong><small>{consistencyLabel(session.consistencyIndex)}</small></div>
        <div className="quality-row"><span>Result Quality</span><strong>{session.resultQualityIndex} / 100</strong><small>{quality.classification}</small></div>
        <div className="quality-row"><span>Interruptions</span><strong>{quality.interruptions}</strong><small>{quality.extremeFastCount + quality.extremeSlowCount} timing flags</small></div>
      </div>
      {quality.score < 60 ? <div className="quality-warning"><strong>本次結果可信度較低</strong><span>{quality.reasons[0] ?? '可重新挑戰一次，取得更完整的資料。'}</span></div> : <div className="quality-positive"><span>✦</span><div><strong>Result quality · {quality.classification}</strong><span>這次測驗的條件足以支持一個有脈絡的相對結果。</span></div></div>}
      {quality.reasons.length > 0 && <div className="reason-list">{quality.reasons.map((reason) => <span key={reason}>· {reason}</span>)}</div>}
    </section>
  )
}
