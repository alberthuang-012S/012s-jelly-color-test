import observatoryHero from '../assets/hero-observatory-v1.png'

interface StartScreenProps {
  onStart: () => void
  onHistory: () => void
  sessionCount: number
}

function HeroDotVisual() {
  return (
    <div className="start-visual" aria-hidden="true">
      <div className="start-observatory-stage">
        <img className="start-observatory-image" src={observatoryHero} alt="" />
        <span className="start-observatory-axis start-observatory-axis-horizontal" />
        <span className="start-observatory-axis start-observatory-axis-vertical" />
        <span className="start-observatory-target" />
        <span className="start-observatory-measure" />
        <span className="start-observatory-corner start-observatory-corner-tl" />
        <span className="start-observatory-corner start-observatory-corner-br" />
        <span className="start-observatory-label start-observatory-label-top">CHROMATIC OBSERVATORY <strong>A / 01</strong></span>
        <span className="start-observatory-label start-observatory-label-bottom">DISPLAY-RELATIVE / UV′V′</span>
      </div>
      <div className="start-visual-meta"><span>色彩觀測儀器／主視覺 A</span><span>DISPLAY-RELATIVE</span></div>
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
