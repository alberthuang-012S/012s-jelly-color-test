interface EnvironmentCheckProps {
  onContinue: () => void
  onBack: () => void
}

type ReminderIconName = 'night-mode' | 'viewing-angle' | 'screen-clarity'

function ReminderIcon({ name }: { name: ReminderIconName }) {
  if (name === 'night-mode') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 3.8a7.6 7.6 0 1 0 4.4 11.9 7.7 7.7 0 0 1-4.4-11.9Z" /><path d="M5.3 5.1h.1M3.9 8.8h.1" /></svg>
  }

  if (name === 'viewing-angle') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.8 12s3.1-5 9.2-5 9.2 5 9.2 5-3.1 5-9.2 5-9.2-5-9.2-5Z" /><circle cx="12" cy="12" r="2.6" /></svg>
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="12" rx="2" /><path d="M8 20h8M12 16v4M7 8h.1M10 8h.1M13 8h.1M16 8h.1M7 11h.1M10 11h.1M13 11h.1M16 11h.1" /></svg>
}

const reminders: Array<{ icon: ReminderIconName; title: string; description: string }> = [
  { icon: 'night-mode', title: '關閉護眼色溫', description: 'Night Shift、夜間模式或護眼模式，可能改變畫面的色溫。' },
  { icon: 'viewing-angle', title: '正面觀看螢幕', description: '盡量以正面角度觀看，避免角度影響顏色與亮度。' },
  { icon: 'screen-clarity', title: '保持畫面清楚', description: '避免明顯反光，並將螢幕亮度調整到舒適程度。' },
]

export function EnvironmentCheck({ onContinue, onBack }: EnvironmentCheckProps) {
  return (
    <main className="page-shell environment-page">
      <header className="environment-topbar">
        <button className="back-button" type="button" onClick={onBack}>← 返回</button>
        <div className="environment-brand" aria-label="2050 × 012S 色彩辨識測驗">
          <strong>2050 × 012S</strong>
          <span>色彩辨識測驗</span>
        </div>
        <span className="environment-topbar-spacer" aria-hidden="true" />
      </header>

      <section className="environment-content" aria-labelledby="environment-title">
        <div className="environment-intro">
          <p className="environment-kicker">測驗前提醒</p>
          <h1 id="environment-title"><span>開始前，</span><span>確認一下觀看環境</span></h1>
          <p className="environment-lede">簡單調整一下環境，<br />讓這次色彩辨識結果更穩定。</p>
        </div>

        <div className="environment-reminders" aria-label="觀看環境提醒">
          {reminders.map((reminder) => (
            <article className="environment-reminder" key={reminder.title}>
              <span className="environment-reminder-icon"><ReminderIcon name={reminder.icon} /></span>
              <div>
                <h2>{reminder.title}</h2>
                <p>{reminder.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="environment-action">
          <button className="button button-primary environment-cta" type="button" onClick={onContinue}>環境已準備好，開始測驗 <span aria-hidden="true">→</span></button>
          <p className="environment-privacy">測驗結果僅保存在此裝置。</p>
        </div>
      </section>

      <footer className="environment-disclaimer" aria-label="測驗說明">
        <p>不同螢幕與觀看環境可能影響結果，建議每次使用相近條件進行測驗。</p>
        <p>本測驗結果不作為醫療診斷。</p>
      </footer>
    </main>
  )
}
