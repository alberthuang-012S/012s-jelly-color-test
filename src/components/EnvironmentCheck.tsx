import { useState } from 'react'
import { allEnvironmentChecksConfirmed, environmentChecks, type EnvironmentCheckId, type EnvironmentCheckState } from '../test/environment'

interface EnvironmentCheckProps {
  onContinue: () => void
  onBack: () => void
}

export function EnvironmentCheck({ onContinue, onBack }: EnvironmentCheckProps) {
  const [checks, setChecks] = useState<EnvironmentCheckState>({
    'night-mode': false,
    reflection: false,
    'viewing-angle': false,
    brightness: false,
  })
  const toggle = (id: EnvironmentCheckId) => setChecks((current) => ({ ...current, [id]: !current[id] }))
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
          <label className={`environment-item environment-check-item${checks['night-mode'] ? ' is-checked' : ''}`}><input type="checkbox" checked={checks['night-mode']} onChange={() => toggle('night-mode')} /><span className="check-icon">✓</span><span><strong>已關閉 Night Shift／護眼色溫</strong><small>避免顯示設定主動改變色溫。</small></span></label>
          <label className={`environment-item environment-check-item${checks.reflection ? ' is-checked' : ''}`}><input type="checkbox" checked={checks.reflection} onChange={() => toggle('reflection')} /><span className="check-icon">✓</span><span><strong>螢幕沒有明顯反光</strong><small>讓畫面保持清楚、均勻。</small></span></label>
          <label className={`environment-item environment-check-item${checks['viewing-angle'] ? ' is-checked' : ''}`}><input type="checkbox" checked={checks['viewing-angle']} onChange={() => toggle('viewing-angle')} /><span className="check-icon">✓</span><span><strong>會以正面角度觀看</strong><small>避免視角影響顏色與亮度。</small></span></label>
          <label className={`environment-item environment-check-item${checks.brightness ? ' is-checked' : ''}`}><input type="checkbox" checked={checks.brightness} onChange={() => toggle('brightness')} /><span className="check-icon">✓</span><span><strong>亮度足夠且觀看舒適</strong><small>避免過暗造成額外視覺負擔。</small></span></label>
        </div>
        <div className="privacy-note"><span>⌁</span><div><strong>本機保存，沒有帳號</strong><p>只記錄必要的非敏感技術資料與測驗結果，最多保存 20 次。</p></div></div>
        <p className="environment-confirm-note">這只是你的環境確認，不代表螢幕已完成實體校正。</p>
        <button className="button button-primary full-button" disabled={!allEnvironmentChecksConfirmed(checks)} onClick={onContinue}>我已確認以上條件，開始測驗 <span>→</span></button>
      </section>
    </main>
  )
}
