// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { EnvironmentCheck } from '../components/EnvironmentCheck'

describe('pre-test environment reminder', () => {
  it('starts immediately without checkbox gating and keeps navigation actions', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const onContinue = vi.fn()
    const onBack = vi.fn()
    const root = createRoot(container)

    act(() => {
      root.render(<EnvironmentCheck onContinue={onContinue} onBack={onBack} />)
    })

    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(0)
    expect(container.querySelectorAll('.environment-reminder')).toHaveLength(3)

    const startButton = container.querySelector('.environment-cta') as HTMLButtonElement
    expect(startButton.disabled).toBe(false)
    act(() => startButton.click())
    expect(onContinue).toHaveBeenCalledTimes(1)

    const backButton = container.querySelector('.back-button') as HTMLButtonElement
    act(() => backButton.click())
    expect(onBack).toHaveBeenCalledTimes(1)

    act(() => root.unmount())
    container.remove()
  })
})
