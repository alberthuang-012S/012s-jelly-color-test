import { usableHistory } from '../storage/history'
import type { TestSession } from '../test/types'

interface HistoryScreenProps {
  sessions: TestSession[]
  onBack: () => void
  onStart: () => void
}

function displayDate(value: string): string {
  return new Intl.DateTimeFormat('zh-TW', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export function HistoryScreen({ sessions, onBack, onStart }: HistoryScreenProps) {
  const usable = usableHistory(sessions)
  return (
    <main className="page-shell narrow-page history-page">
      <div className="topbar"><button className="back-button" onClick={onBack}>← 返回</button><div className="brand-lockup"><span className="brand-dot" /> JELLY COLOR TEST</div><span className="eyebrow">LOCAL HISTORY</span></div>
      <section className="history-header"><span className="section-kicker">YOUR SESSIONS</span><h1>每次測量，都是一個顯示條件的切片。</h1><p>RQI 低於 60 的測驗會保留，但預設不納入趨勢解讀。</p><button className="button button-primary" onClick={onStart}>再挑戰一次 <span>→</span></button></section>
      {sessions.length === 0 ? <div className="empty-state"><span>○</span><strong>還沒有歷史紀錄</strong><p>完成第一次挑戰後，這裡會顯示 dCDT、CA、CI 與 RQI。</p></div> : <div className="history-list">{sessions.map((session) => <div className={`history-card ${session.resultQualityIndex < 60 ? 'history-low' : ''}`} key={session.id}><div className="history-date">{displayDate(session.startedAt)}<span>{session.resultQualityIndex < 60 ? 'LOW QUALITY' : 'INCLUDED'}</span></div><div className="history-metrics"><div><small>dCDT</small><strong>{session.overallDcdt === undefined ? '—' : session.overallDcdt.toFixed(4)}</strong></div><div><small>CA</small><strong>{session.chromaticAccuracy.toFixed(1)}%</strong></div><div><small>CI</small><strong>{session.consistencyIndex}</strong></div><div><small>RQI</small><strong>{session.resultQualityIndex}</strong></div></div></div>)}</div>}
      {usable.length >= 2 && <p className="history-note">趨勢目前使用 {usable.length} 次 RQI ≥ 60 的結果；不建立醫療正常區間或百分位排名。</p>}
    </main>
  )
}
