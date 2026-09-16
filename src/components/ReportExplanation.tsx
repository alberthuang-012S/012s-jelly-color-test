import type { TestSession } from '../test/types'

export function reportSummary(session: TestSession): string {
  const thresholds = session.metrics.directionalThresholds
  const valid = thresholds.filter((item) => item.threshold !== undefined && Number.isFinite(item.threshold) && !item.insufficientCalibration)
  if (session.status === 'partial') return '本次測驗未完成。已記錄的作答資料保留在下方，整體門檻未列入摘要。'
  if (session.resultQualityIndex < 60) return '本次資料品質較低；已記錄的門檻與方向資料保留在下方。'
  if (valid.length < 2 || session.overallDcdt === undefined || !Number.isFinite(session.overallDcdt)) return '目前可用的方向資料少於整體門檻摘要所需數量，因此未列出整體門檻。'
  const fallback = valid.filter((item) => item.thresholdMethod === 'reversal-fallback').length
  const lowConvergence = valid.some((item) => item.convergenceQuality !== 'high')
  return `本次以 ${valid.length} 個可用方向的門檻中位數，形成整體相對估計 ${session.overallDcdt.toFixed(4)} nominal Δu′v′。${fallback ? `其中 ${fallback} 個方向採反轉點備援估計。` : '各可用方向採用心理計量曲線的 75% 預測正確率門檻。'}${lowConvergence ? '部分方向的資料量較少，各方向數值請搭配方法與題數閱讀。' : '各可用方向均達到本工具設定的資料條件。'}`
}

export function ReportExplanation({ session }: { session: TestSession }) {
  const thresholds = session.metrics.directionalThresholds
  const adaptiveCount = session.questions.filter((item) => item.phase === 'adaptive').length
  const failedCalibration = thresholds.filter((item) => item.insufficientCalibration)
  return (
    <section className="result-section report-explanation" aria-labelledby="report-explanation-title">
      <div className="section-heading"><div><span className="section-kicker">05 / INTERPRETATION &amp; METHODS</span><h2 id="report-explanation-title">測量結果，與它能支持的解讀。</h2></div></div>
      <div className="report-summary"><h3>本次報告摘要</h3><p>{reportSummary(session)}</p><p className="report-meta">共 {session.questions.length} 題，其中 {adaptiveCount} 題為自適應測量。引擎版本：{session.engineVersion ?? '舊版／未記錄'}。</p>
        {failedCalibration.length > 0 && <p>Direction {failedCalibration.map((item) => item.directionId).join('、')} 未通過校準，不提供該方向門檻，也不將其當成零分。</p>}
      </div>
      <div className="report-reading-grid">
        <article><h3>01 / 四項指標如何閱讀</h3><dl>
          <dt>dCDT｜顯示條件下的相對門檻</dt><dd>在可比較的條件下，數值越小表示本次估計能辨認較細微的色差。整體值為至少兩個可用方向的中位數，用來描述本次相對表現。</dd>
          <dt>CA｜色彩題正確率</dt><dd>統計有效的非 control 題，包括校準、自適應及 anchor 題。題目會隨回答變難或變易，因此正確率不是固定難度考卷的分數；應與其他指標一起閱讀。</dd>
          <dt>CI｜回答一致性</dt><dd>由 anchor 回答一致程度（40%）、方向內單調性（30%）及擬合品質（30%）組成，用來描述回答模式；缺乏擬合資料時分數也會降低。</dd>
          <dt>RQI｜本次資料品質</dt><dd>由 control 表現（30%）、CI（30%）、作答時序（20%）與資料完整度（20%）組成，用來描述本次資料的完整度與作答條件。</dd>
        </dl></article>
        <article><h3>02 / 門檻如何估計</h3><p>先進行基本 control 與各方向校準，再交錯測量三條方向。每個方向連續答對兩次後降低色差，答錯一次則提高色差；每方向測量 10–18 題，以至少 7 次難度反轉作為資料完成條件之一。</p><p>「FIT」使用有效自適應題擬合曲線，估算預測正確率達 75% 時的色差；只有擬合條件完成且門檻落在已測色差範圍內才採用。75% 是模型準則，不是整份測驗得分。</p><p>「REVERSAL」在 FIT 不可用時，取最後四個有效反轉點的中位數作為備援摘要。到達題數上限只代表停止測量。</p><p>Anchor 為同色差的重複題，用於觀察一致性，不參與門檻擬合。答題速度與畫面中斷用於資料品質提示。</p></article>
        <article><h3>03 / 品質等級與資料條件</h3><p>RQI ≥ 90：HIGH；75–89：GOOD；60–74：MODERATE；低於 60：LOW。這些是本工具的工程分級，用來描述本次資料狀態。低於 60 的紀錄保留，但不納入預設比較。</p><p>「資料不足」表示校準、有效觀察或估計條件未完成；該方向不列入整體門檻。方向 A／B 為相反色彩極性，用來區分測量方向。</p><p>報告目前不提供常模或百分位。小數位數是顯示格式；單次數值請放在相同條件的個人紀錄中閱讀。</p></article>
        <article><h3>04 / 個人紀錄比較</h3><p>建立個人紀錄時，維持相同裝置、螢幕亮度、色彩模式、觀看距離及環境光線，並避免測量途中切換畫面。在相同條件下保存多次結果，方便閱讀自身變化。</p><p>只比較同一引擎版本、資料品質足夠且有可用門檻的結果。裝置條件即使有紀錄，也不代表實體螢幕已校正；跨裝置或跨版本的數值不宜直接比較。</p><p>nominal Δu′v′ 是由繪製色彩計算的名義色差，不是儀器量測的面板光譜輸出。</p></article>
      </div>
    </section>
  )
}
