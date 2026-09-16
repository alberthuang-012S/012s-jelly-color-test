import { clamp } from './colorSpace'

export interface PsychometricPoint {
  distance: number
  correct: boolean
}

export interface PsychometricFit {
  intercept: number
  slope: number
  threshold75: number
  rmse: number
  quality: number
  converged: boolean
  predict: (distance: number) => number
}

function sigmoid(value: number): number {
  if (value >= 0) {
    const exponent = Math.exp(-value)
    return 1 / (1 + exponent)
  }
  const exponent = Math.exp(value)
  return exponent / (1 + exponent)
}

function solveTwoByTwo(a: number, b: number, c: number, d: number, x: number, y: number): [number, number] | null {
  const determinant = a * d - b * c
  if (Math.abs(determinant) < 1e-12) return null
  return [(d * x - b * y) / determinant, (-c * x + a * y) / determinant]
}

export function fitPsychometricCurve(points: PsychometricPoint[]): PsychometricFit | null {
  const valid = points.filter((point) => Number.isFinite(point.distance) && point.distance > 0)
  const distances = [...new Set(valid.map((point) => point.distance.toFixed(7)))]
  const outcomes = new Set(valid.map((point) => point.correct ? 1 : 0))
  if (valid.length < 6 || distances.length < 3 || outcomes.size < 2) return null

  const reference = 0.02
  const xs = valid.map((point) => Math.log(point.distance / reference))
  const ys = valid.map((point) => (point.correct ? 1 : 0))
  let intercept = 0
  let slope = 3
  let converged = false

  for (let iteration = 0; iteration < 80; iteration += 1) {
    let gradientIntercept = 0
    let gradientSlope = 0
    let h00 = -0.001
    let h01 = 0
    let h11 = -0.001
    xs.forEach((x, index) => {
      const probability = sigmoid(intercept + slope * x)
      const weight = Math.max(1e-5, probability * (1 - probability))
      const residual = ys[index] - probability
      gradientIntercept += residual
      gradientSlope += residual * x
      h00 -= weight
      h01 -= weight * x
      h11 -= weight * x * x
    })
    const delta = solveTwoByTwo(h00, h01, h01, h11, -gradientIntercept, -gradientSlope)
    if (!delta || !delta.every(Number.isFinite)) break
    const damping = 0.65
    intercept += delta[0] * damping
    slope += delta[1] * damping
    if (slope < 0.12) slope = 0.12
    if (Math.abs(delta[0]) + Math.abs(delta[1]) < 1e-5) {
      converged = true
      break
    }
  }

  if (!Number.isFinite(intercept) || !Number.isFinite(slope) || slope <= 0) return null
  const threshold75 = reference * Math.exp((Math.log(0.75 / 0.25) - intercept) / slope)
  if (!Number.isFinite(threshold75) || threshold75 <= 0) return null
  const predictions = xs.map((x) => sigmoid(intercept + slope * x))
  const rmse = Math.sqrt(predictions.reduce((sum, prediction, index) => sum + (prediction - ys[index]) ** 2, 0) / predictions.length)
  const quality = clamp(1 - rmse / 0.5) * 100
  return {
    intercept,
    slope,
    threshold75,
    rmse,
    quality,
    converged,
    predict: (distance: number) => sigmoid(intercept + slope * Math.log(Math.max(distance, 1e-8) / reference)),
  }
}

export function psychometricProbability(distance: number, threshold: number, spread = 0.55): number {
  return 0.5 + 0.5 * sigmoid((distance - threshold) / Math.max(threshold * spread, 0.001))
}
