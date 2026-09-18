import { useEffect, useState } from 'react'
import { progressPercent, questionCountEstimate } from '../test/scheduler'
import { PlateCanvas } from './PlateCanvas'
import { NumberPad } from './NumberPad'
import type { GeneratedPlate, TestEngineState, TrialSpec } from '../test/types'

interface TestScreenProps {
  engine: TestEngineState
  spec: TrialSpec
  plate: GeneratedPlate
  onAnswer: (answer: number | null) => void
}

export function TestScreen({ engine, spec, plate, onAnswer }: TestScreenProps) {
  const [locked, setLocked] = useState(false)
  const progress = progressPercent(engine)
  const count = questionCountEstimate(engine)
  const currentQuestion = Math.min(count.answered + 1, count.maximumTotal)
  const totalQuestions = count.exact ? `${count.maximumTotal}` : `${count.minimumTotal}–${count.maximumTotal}`
  useEffect(() => setLocked(false), [spec.id])
  const answer = (value: number | null) => {
    if (locked) return
    setLocked(true)
    onAnswer(value)
  }
  return (
    <main className="page-shell test-page test-lab-page">
      <header className="test-topbar test-lab-topbar">
        <div className="brand-lockup brand-text-lockup" aria-label="2050 × 012S 色彩辨識測驗"><strong>2050 × 012S</strong><span>色彩辨識測驗</span></div>
        <div className="test-session-info">
          <div className="test-stage"><span className="stage-dot" /> {engine.mode === 'supplemental' ? '補充方向 · 色彩辨識中' : '快速專業版 · 色彩辨識中'}</div>
          <div className="test-progress-label" aria-live="polite"><strong>第 {currentQuestion} 題 · 約 {totalQuestions} 題</strong></div>
        </div>
      </header>
      <div className="progress-track" aria-label={`測驗進度 ${progress}%`}><span style={{ width: `${Math.max(4, progress)}%` }} /></div>
      <section className="test-content">
        <div className="test-instruction">
          <div className="test-instruction-copy"><span className="instruction-number">{String(currentQuestion).padStart(2, '0')}</span><div><h1>你看到的數字是？</h1><p>仔細觀看色彩圓點，<br />輸入你辨識到的數字。</p></div></div>
        </div>
        <div className="plate-column">
          <div className="plate-frame"><PlateCanvas plate={plate} /></div>
          <p className="plate-caption">依目前畫面條件觀察</p>
        </div>
        <div className="answer-area">
          <h2 className="answer-title">輸入你看到的數字</h2>
          <NumberPad key={spec.id} onAnswer={answer} disabled={locked} />
          <p className="no-feedback-note">可用鍵盤輸入數字 · Enter 送出</p>
        </div>
      </section>
    </main>
  )
}
