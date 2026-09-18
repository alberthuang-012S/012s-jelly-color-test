import { useEffect, useMemo, useRef, useState } from 'react'
import { EnvironmentCheck } from './components/EnvironmentCheck'
import { HistoryScreen } from './components/HistoryScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { StartScreen } from './components/StartScreen'
import { TestScreen } from './components/TestScreen'
import { generatePlate } from './plate/generator'
import { readHistory, saveSession } from './storage/history'
import { latestComparablePrevious } from './test/history'
import { buildTestSession, readDeviceInfo } from './test/session'
import { createEngineState, recordTrial, selectNextTrial } from './test/scheduler'
import { responseTimeMs as trialResponseTimeMs, startTrial, type TrialClock } from './test/trialClock'
import type { ColorDirectionId, TestEngineState, TestSession } from './test/types'

type Screen = 'start' | 'environment' | 'test' | 'results' | 'history'

function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [engine, setEngine] = useState<TestEngineState | null>(null)
  const [session, setSession] = useState<TestSession | null>(null)
  const [history, setHistory] = useState<TestSession[]>(() => readHistory())
  const [viewedSession, setViewedSession] = useState<TestSession | null>(null)
  const [startedAt, setStartedAt] = useState<string>('')
  const trialClock = useRef<TrialClock | null>(null)
  const activeTrialId = useRef<string | null>(null)
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
    if (screen !== 'test' || !spec) {
      trialClock.current = null
      activeTrialId.current = null
      return undefined
    }
    const now = performance.now()
    if (activeTrialId.current !== spec.id || !trialClock.current) {
      activeTrialId.current = spec.id
      trialClock.current = startTrial(now)
      focusInterrupted.current = false
    }
  }, [screen, spec?.id])

  useEffect(() => {
    if (screen !== 'test' || !spec) return undefined
    const onVisibilityChange = () => {
      if (document.hidden) focusInterrupted.current = true
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [screen, spec?.id])

  const begin = () => {
    setStartedAt(new Date().toISOString())
    setViewedSession(null)
    setSession(null)
    setEngine(createEngineState(undefined, true, 'core'))
    setScreen('test')
  }

  const beginSupplemental = (directions: ColorDirectionId[]) => {
    const selected = [...new Set(directions)]
    if (!selected.length) return
    setStartedAt(new Date().toISOString())
    setViewedSession(null)
    const parentSessionId = session?.testMode === 'core' ? session.id : undefined
    setSession(null)
    setEngine(createEngineState(undefined, true, 'supplemental', selected, parentSessionId))
    setScreen('test')
  }

  const answer = (value: number | null) => {
    if (!engine || !spec || !plate) return
    const responseTime = trialClock.current ? trialResponseTimeMs(trialClock.current, performance.now()) : undefined
    if (responseTime === undefined) return
    const nextEngine = recordTrial(engine, spec, value, Math.max(1, Math.round(responseTime)), focusInterrupted.current, plate)
    setEngine(nextEngine)
    if (nextEngine.status === 'complete') {
      const nextSession = buildTestSession(nextEngine, startedAt || new Date().toISOString(), readDeviceInfo())
      setSession(nextSession)
      setViewedSession(null)
      setHistory(saveSession(nextSession))
      setScreen('results')
    }
  }

  const restart = () => {
    setSession(null)
    setViewedSession(null)
    setEngine(null)
    setScreen('environment')
  }

  const showHistory = () => {
    setViewedSession(null)
    setScreen('history')
  }

  const openHistorySession = (item: TestSession) => {
    setViewedSession(item)
    setScreen('results')
  }

  const reportSession = viewedSession ?? session
  const reportPrevious = reportSession ? latestComparablePrevious(reportSession, history) : undefined

  if (screen === 'environment') return <EnvironmentCheck onContinue={begin} onBack={() => setScreen('start')} />
  if (screen === 'test' && generated.error) return <main className="page-shell"><h1>題板未通過品質檢查</h1><p>已停止測量，本次未產生分數。請重新開始。</p><button className="button button-primary" onClick={restart}>重新開始</button></main>
  if (screen === 'test' && engine && spec && plate) return <TestScreen engine={engine} spec={spec} plate={plate} onAnswer={answer} />
  if (screen === 'results' && reportSession) return <ResultsScreen session={reportSession} previousSession={reportPrevious} isHistorical={Boolean(viewedSession)} onRestart={restart} onHistory={showHistory} onStartSupplemental={beginSupplemental} />
  if (screen === 'history') return <HistoryScreen sessions={history} onBack={() => setScreen(session ? 'results' : 'start')} onStart={restart} onOpenSession={openHistorySession} />
  return <StartScreen onStart={() => setScreen('environment')} onHistory={() => setScreen('history')} sessionCount={history.length} />
}

export default App
