import { useRef, useState } from 'react'

interface NumberPadProps {
  onAnswer: (answer: number | null) => void
  disabled?: boolean
}

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

export function NumberPad({ onAnswer, disabled = false }: NumberPadProps) {
  const [input, setInput] = useState('')
  const submitted = useRef(false)
  const submit = (answer: number | null) => {
    if (disabled || submitted.current) return
    submitted.current = true
    onAnswer(answer)
  }

  return (
    <form className="answer-entry" onSubmit={(event) => {
      event.preventDefault()
      if (input) submit(Number(input))
    }}>
      <input
        className="answer-input"
        aria-label="你的數字答案"
        placeholder="輸入數字"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={2}
        value={input}
        disabled={disabled}
        onChange={(event) => setInput(event.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
      />
      <div className="number-pad" role="group" aria-label="數字鍵盤">
        {digits.map((digit) => <button type="button" key={digit} className={`answer-button${digit === 0 ? ' answer-zero' : ''}`} disabled={disabled || input.length >= 2} onClick={() => setInput((value) => (value + digit).slice(0, 2))}>{digit}</button>)}
        <button type="button" className="answer-button answer-delete" disabled={disabled || !input} onClick={() => setInput((value) => value.slice(0, -1))}>刪除</button>
      </div>
      <button type="submit" className="answer-button answer-submit" disabled={disabled || !input}>確認送出 →</button>
      <button type="button" className="answer-button answer-unknown" disabled={disabled} onClick={() => submit(null)}>看不出來 <span>↗</span></button>
    </form>
  )
}
