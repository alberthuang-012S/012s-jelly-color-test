import type { DirectionThreshold, TestSession } from './types'

export function hasThreshold(item: DirectionThreshold): boolean {
  return !item.insufficientCalibration && item.threshold !== undefined && Number.isFinite(item.threshold) && item.threshold > 0
}

export function resultPresentation(session: TestSession) {
  const valid = session.metrics.directionalThresholds.filter(hasThreshold)
  const enough = valid.length >= 2 && Number.isFinite(session.overallDcdt) && (session.overallDcdt ?? 0) > 0
  const incomplete = session.status === 'partial'
  const lowQuality = session.status === 'low-quality' || !Number.isFinite(session.resultQualityIndex) || session.resultQualityIndex < 60
  const tentative = valid.some((item) => item.convergenceQuality !== 'high' || item.thresholdMethod !== 'psychometric')
  const usable = enough && !incomplete && !lowQuality
  const qualityLabel = incomplete || !enough ? '資料不足' : lowQuality || tentative ? '建議重測' : '可供參考'
  const qualityReason = incomplete ? '測驗尚未完成，還需要更多回答。'
    : !enough ? '可用的方向估計不足，暫時無法整理出整體門檻。'
    : lowQuality ? '本次資料品質偏低，門檻先保留在詳細資料中。'
    : tentative ? '部分方向的估計仍不穩定，再測一次會更有參考價值。'
    : '本次資料足以提供相對估計，可搭配之後的重測結果閱讀。'
  const stabilityAvailable = session.questions.filter((item) => item.phase === 'adaptive').length >= 10 && Number.isFinite(session.consistencyIndex)
  const stabilityLabel = !stabilityAvailable ? '資料不足' : session.consistencyIndex >= 85 ? '回答較一致' : '有些波動'
  const suggestions: string[] = []
  if (session.metrics.quality.interruptions > 0) suggestions.push('本次作答曾中斷。下次選一段不受打擾的時間，盡量一次完成。')
  if (!usable || tentative) suggestions.push('休息後再測一次，使用相同裝置、亮度與環境光線，讓兩次結果更容易比較。')
  if (!suggestions.length) suggestions.push('保留這次結果；之後在相同裝置與光線下重測，觀察多次結果是否一致。')
  return {
    usable, tentative, qualityLabel, qualityReason, stabilityLabel, suggestions: suggestions.slice(0, 2),
    title: incomplete ? '這次測驗還沒完成' : !enough ? '再測一次，讓輪廓更完整' : lowQuality ? '這次結果，建議再確認' : '你的色彩辨識結果出爐了',
    summary: !usable ? `${qualityReason}這不表示你的色彩辨識能力有問題。`
      : `本次已取得 ${valid.length} 個色彩方向的可用估計。${tentative ? '部分方向仍有不確定性，建議重測後一起看。' : '回答與測量資料可供參考，以下整理了這次的辨識門檻與方向差異。'}`,
  }
}

export function canCompareResults(current: TestSession, previous?: TestSession): previous is TestSession {
  if (!previous || current.id === previous.id || !current.engineVersion || current.engineVersion !== previous.engineVersion) return false
  if (!resultPresentation(current).usable || !resultPresentation(previous).usable) return false
  // Match recorded display characteristics; physical lighting still needs user consistency.
  return (['viewport', 'devicePixelRatio', 'browser', 'colorDepth', 'colorGamut', 'prefersColorScheme'] as const)
    .every((key) => current.deviceInfo[key] === previous.deviceInfo[key])
}
