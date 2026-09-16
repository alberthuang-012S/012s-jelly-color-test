import type { TestSession } from '../test/types'

export function reportSummary(session: TestSession): string {
  const thresholds = session.metrics.directionalThresholds
  const valid = thresholds.filter((item) => item.threshold !== undefined && Number.isFinite(item.threshold) && !item.insufficientCalibration)
  if (session.status === 'partial') return '本次測驗未完成。已記錄的資料僅供檢視作答過程，不宜作為完整的辨識門檻或趨勢比較。'
  if (session.resultQualityIndex < 60) return '本次資料品質未達本工具的趨勢比較條件。即使顯示了門檻估計，也應視為暫定值；建議排除中斷因素後重新測量。'
  if (valid.length < 2 || session.overallDcdt === undefined || !Number.isFinite(session.overallDcdt)) return '目前可用方向不足，或尚未形成可解讀的整體估計，因此不提供整體門檻。資料不足不等於辨識能力異常。'
  const fallback = valid.filter((item) => item.thresholdMethod === 'reversal-fallback').length
  const lowConvergence = valid.some((item) => item.convergenceQuality !== 'high')
  return `本次以 ${valid.length} 個可用方向的門檻中位數，形成整體相對估計 ${session.overallDcdt.toFixed(4)} nominal Δu′v′。${fallback ? `其中 ${fallback} 個方向採反轉點備援估計，並非由 75% 擬合門檻直接得出。` : '各可用方向採用心理計量曲線的 75% 預測正確率門檻。'}${lowConvergence ? '部分方向未達完整收斂，建議搭配方向資料與重測結果審慎解讀。' : '各可用方向均達到本工具設定的收斂條件；這不等同於臨床驗證。'}`
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
          <dt>dCDT｜顯示條件下的相對門檻</dt><dd>在可比較的條件下，數值越小表示本次估計能辨認較細微的色差。整體值為至少兩個可用方向的中位數，不是百分位、視力值，也不是「正常／異常」分界。</dd>
          <dt>CA｜色彩題正確率</dt><dd>統計有效的非 control 題，包括校準、自適應及 anchor 題。題目會隨回答變難或變易，因此正確率不是固定難度考卷的分數；不可只用 CA 高低判斷能力進退。</dd>
          <dt>CI｜回答一致性</dt><dd>由 anchor 回答一致程度（40%）、方向內單調性（30%）及擬合品質（30%）組成。它描述回答模式，不是診斷準確率；缺乏擬合資料也會降低分數。</dd>
          <dt>RQI｜本次資料品質</dt><dd>由 control 表現（30%）、CI（30%）、作答時序（20%）與資料完整度（20%）組成。它不代表色覺能力，也不是結果正確的機率。</dd>
        </dl></article>
        <article><h3>02 / 門檻如何估計</h3><p>先進行基本 control 與各方向校準，再交錯測量三條方向。每個方向連續答對兩次後降低色差，答錯一次則提高色差；每方向測量 10–18 題，以至少 7 次難度反轉作為收斂條件之一。</p><p>「FIT」使用有效自適應題擬合曲線，估算預測正確率達 75% 時的色差；只有擬合收斂且門檻落在已測色差範圍內才採用。75% 是模型準則，不是你的整份測驗得分。</p><p>「REVERSAL」是擬合不可用時，取最後四個有效反轉點的中位數作為備援摘要；它不等同於已驗證的 75% 門檻。到達題數上限只代表停止測量，不代表真正收斂。</p><p>Anchor 為同色差的重測題，用於觀察一致性，不參與門檻擬合。答題速度與畫面中斷用於資料品質提示，不直接扣減辨色能力指標。</p></article>
        <article><h3>03 / 品質等級與不確定性</h3><p>RQI ≥ 90：HIGH；75–89：GOOD；60–74：MODERATE；低於 60：LOW。這些是本工具的工程分級，不是臨床分級。低於 60 的紀錄保留，但不納入預設比較。</p><p>「資料不足」表示校準、有效觀察或估計條件未滿足；不能據此推論某方向能力差。方向 A／B 為相反色彩極性，並非三條相互獨立的臨床診斷軸。</p><p>目前不提供信賴區間、常模或百分位。小數位數只是顯示格式，不代表同等程度的量測精度；單次的小幅差異不應解讀為能力變化。</p></article>
        <article><h3>04 / 重測與比較條件</h3><p>重測時維持相同裝置、螢幕亮度、色彩模式、觀看距離及環境光線，並避免測量途中切換畫面。先充分休息，再觀察多次測量是否呈現一致趨勢。</p><p>只比較同一引擎版本、資料品質足夠且有可用門檻的結果。裝置條件即使有紀錄，也不代表實體螢幕已校正；跨裝置或跨版本的數值不宜直接比較。</p><p>nominal Δu′v′ 是由繪製色彩計算的名義色差，不是儀器量測的面板光譜輸出。本報告不判定色盲、色弱或疾病，也不能替代專業色覺檢查。</p></article>
      </div>
    </section>
  )
}
