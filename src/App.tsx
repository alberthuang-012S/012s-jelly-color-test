import { useEffect, useMemo, useRef, useState } from 'react'
import { EnvironmentCheck } from './components/EnvironmentCheck'
import { HistoryScreen } from './components/HistoryScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { StartScreen } from './components/StartScreen'
import { TestScreen } from './components/TestScreen'
import { generatePlate } from './plate/generator'
import { readHistory, saveSession } from './storage/history'
import { buildTestSession, readDeviceInfo } from './test/session'
import { createEngineState, recordTrial, selectNextTrial } from './test/scheduler'
import type { TestEngineState, TestSession } from './test/types'

type Screen = 'start' | 'environment' | 'test' | 'results' | 'history'

function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [engine, setEngine] = useState<TestEngineState | null>(null)
  const [session, setSession] = useState<TestSession | null>(null)
  const [history, setHistory] = useState<TestSession[]>(() => readHistory())
  const [startedAt, setStartedAt] = useState<string>('')
  const trialStartedAt = useRef(0)
  const focusInterrupted = useRef(false)
  const spec = useMemo(() => engine ? selectNextTrial(engine) : null, [engine])
  const generated = useMemo(() => {
    try { return { plate: spec ? generatePlate({
    direction: spec.directionId,
    requestedDistance: spec.requestedDistance,
    number: spec.targetNumber,
    seed: spec.seed,
    phase: spec.phase,
    }) : null, error: false } } catch { return { plate: null, error: true } }
  }, [spec])
  const plate = generated.plate

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [screen])

  useEffect(() => {
    if (screen !== 'test' || !spec) return undefined
    trialStartedAt.current = performance.now()
    focusInterrupted.current = false
    const onVisibilityChange = () => {
      if (document.hidden) focusInterrupted.current = true
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [screen, spec?.id])

  const begin = () => {
    setStartedAt(new Date().toISOString())
    setEngine(createEngineState())
    setScreen('test')
  }

  const answer = (value: number | null) => {
    if (!engine || !spec || !plate) return
    const responseTimeMs = Math.max(1, Math.round(performance.now() - trialStartedAt.current))
    const nextEngine = recordTrial(engine, spec, value, responseTimeMs, focusInterrupted.current, plate)
    setEngine(nextEngine)
    if (nextEngine.status === 'complete') {
      const nextSession = buildTestSession(nextEngine, startedAt || new Date().toISOString(), readDeviceInfo())
      setSession(nextSession)
      setHistory(saveSession(nextSession))
      setScreen('results')
    }
  }

  const restart = () => {
    setSession(null)
    setEngine(null)
    setScreen('environment')
  }

  if (screen === 'environment') return <EnvironmentCheck onContinue={begin} onBack={() => setScreen('start')} />
  if (screen === 'test' && generated.error) return <main className="page-shell"><h1>題板未通過品質檢查</h1><p>已停止測量，本次未產生分數。請重新開始。</p><button className="button button-primary" onClick={restart}>重新開始</button></main>
  if (screen === 'test' && engine && spec && plate) return <TestScreen engine={engine} spec={spec} plate={plate} onAnswer={answer} />
  if (screen === 'results' && session) return <ResultsScreen session={session} previousSession={session.resultQualityIndex >= 60 ? history.find((item) => item.id !== session.id && item.resultQualityIndex >= 60 && item.status === 'complete' && item.engineVersion === session.engineVersion) : undefined} onRestart={restart} onHistory={() => setScreen('history')} />
  if (screen === 'history') return <HistoryScreen sessions={history} onBack={() => setScreen(session ? 'results' : 'start')} onStart={restart} />
  return <StartScreen onStart={() => setScreen('environment')} onHistory={() => setScreen('history')} sessionCount={history.length} />
}

export default App
