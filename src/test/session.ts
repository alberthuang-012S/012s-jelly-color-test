import { calculateAllMetrics } from '../psychophysics/metrics'
import type { DeviceInfo, TestEngineState, TestSession } from './types'

export function readDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return { viewport: 'unknown', devicePixelRatio: 1, browser: 'unknown', colorDepth: 0, prefersColorScheme: 'unknown', colorGamut: 'unknown' }
  }
  const colorGamut = window.matchMedia('(color-gamut: p3)').matches ? 'p3' : 'srgb'
  return {
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    devicePixelRatio: window.devicePixelRatio,
    browser: navigator.userAgent,
    colorDepth: window.screen.colorDepth,
    prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    colorGamut,
  }
}

export function buildTestSession(engine: TestEngineState, startedAt: string, deviceInfo: DeviceInfo): TestSession {
  const metrics = calculateAllMetrics(engine)
  const status = engine.status === 'complete' ? (metrics.quality.score < 60 ? 'low-quality' : 'complete') : 'partial'
  return {
    id: `session-${Date.now()}`,
    engineVersion: 'uv3-open-response-100-targets',
    startedAt,
    completedAt: new Date().toISOString(),
    deviceInfo,
    questions: engine.questions,
    directionalThresholds: metrics.directionalThresholds,
    overallDcdt: metrics.overallDcdt,
    chromaticAccuracy: metrics.chromaticAccuracy,
    consistencyIndex: metrics.consistency.score,
    resultQualityIndex: metrics.quality.score,
    status,
    metrics,
  }
}
