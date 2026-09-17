import { useState } from 'react'
import { DirectionProfile } from './DirectionProfile'
import { DifficultyCurve } from './DifficultyCurve'
import { QualityPanel } from './QualityPanel'
import { ReportExplanation } from './ReportExplanation'
import { canCompareResults, resultPresentation } from '../test/report'
import type { TestSession } from '../test/types'

interface ResultsScreenProps {
  session: TestSession
  previousSession?: TestSession
  isHistorical?: boolean
  onRestart: () => void
  onHistory: () => void
}

function formatDcdt(value: number | undefined): string {
  return value === undefined || !Number.isFinite(value) ? '資料不足' : value.toFixed(4)
}

export function ResultsScreen({ session, previousSession, isHistorical = false, onRestart, onHistory }: ResultsScreenProps) {
  const [advanced, setAdvanced] = useState(false)
  const view = resultPresentation(session)
  const comparable = canCompareResults(session, previousSession)
  const sameDisplayedValue = comparable && formatDcdt(session.overallDcdt) === formatDcdt(previousSession.overallDcdt)
  const thresholds = session.metrics?.directionalThresholds ?? session.directionalThresholds ?? []
  const chromaticAccuracy = Number.isFinite(session.chromaticAccuracy) ? `${session.chromaticAccuracy.toFixed(1)}%` : '資料不足'
  const consistencyIndex = Number.isFinite(session.consistencyIndex) ? session.consistencyIndex : '資料不足'
  const qualityIndex = Number.isFinite(session.resultQualityIndex) ? session.resultQualityIndex : '資料不足'
  const displayedDcdt = view.usable ? formatDcdt(session.overallDcdt) : view.qualityLabel === '資料不足' ? '尚無法估計' : '目前未列出'
  return (
    <main className="page-shell results-page readable-report premium-report">
      <div className="topbar results-topbar">
        <div className="brand-lockup"><span className="brand-dot" /> JELLY COLOR TEST</div>
        <button className="back-button" type="button" onClick={onHistory}>歷史紀錄 →</button>
      </div>
      <section className="report-hero" aria-labelledby="result-title">
        <div className="report-hero-copy">
          <div className="report-intro-meta"><span className="section-kicker">本次色彩輪廓摘要</span>{isHistorical && <span className="historical-readonly">歷史報告 · 唯讀</span>}<span>已作答 {session.questions.length} 題</span></div>
          <span className="report-hero-overline">PERSONAL COLOR PROFILE</span>
          <h1 id="result-title">{view.title}</h1>
          <p className="report-hero-summary">{view.summary}</p>
          <div className="report-hero-status"><span aria-hidden="true" />測驗完成 · 本頁整理本次相對表現</div>
        </div>
        <article className="report-dcdt-card" aria-label="整體 dCDT 結果">
          <div className="report-card-label"><span>OVERALL</span><strong>dCDT</strong></div>
          <strong className={`report-dcdt-value${view.usable ? '' : ' report-dcdt-value-text'}`}>{displayedDcdt}</strong>
          <span className="report-dcdt-unit">nominal Δu′v′</span>
          <p>{view.usable ? '在相同顯示條件下，數值越低代表本次能辨認的色差越細微。' : '目前未整理整體門檻；已記錄的方向資料保留在下方。'}</p>
          {view.usable && <small>{view.tentative ? '本次方向估計' : '本次相對估計'} · 非百分制分數</small>}
        </article>
      </section>

      <section className="report-keypoints report-secondary-metrics" aria-label="回答與資料重點">
        <article className="report-keypoint report-keypoint-consistency">
          <div className="report-keypoint-heading"><span className="report-keypoint-icon">CI</span><h2>回答一致程度</h2></div>
          <strong>{view.stabilityLabel}</strong>
          <p>{view.stabilityLabel === '資料不足' ? '目前回答資料較少。' : view.stabilityLabel === '回答較一致' ? '不同色差與重複題中的回答模式較一致。' : '不同題目的回答模式有差異。'}</p>
          <small>回答一致性（CI） · {consistencyIndex} / 100</small>
        </article>
        <article className={`report-keypoint report-keypoint-quality ${view.usable ? 'report-keypoint-ready' : 'report-keypoint-caution'}`}>
          <div className="report-keypoint-heading"><span className="report-keypoint-icon">RQI</span><h2>本次資料品質</h2></div>
          <strong>{view.qualityLabel}</strong>
          <p>{view.qualityReason}</p>
          <small>資料品質（RQI） · {qualityIndex} / 100</small>
        </article>
      </section>

      <section className="report-reading-note" aria-label="結果閱讀提示">
        <span className="section-kicker">HOW TO READ</span>
        <p>先看整體 dCDT，再看下方三個色彩方向；方向數值能幫助你理解本次輪廓的差異。</p>
      </section>

      <DirectionProfile thresholds={thresholds} usable={view.usable} />
      <section className="report-next" aria-labelledby="report-next-title">
        <div className="section-heading"><div><span className="section-kicker">接下來可以這樣做</span><h2 id="report-next-title">讓下一次結果更有參考價值</h2></div></div>
        <ul className="report-suggestions">{view.suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}</ul>
        {comparable && <div className="report-comparison">
          <h3>與上一次相比</h3>
          <div><span>上次 <strong>{formatDcdt(previousSession.overallDcdt)}</strong></span><span aria-hidden="true">→</span><span>本次 <strong>{formatDcdt(session.overallDcdt)}</strong></span></div>
          <p>{sameDisplayedValue ? '兩次顯示值相同。' : session.overallDcdt! < previousSession.overallDcdt! ? '本次估計門檻較低。' : '本次估計門檻較高。'}單次差異不一定代表能力改變，請在相同顯示與光線條件下觀察多次結果。</p>
        </div>}
        <div className="result-actions"><button className="button button-primary" type="button" onClick={onRestart}>再測一次 →</button><button className="button button-quiet" type="button" onClick={onHistory}>查看歷史</button></div>
      </section>

      <section className="report-details">
        <button className="advanced-toggle" aria-expanded={advanced} aria-controls="report-detail-content" onClick={() => setAdvanced((value) => !value)}>
          <span aria-hidden="true">{advanced ? '−' : '+'}</span>{advanced ? '收起詳細資料' : '展開查看詳細資料'}<small>作答紀錄・測量方法</small>
        </button>
        {advanced && <div id="report-detail-content">
          <h2 className="report-detail-title">作答紀錄與測量數值</h2>
          <dl className="report-records">
            <div><dt>作答題數</dt><dd>{session.questions.length} 題</dd></div>
            <div><dt>非檢查題正確率（CA）</dt><dd>{chromaticAccuracy}</dd></div>
            <div><dt>回答一致性（CI）</dt><dd>{consistencyIndex} / 100</dd></div>
            <div><dt>資料品質（RQI）</dt><dd>{qualityIndex} / 100</dd></div>
            <div><dt>整體門檻（dCDT）</dt><dd>{formatDcdt(session.overallDcdt)}{Number.isFinite(session.overallDcdt) && ' nominal Δu′v′'}</dd></div>
            <div><dt>引擎版本</dt><dd>{session.engineVersion ?? '未記錄'}</dd></div>
          </dl>
          <p className="footnote">題目會依回答調整難度，正確率不等於固定難度考卷的成績。門檻採本次已記錄的方向資料整理。</p>
          <div className="report-table-wrap"><table className="report-method-table">
            <caption>各方向的估計依據</caption>
            <thead><tr><th scope="col">方向</th><th scope="col">門檻</th><th scope="col">方法</th><th scope="col">題數／反轉</th><th scope="col">資料狀態</th></tr></thead>
            <tbody>{thresholds.map((item) => <tr key={item.directionId}>
              <th scope="row">{item.label ?? item.directionId}</th><td>{formatDcdt(item.threshold)}</td>
              <td>{item.thresholdMethod === 'psychometric' ? '75% 曲線擬合' : item.thresholdMethod === 'reversal-fallback' ? '反轉點備援' : '資料不足'}</td>
              <td>{item.trialCount}／{item.reversalCount}</td><td>{item.insufficientCalibration ? '校準不足' : item.convergenceQuality === 'high' ? '資料條件完成' : '資料條件未完成'}</td>
            </tr>)}</tbody>
          </table></div>
          {session.metrics?.difficultyCurve && <DifficultyCurve curve={session.metrics.difficultyCurve} />}
          {session.metrics?.quality && <QualityPanel session={session} />}
          {session.metrics && <ReportExplanation session={session} />}
        </div>}
      </section>
      <p className="disclaimer">本結果描述本次螢幕條件下的相對表現，不作為醫療診斷。</p>
    </main>
  )
}
