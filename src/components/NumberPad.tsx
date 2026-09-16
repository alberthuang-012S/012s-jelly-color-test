interface NumberPadProps {
  onAnswer: (answer: number | null) => void
  disabled?: boolean
}

const options = [6, 12, 29, 45, 74]

export function NumberPad({ onAnswer, disabled = false }: NumberPadProps) {
  return (
    <div className="number-pad" aria-label="數字答案選擇">
      {options.map((number) => <button key={number} className="answer-button" disabled={disabled} onClick={() => onAnswer(number)}>{number}</button>)}
      <button className="answer-button answer-unknown" disabled={disabled} onClick={() => onAnswer(null)}>看不出來 <span>↗</span></button>
    </div>
  )
}
