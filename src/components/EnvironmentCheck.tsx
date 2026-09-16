interface EnvironmentCheckProps {
  onContinue: () => void
  onBack: () => void
}

export function EnvironmentCheck({ onContinue, onBack }: EnvironmentCheckProps) {
  return (
    <main className="page-shell narrow-page">
      <div className="topbar">
        <button className="back-button" onClick={onBack}>← 返回</button>
        <div className="brand-lockup"><span className="brand-dot" /> JELLY COLOR TEST</div>
        <span className="eyebrow">ENVIRONMENT CHECK</span>
      </div>
      <section className="notice-card">
        <div className="section-kicker">BEFORE YOU BEGIN</div>
        <h1>讓顏色先保持誠實。</h1>
        <p className="muted-copy">顯示條件會影響相對色差。用幾個簡單設定，讓這次結果更容易解讀。</p>
        <div className="environment-list">
          <div className="environment-item"><span className="check-icon">✓</span><div><strong>調整至舒適且足夠的螢幕亮度</strong><span>避免亮度過低造成額外視覺負擔。</span></div></div>
          <div className="environment-item"><span className="check-icon">✓</span><div><strong>避免強烈反光</strong><span>讓螢幕正面保持清楚、均勻的觀看角度。</span></div></div>
          <div className="environment-item"><span className="check-icon">✓</span><div><strong>建議暫時關閉夜間／護眼色溫模式</strong><span>不要使用會主動改變色溫的顯示設定。</span></div></div>
          <div className="environment-item"><span className="check-icon">✓</span><div><strong>想比較歷史結果，盡量使用相同裝置</strong><span>不同手機、面板與瀏覽器會產生不同的顯示條件。</span></div></div>
        </div>
        <div className="privacy-note"><span>⌁</span><div><strong>本機保存，沒有帳號</strong><p>只記錄必要的非敏感技術資料與測驗結果，最多保存 20 次。</p></div></div>
        <button className="button button-primary full-button" onClick={onContinue}>準備好了，開始測驗 <span>→</span></button>
      </section>
    </main>
  )
}
