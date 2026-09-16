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
  return (
    <main className="page-shell results-page readable-report">
      <div className="topbar results-topbar">
        <div className="brand-lockup"><span className="brand-dot" /> JELLY COLOR TEST</div>
        <button className="back-button" onClick={onHistory}>歷史紀錄 →</button>
      </div>
      <section className="report-intro" aria-labelledby="result-title">
        <div className="report-intro-meta"><span className="section-kicker">本次色彩輪廓摘要</span>{isHistorical && <span className="historical-readonly">歷史報告 · 唯讀</span>}<span>已作答 {session.questions.length} 題</span></div>
        <h1 id="result-title">{view.title}</h1>
        <p>{view.summary}</p>
      </section>

      <section className="report-keypoints" aria-label="三項結果重點">
        <article className="report-keypoint report-keypoint-threshold">
          <h2>色差辨識門檻</h2>
          <strong className={view.usable ? 'report-number' : ''}>{view.usable ? formatDcdt(session.overallDcdt) : view.qualityLabel === '資料不足' ? '尚無法估計' : '待重測確認'}</strong>
          <p>{view.usable ? '相同條件下，越低表示本次能辨認的色差越細微。' : '取得足夠且品質合適的資料後，才適合解讀整體門檻。'}</p>
          {view.usable && <small>{view.tentative ? '本次為暫定估計' : '本次相對估計'} · 非百分制分數</small>}
        </article>
        <article className="report-keypoint">
          <h2>回答穩定程度</h2><strong>{view.stabilityLabel}</strong>
          <p>{view.stabilityLabel === '資料不足' ? '目前回答數量還不足以判斷穩定程度。' : view.stabilityLabel === '回答較一致' ? '在不同色差與重測題中，回答模式較一致。' : '部分回答有波動，可搭配重測結果一起看。'}</p>
          <small>描述回答模式，不是能力評分</small>
        </article>
        <article className={`report-keypoint ${view.qualityLabel === '可供參考' ? 'report-keypoint-ready' : 'report-keypoint-caution'}`}>
          <h2>本次結果品質</h2><strong>{view.qualityLabel}</strong><p>{view.qualityReason}</p>
          <small>綜合作答檢查、穩定性與資料完整度</small>
        </article>
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
        <div className="result-actions"><button className="button button-primary" onClick={onRestart}>再測一次 →</button><button className="button button-quiet" onClick={onHistory}>查看歷史</button></div>
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
          <p className="footnote">題目會依回答調整難度，正確率不等於固定難度考卷的成績。資料品質偏低或測驗未完成時，這裡的門檻僅保留作為紀錄。</p>
          <div className="report-table-wrap"><table className="report-method-table">
            <caption>各方向的估計依據</caption>
            <thead><tr><th scope="col">方向</th><th scope="col">門檻</th><th scope="col">方法</th><th scope="col">題數／反轉</th><th scope="col">收斂狀態</th></tr></thead>
            <tbody>{thresholds.map((item) => <tr key={item.directionId}>
              <th scope="row">{item.label ?? item.directionId}</th><td>{formatDcdt(item.threshold)}</td>
              <td>{item.thresholdMethod === 'psychometric' ? '75% 曲線擬合' : item.thresholdMethod === 'reversal-fallback' ? '反轉點備援' : '資料不足'}</td>
              <td>{item.trialCount}／{item.reversalCount}</td><td>{item.insufficientCalibration ? '校準不足' : item.convergenceQuality === 'high' ? '達收斂條件' : '未達收斂條件'}</td>
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
