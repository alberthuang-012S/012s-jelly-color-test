// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { generatePlate } from '../plate/generator'
import { TestScreen } from '../components/TestScreen'
import { createEngineState, selectNextTrial } from '../test/scheduler'

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe('test screen answer flow', () => {
  it('renders the plate directly and locks after one normal answer', () => {
    const canvasContext = {
      arc: vi.fn(),
      beginPath: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      fillRect: vi.fn(),
      restore: vi.fn(),
      save: vi.fn(),
    } as unknown as CanvasRenderingContext2D
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(canvasContext)
    const engine = createEngineState(123)
    const spec = selectNextTrial(engine)!
    const plate = generatePlate({
      direction: spec.directionId,
      requestedDistance: spec.requestedDistance,
      number: spec.targetNumber,
      seed: spec.seed,
      phase: spec.phase,
    })
    const onAnswer = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(<TestScreen engine={engine} spec={spec} plate={plate} onAnswer={onAnswer} />)
    })

    expect(container.querySelector('.plate-canvas')).not.toBeNull()
    expect(container.querySelector('.pause-button')).toBeNull()
    expect(container.querySelector('.pause-panel')).toBeNull()

    const targetButton = [...container.querySelectorAll<HTMLButtonElement>('.number-pad .answer-button')]
      .find((button) => button.textContent === '6')
    const submitButton = container.querySelector<HTMLButtonElement>('.answer-submit')!
    expect(targetButton).toBeDefined()
    expect(submitButton.disabled).toBe(true)

    act(() => targetButton!.click())
    expect(submitButton.disabled).toBe(false)
    act(() => submitButton.click())
    expect(onAnswer).toHaveBeenCalledTimes(1)
    expect(onAnswer).toHaveBeenCalledWith(6)
    expect(submitButton.disabled).toBe(true)

    act(() => submitButton.click())
    expect(onAnswer).toHaveBeenCalledTimes(1)

    act(() => root.unmount())
    container.remove()
    getContext.mockRestore()
  })
})
