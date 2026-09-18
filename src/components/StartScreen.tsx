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
  tone: 'soft' | 'warm' | 'accent' | 'green' | 'lime' | 'yellow'
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

const plateDots: DotPoint[] = Array.from({ length: 441 }, (_, index) => {
  const column = index % 21
  const row = Math.floor(index / 21)
  const left = 8 + column * 4.2 + ((index * 17) % 9) / 10 - 0.45
  const top = 8 + row * 4.2 + ((index * 29) % 9) / 10 - 0.45
  const distance = Math.hypot(left - 50, top - 50)
  if (distance > 44) return null
  return {
    left: `${left}%`,
    top: `${top}%`,
    size: `${4.5 + ((index * 13) % 5)}px`,
    delay: `${(index % 13) * -0.45}s`,
    tone: index % 11 === 0 ? 'yellow' : index % 4 === 0 ? 'lime' : 'green',
  }
}).filter((dot): dot is DotPoint => dot !== null)

const hiddenBrandPatterns = [
  ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
]

const digitOffsets = [
  { left: -0.4, top: 0.1 },
  { left: 1.1, top: 1.4 },
  { left: 2.5, top: -0.3 },
]

const hiddenBrandDots = hiddenBrandPatterns.flatMap((rows, digitIndex) => rows.flatMap((row, rowIndex) => [...row].flatMap((cell, columnIndex) => {
  if (cell !== '1') return []
  return digitOffsets.map((offset, offsetIndex) => ({
    left: `${19 + digitIndex * 17.3 + columnIndex * 2.85 + offset.left}%`,
    top: `${29 + rowIndex * 5.7 + offset.top}%`,
    size: `${4.4 + ((digitIndex + rowIndex + columnIndex + offsetIndex) % 4)}px`,
    delay: `${((digitIndex * 4 + rowIndex + offsetIndex) % 10) * -0.55}s`,
  }))
})))

function HeroDotVisual() {
  return (
    <div className="start-visual" aria-hidden="true">
      <div className="start-visual-card">
        <div className="start-dot-field start-dot-plate">
          <span className="start-visual-glow" />
          <span className="start-visual-ring start-visual-ring-outer" />
          <span className="start-visual-ring start-visual-ring-inner" />
          <span className="start-visual-axis start-visual-axis-horizontal" />
          <span className="start-visual-axis start-visual-axis-vertical" />
          {plateDots.map((dot, index) => <span
            className={`start-dot start-dot-${dot.tone}`}
            key={`plate-${index}`}
            style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, animationDelay: dot.delay }}
          />)}
          {hiddenBrandDots.map((dot, index) => <span
            className="start-dot start-dot-digit"
            key={`digit-${index}`}
            style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, animationDelay: dot.delay }}
          />)}
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
          <p className="start-kicker">SAME DOTS, DIFFERENT WORLDS.</p>
          <h1 id="start-title"><span>看見顏色之間</span><span>的<strong>微小差異</strong></span></h1>
          <p className="start-lede">從彩色圓點中找出隱藏的數字。<br />測驗會依你的回答，<br className="start-lede-small-break" />逐步調整色彩差異。</p>
        </div>
        <HeroDotVisual />
        <div className="start-hero-actions">
          <button className="button start-primary-cta" type="button" onClick={onStart}>開始測驗 <span aria-hidden="true">→</span></button>
          <p className="start-note"><span className="start-note-mark" aria-hidden="true" />核心快速版約 28–40 題・3–5 分鐘・動態調整難度</p>
        </div>
      </section>
    </main>
  )
}
