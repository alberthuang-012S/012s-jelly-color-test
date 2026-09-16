import { useState } from 'react'
import { DirectionProfile } from './DirectionProfile'
import { DifficultyCurve } from './DifficultyCurve'
import { QualityPanel } from './QualityPanel'
import type { TestSession } from '../test/types'

interface ResultsScreenProps {
  session: TestSession
  previousSession?: TestSession
  onRestart: () => void
  onHistory: () => void
}

function formatDcdt(value: number | undefined): string {
  return value === undefined ? '資料不足' : value.toFixed(4)
}

export function ResultsScreen({ session, previousSession, onRestart, onHistory }: ResultsScreenProps) {
  const [advanced, setAdvanced] = useState(false)
  const quality = session.metrics.quality
  return (
    <main className="page-shell results-page">
      <div className="topbar results-topbar"><div className="brand-lockup"><span className="brand-dot" /> JELLY COLOR TEST</div><div className="result-tag">SESSION COMPLETE <span>✦</span></div><button className="back-button" onClick={onHistory}>歷史紀錄 →</button></div>
      {quality.score < 60 && <div className="low-quality-banner"><span>!</span><div><strong>本次結果可信度較低</strong><small>{quality.reasons[0] ?? '建議重新挑戰，以取得更完整的資料。'}</small></div><button onClick={onRestart}>重新挑戰</button></div>}
      <section className="result-hero">
        <div><span className="section-kicker accent">COLOR VISION PROFILE / 01</span><h1>你的色彩辨識<br /><em>相對輪廓。</em></h1><p>這是本次裝置與顯示條件下的估算結果，不代表臨床色覺能力或醫療判斷。</p></div>
        <div className="dcdt-display"><span>色彩辨識門檻</span><strong>{formatDcdt(session.overallDcdt)}</strong><small>DISPLAY-RELATIVE · nominal Δu′v′</small><div className="dcdt-direction">↓ 越小代表本次可辨認的色差更細</div></div>
      </section>
      <div className="metric-card-grid"><div className="metric-card"><span>CA <small>CHROMATIC ACCURACY</small></span><strong>{session.chromaticAccuracy.toFixed(1)}<i>%</i></strong><p>所有有效 non-control trials</p></div><div className="metric-card"><span>CI <small>CONSISTENCY INDEX</small></span><strong>{session.consistencyIndex}<i>/100</i></strong><p>{session.metrics.consistency.anchorAgreement}% anchor agreement</p></div><div className="metric-card metric-card-quality"><span>RQI <small>RESULT QUALITY</small></span><strong>{session.resultQualityIndex}<i>/100</i></strong><b>{quality.classification}</b><p>穩定、完整、可解讀程度</p></div></div>
      {previousSession && previousSession.overallDcdt !== undefined && session.overallDcdt !== undefined && <div className="history-compare"><span>上次相對門檻 <strong>{previousSession.overallDcdt.toFixed(4)}</strong></span><span className="compare-arrow">→</span><span>這次 <strong>{session.overallDcdt.toFixed(4)}</strong></span><small>{session.overallDcdt < previousSession.overallDcdt ? '本次測得的相對門檻較低' : '本次測得的相對門檻較高'}</small></div>}
      <DirectionProfile thresholds={session.metrics.directionalThresholds} />
      <DifficultyCurve curve={session.metrics.difficultyCurve} />
      <QualityPanel session={session} />
      <section className="advanced-section"><button className="advanced-toggle" onClick={() => setAdvanced((value) => !value)}><span>{advanced ? '−' : '+'}</span> 查看技術資料 <small>{advanced ? '收起' : 'thresholds · trials · palettes · seeds'}</small></button>{advanced && <div className="advanced-panel"><div><span>Overall nominal dCDT</span><strong>{formatDcdt(session.overallDcdt)}</strong></div><div><span>Threshold method</span><strong>{session.metrics.directionalThresholds.map((item) => `D${item.directionId}: ${item.thresholdMethod ?? 'insufficient'}`).join(' · ')}</strong></div><div><span>Trial count</span><strong>{session.questions.length} total · {session.metrics.directionalThresholds.map((item) => `${item.trialCount} D${item.directionId}`).join(' · ')}</strong></div><div><span>Reversal count</span><strong>{session.metrics.directionalThresholds.map((item) => `${item.reversalCount} D${item.directionId}`).join(' · ')}</strong></div><div><span>Fit quality</span><strong>{session.metrics.directionalThresholds.map((item) => `${item.fitQuality?.toFixed(0) ?? '—'} D${item.directionId}`).join(' · ')}</strong></div><div><span>Stored palette / seed records</span><strong>{session.questions.length} / {session.questions.length}</strong></div></div>}</section>
      <div className="result-actions"><button className="button button-primary" onClick={onRestart}>重新挑戰 <span>→</span></button><button className="button button-quiet" onClick={onHistory}>查看歷史紀錄</button></div>
      <p className="disclaimer">本測試為螢幕色彩辨識挑戰。dCDT 為本次裝置與顯示條件下的相對估算值，可能受到螢幕顯色、亮度、色彩模式、環境光線及裝置差異影響，不作為醫療診斷依據。</p>
    </main>
  )
}
