import type { DirectionThreshold, TestSession } from './types'

export function hasThreshold(item: DirectionThreshold): boolean {
  return !item.insufficientCalibration && item.threshold !== undefined && Number.isFinite(item.threshold) && item.threshold > 0
}

function thresholdsFor(session: TestSession): DirectionThreshold[] {
  return session.metrics?.directionalThresholds ?? session.directionalThresholds ?? []
}

function questionsFor(session: TestSession) {
  return session.questions ?? []
}

export function resultPresentation(session: TestSession) {
  const valid = thresholdsFor(session).filter(hasThreshold)
  const enough = valid.length >= 2 && Number.isFinite(session.overallDcdt) && (session.overallDcdt ?? 0) > 0
  const incomplete = session.status !== 'complete' && session.status !== 'low-quality'
  const lowQuality = session.status === 'low-quality' || !Number.isFinite(session.resultQualityIndex) || session.resultQualityIndex < 60
  const tentative = valid.some((item) => item.convergenceQuality !== 'high' || item.thresholdMethod !== 'psychometric')
  const usable = enough && session.status === 'complete' && !incomplete && !lowQuality
  const qualityLabel = incomplete || !enough ? '資料不足' : lowQuality ? '資料品質較低' : '可供參考'
  const qualityReason = incomplete ? '測驗尚未完成，目前記錄的回答仍不完整。'
    : !enough ? '可用的方向資料較少，尚未整理出整體門檻。'
    : lowQuality ? '本次資料品質較低，門檻數值保留在詳細資料中。'
    : tentative ? '部分方向採用備援估計，完整方式列在詳細資料中。'
    : '本次資料已整理成相對估計，可搭配其他紀錄閱讀。'
  const stabilityAvailable = questionsFor(session).filter((item) => item.phase === 'adaptive').length >= 10 && Number.isFinite(session.consistencyIndex)
  const stabilityLabel = !stabilityAvailable ? '資料不足' : session.consistencyIndex >= 85 ? '回答較一致' : '回答有差異'
  const suggestions: string[] = []
  if ((session.metrics?.quality?.interruptions ?? 0) > 0) suggestions.push('本次作答曾中斷畫面；詳細資料已記錄，閱讀結果時一併參考。')
  if (!usable) suggestions.push('本次先查看已記錄的作答與方向資料；整體門檻欄位尚未列入摘要。')
  else if (tentative) suggestions.push('各方向的估計方式與題數已列在詳細資料，可一併閱讀。')
  if (!suggestions.length) suggestions.push('在相同裝置與光線條件下保留多次紀錄，方便閱讀自身變化。')
  return {
    usable, tentative, qualityLabel, qualityReason, stabilityLabel, suggestions: suggestions.slice(0, 2),
    title: incomplete ? '這次測驗尚未完成' : !enough ? '目前資料較少' : lowQuality ? '這次資料品質較低' : '你的色彩辨識結果出爐了',
    summary: !usable ? qualityReason
      : `本次已取得 ${valid.length} 個色彩方向的可用估計。${tentative ? '部分方向採用備援估計，以下整理各方向的估計方式與差異。' : '以下整理這次的辨識門檻與方向差異。'}`,
  }
}

export function canCompareResults(current: TestSession, previous?: TestSession): previous is TestSession {
  if (!previous || current.id === previous.id || !current.engineVersion || current.engineVersion !== previous.engineVersion) return false
  if (!resultPresentation(current).usable || !resultPresentation(previous).usable) return false
  // Match recorded display characteristics; physical lighting still needs user consistency.
  if (!current.deviceInfo || !previous.deviceInfo) return false
  return (['viewport', 'devicePixelRatio', 'browser', 'colorDepth', 'colorGamut', 'prefersColorScheme'] as const)
    .every((key) => current.deviceInfo[key] === previous.deviceInfo[key])
}
