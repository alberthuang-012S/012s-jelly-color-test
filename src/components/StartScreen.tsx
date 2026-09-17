interface StartScreenProps {
  onStart: () => void
  onHistory: () => void
  sessionCount: number
}

interface DotPoint {
  left: string
  top: string
  size: string
  delay: string
  tone: 'soft' | 'warm' | 'accent'
}

const ambientDots: DotPoint[] = Array.from({ length: 118 }, (_, index) => ({
  left: `${6 + ((index * 47) % 88)}%`,
  top: `${7 + ((index * 61) % 86)}%`,
  size: `${3 + ((index * 13) % 10)}px`,
  delay: `${(index % 9) * -0.7}s`,
  tone: index % 23 === 0 ? 'accent' : index % 4 === 0 ? 'warm' : 'soft',
}))

const hiddenDigitPatterns = [
  ['11110', '10001', '10000', '11110', '00001', '00001', '10001', '01110'],
  ['01110', '10001', '10001', '01110', '10001', '10001', '10001', '01110'],
]

const digitOffsets = [
  { left: 0.6, top: 1.2 },
  { left: 2.6, top: 3.1 },
  { left: 1.4, top: 4.8 },
]

const hiddenDigitDots = hiddenDigitPatterns.flatMap((rows, digitIndex) => rows.flatMap((row, rowIndex) => [...row].flatMap((cell, columnIndex) => {
  if (cell !== '1') return []
  return digitOffsets.map((offset, offsetIndex) => ({
    left: `${24 + digitIndex * 30 + columnIndex * 4.6 + offset.left}%`,
    top: `${21 + rowIndex * 6.8 + offset.top}%`,
    size: `${3.5 + ((digitIndex + rowIndex + columnIndex + offsetIndex) % 3)}px`,
    delay: `${((digitIndex * 4 + rowIndex + offsetIndex) % 10) * -0.6}s`,
  }))
})))

function HeroDotVisual() {
  return (
    <div className="start-visual" aria-hidden="true">
      <div className="start-dot-field">
        <span className="start-visual-axis start-visual-axis-horizontal" />
        <span className="start-visual-axis start-visual-axis-vertical" />
        {ambientDots.map((dot, index) => <span
          className={`start-dot start-dot-${dot.tone}`}
          key={`ambient-${index}`}
          style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, animationDelay: dot.delay }}
        />)}
        {hiddenDigitDots.map((dot, index) => <span
          className="start-dot start-dot-digit"
          key={`digit-${index}`}
          style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, animationDelay: dot.delay }}
        />)}
      </div>
      <div className="start-visual-meta"><span>隱藏數字／圖形示意</span><span>色彩視覺實驗</span></div>
    </div>
  )
}

const previewDirections = [
  { label: '紅－綠雙向軸', value: '0.0184', width: '72%' },
  { label: '藍－黃方向', value: '0.0168', width: '61%' },
  { label: '紫－綠方向', value: '0.0192', width: '76%' },
  { label: '青－紅方向', value: '0.0204', width: '83%' },
]

export function StartScreen({ onStart, onHistory, sessionCount }: StartScreenProps) {
  return (
    <main className="page-shell start-page">
      <header className="start-header">
        <div className="brand-lockup"><span className="brand-dot" /> JELLY COLOR TEST</div>
        <div className="start-header-tools">
          <button className="start-history-button" type="button" onClick={onHistory}>歷史紀錄{sessionCount > 0 && <span className="start-history-count">{sessionCount}</span>}</button>
          <span className="start-code">012S</span>
        </div>
      </header>

      <section className="start-hero" aria-labelledby="start-title">
        <div className="start-hero-copy">
          <p className="start-kicker">01 / 色彩辨識挑戰</p>
          <h1 id="start-title"><span>看見</span><span>顏色之間</span><span>微小的差異。</span></h1>
          <p className="start-lede">從彩色圓點中找出隱藏的數字。<br />測驗會根據你的回答，<br className="start-lede-small-break" />逐步調整色彩差異。</p>
          <p className="start-note"><span className="start-note-mark" aria-hidden="true" />測驗會依你的回答，自動調整難度與長度。</p>
        </div>
        <HeroDotVisual />
        <div className="start-hero-actions">
          <button className="button start-primary-cta" type="button" onClick={onStart}>開始測驗 <span aria-hidden="true">→</span></button>
        </div>
      </section>

      <section className="start-hero-strip" aria-label="測驗特點">
        <div><span className="start-strip-index">01</span><strong>依回答調整難度</strong></div>
        <div><span className="start-strip-index">02</span><strong>建立辨識輪廓</strong></div>
        <div><span className="start-strip-index">03</span><strong>非醫療診斷</strong></div>
      </section>

      <section className="start-section start-method" aria-labelledby="start-method-title">
        <div className="start-section-heading">
          <p className="start-kicker">02 / 測驗方式</p>
          <h2 id="start-method-title">三個步驟，完成<br />一次辨識。</h2>
        </div>
        <div className="start-method-grid">
          <article className="start-method-item"><span>01</span><h3>找出數字</h3><p>從彩色圓點中，辨認你看到的隱藏數字。</p></article>
          <article className="start-method-item"><span>02</span><h3>自動調整</h3><p>測驗會根據每次回答，逐步調整色彩差異。</p></article>
          <article className="start-method-item"><span>03</span><h3>查看結果</h3><p>完成後查看本次色彩辨識門檻與方向差異。</p></article>
        </div>
      </section>

      <section className="start-section start-preview" aria-labelledby="start-preview-title">
        <div className="start-section-heading">
          <p className="start-kicker">03 / 結果預覽</p>
          <h2 id="start-preview-title">完成後，你會看見一份<br />辨識輪廓。</h2>
        </div>
        <div className="start-preview-grid">
          <div className="start-preview-metric"><strong>0.0184</strong><span>色差辨識門檻</span><small>示意資料</small></div>
          <div className="start-preview-directions">
            {previewDirections.map((direction) => <div className="start-preview-direction" key={direction.label}>
              <div className="start-preview-direction-label"><span>{direction.label}</span><small>示意資料</small></div>
              <div className="start-preview-bar" aria-hidden="true"><span style={{ width: direction.width }} /></div>
              <strong>{direction.value}</strong>
            </div>)}
          </div>
        </div>
      </section>

      <section className="start-section start-statement" aria-labelledby="start-statement-title">
        <div className="start-statement-mark" aria-hidden="true" />
        <div className="start-statement-copy">
          <p className="start-kicker">04 / 品牌宣言</p>
          <h2 id="start-statement-title">差異很小，<br />但你可能看得<br className="start-statement-mobile-break" />出來。</h2>
          <p>有些色彩差異一眼就能發現。<br />有些，需要再仔細一點。</p>
        </div>
      </section>

      <section className="start-final-cta" aria-labelledby="start-final-title">
        <div className="start-final-copy">
          <p className="start-final-kicker">05 / 開始</p>
          <h2 id="start-final-title">準備好了嗎？</h2>
          <p>看看你能辨認<br />多細微的色彩差異。</p>
          <button className="button start-final-button" type="button" onClick={onStart}>開始測驗 <span aria-hidden="true">→</span></button>
        </div>
        <span className="start-footer-code">2050 × 012S</span>
      </section>
    </main>
  )
}
