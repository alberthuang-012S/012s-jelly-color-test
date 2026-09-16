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
  control: 'CONTROL',
  calibration: 'CALIBRATION',
  adaptive: 'ADAPTIVE TEST',
  anchor: 'SESSION CHECK',
}

export function TestScreen({ engine, spec, plate, onAnswer }: TestScreenProps) {
  const [locked, setLocked] = useState(false)
  const progress = progressPercent(engine)
  const count = questionCountEstimate(engine)
  const totalLabel = count.exact ? `${count.maximumTotal} 題` : `${count.minimumTotal}–${count.maximumTotal} 題`
  useEffect(() => setLocked(false), [spec.id])
  const answer = (value: number | null) => {
    if (locked) return
    setLocked(true)
    onAnswer(value)
  }
  return (
    <main className="page-shell test-page">
      <div className="test-topbar">
        <div className="brand-lockup"><span className="brand-dot" /> JELLY COLOR TEST</div>
        <div className="test-stage"><span className="stage-dot" /> {phaseLabels[spec.phase]}</div>
        <div className="test-progress-label" aria-live="polite"><span className="test-progress-phase">測驗進行中 · </span>已作答 {count.answered} 題 <span className="test-progress-total">/ 預估總題數 {totalLabel}</span></div>
      </div>
      <div className="progress-track" aria-label={`測驗進度 ${progress}%`}><span style={{ width: `${Math.max(4, progress)}%` }} /></div>
      <section className="test-content">
        <div className="test-instruction"><span className="instruction-number">01</span><div><h1>你看到了什麼數字？</h1><p>仔細觀看圓點，輸入你辨識到的數字。</p></div></div>
        <div className="plate-frame"><PlateCanvas plate={plate} /></div>
        <div className="answer-area">
          <p className="answer-label">輸入你的答案，再按確認送出</p>
          <NumberPad key={spec.id} onAnswer={answer} disabled={locked} />
          <p className="no-feedback-note">可用數字鍵輸入 · Enter 送出</p>
        </div>
      </section>
    </main>
  )
}
