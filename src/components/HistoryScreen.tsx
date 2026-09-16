import { DcdtTrend } from './DcdtTrend'
import { buildHistoryTrend, thresholdCount } from '../test/history'
import { resultPresentation } from '../test/report'
import type { TestSession } from '../test/types'

interface HistoryScreenProps {
  sessions: TestSession[]
  onBack: () => void
  onStart: () => void
  onOpenSession: (session: TestSession) => void
}

function displayDate(value: string): string {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '日期未記錄'
  return new Intl.DateTimeFormat('zh-TW', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function statusLabel(session: TestSession, isComparable: boolean): string {
  if (isComparable) return '可納入趨勢'
  if (session.status === 'partial') return '未完成，僅保存'
  return resultPresentation(session).usable ? '條件不同，僅保存' : '未納入趨勢，僅保存'
}

export function HistoryScreen({ sessions, onBack, onStart, onOpenSession }: HistoryScreenProps) {
  const trend = buildHistoryTrend(sessions)
  const comparableIds = new Set(trend.sessions.map((session) => session.id))
  return (
    <main className="page-shell narrow-page history-page">
      <div className="topbar"><button className="back-button" onClick={onBack}>← 返回</button><div className="brand-lockup"><span className="brand-dot" /> JELLY COLOR TEST</div><span className="eyebrow">LOCAL HISTORY</span></div>
      <section className="history-header"><span className="section-kicker">YOUR SESSIONS</span><h1>看見自己的測量變化，也看見條件的差異。</h1><p>所有完成或中途離開的紀錄都會保留；只有測量引擎、裝置與顯示條件相容的高品質結果，才會連成趨勢。</p><button className="button button-primary" onClick={onStart}>再挑戰一次 <span>→</span></button></section>
      {sessions.length === 0 ? <div className="empty-state"><span>○</span><strong>還沒有歷史紀錄</strong><p>完成第一次挑戰後，這裡會顯示 dCDT、CA、CI 與 RQI。</p></div> : <>
        <section className="history-trend-section" aria-labelledby="history-trend-title">
          <div className="history-section-heading"><div><span className="section-kicker">01 / dCDT TREND</span><h2 id="history-trend-title">相容條件下的變化</h2></div></div>
          <DcdtTrend sessions={trend.sessions} />
          <p className="history-legend"><span className="legend-comparable" />連線代表可直接比較　<span className="legend-record-only" />灰色標籤代表保留但未納入趨勢</p>
        </section>
        <section className="history-records-section" aria-labelledby="history-records-title">
          <div className="history-section-heading"><div><span className="section-kicker">02 / ALL RECORDS</span><h2 id="history-records-title">所有測量紀錄 <small>{sessions.length} / 20</small></h2></div></div>
          <div className="history-list">{sessions.map((session) => {
            const view = resultPresentation(session)
            const isComparable = comparableIds.has(session.id)
            return <article className={`history-card ${isComparable ? 'history-card-comparable' : 'history-card-record-only'}`} key={session.id}>
              <button className="history-card-open" type="button" onClick={() => onOpenSession(session)} aria-label={`查看 ${displayDate(session.startedAt)} 的完整報告`}>
                <div className="history-date"><span>{displayDate(session.startedAt)}</span><span className="history-status">{statusLabel(session, isComparable)}</span></div>
                <div className="history-metrics"><div><small>dCDT</small><strong>{Number.isFinite(session.overallDcdt) ? session.overallDcdt!.toFixed(4) : '—'}</strong></div><div><small>CA</small><strong>{Number.isFinite(session.chromaticAccuracy) ? `${session.chromaticAccuracy.toFixed(1)}%` : '—'}</strong></div><div><small>CI</small><strong>{Number.isFinite(session.consistencyIndex) ? session.consistencyIndex : '—'}</strong></div><div><small>RQI</small><strong>{Number.isFinite(session.resultQualityIndex) ? session.resultQualityIndex : '—'}</strong></div></div>
                <div className="history-card-footer"><span>{thresholdCount(session)} 個方向估計 · {session.questions?.length ?? 0} 題</span><span className="history-card-link">查看完整報告 <span aria-hidden="true">→</span></span></div>
              </button>
            </article>
          })}</div>
        </section>
      </>}
      <p className="history-note">歷史報告為唯讀快照，不會重新計算；資料僅保存在此瀏覽器，最多保留最近 20 筆。</p>
    </main>
  )
}
