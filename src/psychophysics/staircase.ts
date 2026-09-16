import { adaptiveConfig } from './config'
import type { ColorDirectionId, StaircaseState } from '../test/types'

export function createStaircase(
  directionId: ColorDirectionId,
  initialDistance: number = adaptiveConfig.initialDistance,
): StaircaseState {
  return {
    directionId,
    currentDistance: initialDistance,
    minDistance: adaptiveConfig.minDistance,
    maxDistance: adaptiveConfig.maxDistance,
    currentStep: adaptiveConfig.baseStep,
    consecutiveCorrect: 0,
    previousMovement: null,
    reversals: [],
    trialCount: 0,
    correctCount: 0,
    converged: false,
    stopped: false,
    convergenceQuality: 'pending',
    insufficientCalibration: false,
  }
}

export function detectReversal(
  previousMovement: StaircaseState['previousMovement'],
  movement: Exclude<StaircaseState['previousMovement'], null>,
): boolean {
  return previousMovement !== null && previousMovement !== movement
}

export function updateStaircase(
  state: StaircaseState,
  correct: boolean,
  config = adaptiveConfig,
  actualDistance = state.currentDistance,
): StaircaseState {
  if (state.stopped) throw new Error('Track already stopped')
  if (!Number.isFinite(actualDistance) || actualDistance <= 0) throw new Error('Invalid presented distance')
  const nextTrialCount = state.trialCount + 1
  const nextCorrectCount = state.correctCount + (correct ? 1 : 0)
  const nextConsecutiveCorrect = correct ? state.consecutiveCorrect + 1 : 0
  let movement: 'harder' | 'easier' | null = null
  if (!correct) movement = 'easier'
  else if (nextConsecutiveCorrect >= 2) movement = 'harder'

  if (!movement) {
    const stopped = shouldStop({ ...state, trialCount: nextTrialCount }, config)
    const converged = nextTrialCount >= config.minimumTrials && state.reversals.length >= config.targetReversals
    return {
      ...state,
      currentDistance: Math.min(config.maxDistance, Math.max(config.minDistance, actualDistance)),
      trialCount: nextTrialCount,
      correctCount: nextCorrectCount,
      consecutiveCorrect: nextConsecutiveCorrect,
      stopped,
      converged,
      convergenceQuality: converged ? 'high' : stopped ? 'low' : 'pending',
    }
  }

  const reversalDistances = [...state.reversals]
  const canMove = movement === 'harder' ? state.currentDistance > config.minDistance + 1e-7 : state.currentDistance < config.maxDistance - 1e-7
  if (canMove && detectReversal(state.previousMovement, movement)) {
    reversalDistances.push(actualDistance)
  }
  const step = config.baseStep * config.stepFactors[Math.min(reversalDistances.length, config.stepFactors.length - 1)]
  const direction = movement === 'harder' ? -1 : 1
  const currentDistance = Math.min(
    config.maxDistance,
    Math.max(config.minDistance, actualDistance + direction * step),
  )
  const nextState: StaircaseState = {
    ...state,
    currentDistance,
    currentStep: step,
    consecutiveCorrect: 0,
    previousMovement: canMove ? movement : state.previousMovement,
    reversals: reversalDistances,
    trialCount: nextTrialCount,
    correctCount: nextCorrectCount,
    converged: false,
    convergenceQuality: reversalDistances.length >= config.targetReversals ? 'high' : 'pending',
  }
  nextState.stopped = shouldStop(nextState, config)
  nextState.converged = nextTrialCount >= config.minimumTrials && reversalDistances.length >= config.targetReversals
  if (nextState.stopped && !nextState.converged) {
    nextState.convergenceQuality = 'low'
  }
  return nextState
}

export function shouldStop(state: Pick<StaircaseState, 'trialCount' | 'reversals'>, config = adaptiveConfig): boolean {
  return (
    state.trialCount >= config.maximumTrials ||
    (state.trialCount >= config.minimumTrials && state.reversals.length >= config.targetReversals)
  )
}
