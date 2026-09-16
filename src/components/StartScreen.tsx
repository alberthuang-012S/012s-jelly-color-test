interface StartScreenProps {
  onStart: () => void
  onHistory: () => void
  sessionCount: number
}

export function StartScreen({ onStart, onHistory, sessionCount }: StartScreenProps) {
  return (
    <main className="page-shell start-page">
      <div className="topbar">
        <div className="brand-lockup"><span className="brand-dot" /> JELLY COLOR TEST</div>
        <span className="eyebrow">PHASE 1 · ADAPTIVE</span>
      </div>
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow accent">HIDDEN NUMBER / 色彩辨識挑戰</p>
          <h1>See the number<br /><em>between colors.</em></h1>
          <p className="hero-lede">
            從一片由彩色圓點組成的 Hidden Number Plate 中，找出你看到的數字。
            測驗會依你的回答細緻調整色差，建立本次螢幕條件下的辨識輪廓。
          </p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={onStart}>開始挑戰 <span>→</span></button>
            <button className="button button-quiet" onClick={onHistory}>查看歷史 {sessionCount > 0 ? `· ${sessionCount}` : ''}</button>
          </div>
          <div className="micro-note"><span className="status-pulse" /> 約 35–50 題 · 約 4 分鐘 · 不即時揭示答案</div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="visual-ring ring-one" />
          <div className="visual-ring ring-two" />
          <div className="jelly-orb">
            <span className="orb-highlight" />
            <span className="orb-face orb-eye-left" />
            <span className="orb-face orb-eye-right" />
            <span className="orb-mouth" />
          </div>
          <div className="visual-label label-top">DISPLAY-RELATIVE</div>
          <div className="visual-label label-bottom">NO DIAGNOSIS</div>
        </div>
      </section>
      <section className="intro-strip">
        <div><span className="strip-index">01</span><strong>找到數字</strong><span>從色點中辨識圖形</span></div>
        <div><span className="strip-index">02</span><strong>輸入答案</strong><span>看不到時選擇「看不出來」</span></div>
        <div><span className="strip-index">03</span><strong>查看輪廓</strong><span>結果只描述這次的相對表現</span></div>
      </section>
    </main>
  )
}
