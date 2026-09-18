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

const ambientDots: DotPoint[] = Array.from({ length: 156 }, (_, index) => {
  const angle = index * 2.399963229728653
  const radius = 5 + Math.sqrt((index * 47) % 100) * .43
  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * radius}%`,
    size: `${2 + ((index * 13) % 8)}px`,
    delay: `${(index % 11) * -.55}s`,
    tone: index % 29 === 0 ? 'accent' : index % 5 === 0 ? 'warm' : 'soft',
  }
})

const sampleFields = [
  { label: '0', tone: 'violet', code: '01' },
  { label: '1', tone: 'periwinkle', code: '02' },
  { label: '2', tone: 'coral', code: '03' },
  { label: 'S', tone: 'lilac', code: '04' },
] as const

function HeroDotVisual() {
  return (
    <div className="start-visual" aria-hidden="true">
      <div className="start-visual-card">
        <div className="start-dot-field">
          <span className="start-visual-glow" />
          <span className="start-visual-ring start-visual-ring-outer" />
          <span className="start-visual-ring start-visual-ring-inner" />
          <span className="start-visual-field-caption">COLOR FIELD <strong>01</strong></span>
          <span className="start-visual-field-code">u′v′ / 2050 × 012S</span>
          <span className="start-visual-axis start-visual-axis-horizontal" />
          <span className="start-visual-axis start-visual-axis-vertical" />
          {ambientDots.map((dot, index) => <span
            className={`start-dot start-dot-${dot.tone}`}
            key={`ambient-${index}`}
            style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, animationDelay: dot.delay }}
          />)}
          <div className="start-visual-samples">
            {sampleFields.map((sample) => <div className={`start-visual-sample start-visual-sample-${sample.tone}`} key={sample.label}>
              <span className="start-sample-field"><span className="start-sample-glyph">{sample.label}</span></span>
              <span className="start-sample-code">FIELD {sample.code}</span>
            </div>)}
          </div>
          <span className="start-visual-focus" />
        </div>
      </div>
      <div className="start-visual-meta"><span>隱藏數字／圖形示意</span><span>色彩視覺實驗</span></div>
    </div>
  )
}

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
          <p className="start-note"><span className="start-note-mark" aria-hidden="true" />核心快速版約 28–40 題；完成後可選擇補充方向。</p>
        </div>
        <HeroDotVisual />
        <div className="start-hero-actions">
          <button className="button start-primary-cta" type="button" onClick={onStart}>開始測驗 <span aria-hidden="true">→</span></button>
        </div>
      </section>
    </main>
  )
}
