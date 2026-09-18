import homeHero012S from '../assets/home-hero-012s.png'

interface StartScreenProps {
  onStart: () => void
  onHistory: () => void
  sessionCount: number
}

type FeatureIconName = 'adjust' | 'profile' | 'history'

function FeatureIcon({ name }: { name: FeatureIconName }) {
  if (name === 'adjust') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17V9M12 17V5M19 17v-3" /><path d="M3 19h18" /></svg>
  }

  if (name === 'profile') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12c2.2-4 5.05-6 8.5-6s6.3 2 8.5 6c-2.2 4-5.05 6-8.5 6s-6.3-2-8.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v3M18 4v3M4 9h16" /><rect x="4" y="5" width="16" height="15" rx="2" /></svg>
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
          <button className="button start-header-cta" type="button" onClick={onStart}>開始測驗 <span aria-hidden="true">→</span></button>
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

      <section className="start-feature-grid" id="start-features" aria-label="測驗特色">
        <article className="start-feature-card">
          <span className="start-feature-icon" aria-hidden="true"><FeatureIcon name="adjust" /></span>
          <div><h2>自動調整難度</h2><p>依你的回答，動態調整色彩差異。</p></div>
        </article>
        <article className="start-feature-card">
          <span className="start-feature-icon" aria-hidden="true"><FeatureIcon name="profile" /></span>
          <div><h2>建立辨識輪廓</h2><p>完成測驗後，了解自己的辨識特徵。</p></div>
        </article>
        <article className="start-feature-card">
          <span className="start-feature-icon" aria-hidden="true"><FeatureIcon name="history" /></span>
          <div><h2>保留歷史紀錄</h2><p>追蹤每次測驗，看見辨識變化。</p></div>
        </article>
      </section>
    </main>
  )
}
