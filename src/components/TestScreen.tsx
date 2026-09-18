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

const phaseLabels: Record<TrialSpec['phase'], string> = {
  control: '準備階段',
  calibration: '色彩校準',
  adaptive: '色彩挑戰',
  anchor: '穩定性確認',
}

const progressLabels: Record<TrialSpec['phase'], string> = {
  control: '準備中',
  calibration: '色彩校準中',
  adaptive: '色彩辨識中',
  anchor: '穩定性確認中',
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
        <div className="brand-lockup"><span className="brand-dot" /> JELLY COLOR TEST</div>
        <div className="test-session-info">
          <div className="test-stage"><span className="stage-dot" /> {engine.mode === 'supplemental' ? '補充方向 · ' : '快速專業版 · '}{phaseLabels[spec.phase]}</div>
          <div className="test-progress-label" aria-live="polite"><strong>{progressLabels[spec.phase]} · {progress}%</strong><span className="test-progress-secondary">第 {currentQuestion} 題 · 共 {totalQuestions} 題</span></div>
        </div>
      </header>
      <div className="progress-track" aria-label={`測驗進度 ${progress}%`}><span style={{ width: `${Math.max(4, progress)}%` }} /></div>
      <section className="test-content">
        <div className="test-instruction">
          <div className="test-instruction-copy"><span className="instruction-number">{String(currentQuestion).padStart(2, '0')}</span><div><h1>你看到的數字是？</h1><p>仔細觀看色彩圓點，輸入你辨識到的數字。</p></div></div>
          <div className="test-question-count" aria-live="polite"><small>作答進度</small><strong>{count.answered} <span>/</span> {totalQuestions}</strong><em>{count.exact ? '題' : '預估題數'}</em></div>
        </div>
        <div className="plate-column">
          <div className="plate-frame"><PlateCanvas plate={plate} /></div>
          <p className="plate-caption">色彩圓點題板 <span aria-hidden="true">·</span> 依目前畫面條件觀察</p>
        </div>
        <div className="answer-area">
          <div className="answer-panel-heading"><div><span className="answer-panel-kicker">ANSWER</span><strong>輸入你看到的數字</strong></div><span className="answer-panel-index">#{currentQuestion}</span></div>
          <p className="answer-label">輸入答案，再按確認送出</p>
          <p className="answer-help">看不清楚時，直接按「看不出來」。</p>
          <NumberPad key={spec.id} onAnswer={answer} disabled={locked} />
          <p className="no-feedback-note">可用鍵盤輸入數字 · Enter 送出</p>
        </div>
      </section>
    </main>
  )
}
