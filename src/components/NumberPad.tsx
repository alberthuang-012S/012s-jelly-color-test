import { useEffect, useRef, useState } from 'react'

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (disabled || submitted.current || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault()
        setInput((value) => (value + event.key).slice(0, 2))
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()
        setInput((value) => value.slice(0, -1))
      } else if (event.key === 'Enter' && !(event.target instanceof HTMLButtonElement)) {
        event.preventDefault()
        if (input) submit(Number(input))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [input, disabled, onAnswer])

  return (
    <form className="answer-entry" onSubmit={(event) => {
      event.preventDefault()
      if (input) submit(Number(input))
    }}>
      <div className="answer-display-row"><input
        className="answer-input"
        aria-label="你的數字答案"
        placeholder="輸入數字"
        type="text"
        inputMode="none"
        readOnly
        autoComplete="off"
        maxLength={2}
        value={input}
        disabled={disabled}
      />
      <button type="button" className="answer-button answer-delete" aria-label="刪除最後一位數字" disabled={disabled || !input} onClick={() => setInput((value) => value.slice(0, -1))}>⌫</button></div>
      <div className="number-pad" role="group" aria-label="數字鍵盤">
        {digits.map((digit) => <button type="button" key={digit} className={`answer-button${digit === 0 ? ' answer-zero' : ''}`} disabled={disabled || input.length >= 2} onClick={() => setInput((value) => (value + digit).slice(0, 2))}>{digit}</button>)}
      </div>
      <div className="answer-actions">
      <button type="submit" className="answer-button answer-submit" disabled={disabled || !input}>確認送出 →</button>
      <button type="button" className="answer-button answer-unknown" disabled={disabled} onClick={() => submit(null)}>看不出來 <span>↗</span></button>
      </div>
    </form>
  )
}
