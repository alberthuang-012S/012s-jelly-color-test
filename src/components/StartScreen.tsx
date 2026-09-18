import homeHero012S from '../assets/home-hero-012s.png'

interface StartScreenProps {
  onStart: () => void
  onHistory: () => void
  sessionCount: number
}

export function StartScreen({ onStart, onHistory, sessionCount }: StartScreenProps) {
  return (
    <main className="page-shell start-page">
      <header className="start-header">
        <div className="start-brand">
          <span className="start-brand-mark" aria-hidden="true"><i /><i /></span>
          <div className="start-brand-copy">
            <strong>2050 × 012S</strong>
            <span>色彩辨識測驗</span>
          </div>
        </div>
        <div className="start-header-tools">
          <button className="start-history-button" type="button" onClick={onHistory}>歷史紀錄{sessionCount > 0 && <span className="start-history-count">{sessionCount}</span>}</button>
        </div>
      </header>

      <section className="start-hero" id="start-intro" aria-labelledby="start-title">
        <div className="start-hero-copy">
          <p className="start-kicker">SAME DOTS, DIFFERENT WORLDS.</p>
          <h1 id="start-title"><span>看見顏色之間</span><span>的<strong>微小差異</strong></span></h1>
          <p className="start-lede">從彩色圓點中找出隱藏的數字。<br />測驗會依你的回答，逐步調整色彩差異。</p>
        </div>
        <div className="start-hero-actions">
          <button className="button start-primary-cta" type="button" onClick={onStart}>開始測驗 <span aria-hidden="true">→</span></button>
          <p className="start-note"><span className="start-note-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.3 2" /></svg></span>約 3–5 分鐘・動態調整難度</p>
        </div>
        <div className="start-visual" aria-hidden="true">
          <div className="start-hero-art">
            <img className="start-hero-art-image" src={homeHero012S} alt="" />
          </div>
        </div>
      </section>
    </main>
  )
}
