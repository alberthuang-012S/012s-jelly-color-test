import { adaptiveConfig, stepSizeForReversals } from './config'
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
): StaircaseState {
  const nextTrialCount = state.trialCount + 1
  const nextCorrectCount = state.correctCount + (correct ? 1 : 0)
  const nextConsecutiveCorrect = correct ? state.consecutiveCorrect + 1 : 0
  let movement: 'harder' | 'easier' | null = null
  if (!correct) movement = 'easier'
  else if (nextConsecutiveCorrect >= 2) movement = 'harder'

  if (!movement) {
    return {
      ...state,
      trialCount: nextTrialCount,
      correctCount: nextCorrectCount,
      consecutiveCorrect: nextConsecutiveCorrect,
      converged: shouldStop({ ...state, trialCount: nextTrialCount, reversals: state.reversals }, config),
      convergenceQuality: state.reversals.length >= config.targetReversals ? 'high' : 'pending',
    }
  }

  const reversalDistances = [...state.reversals]
  if (detectReversal(state.previousMovement, movement)) {
    reversalDistances.push(state.currentDistance)
  }
  const step = stepSizeForReversals(reversalDistances.length)
  const direction = movement === 'harder' ? -1 : 1
  const currentDistance = Math.min(
    config.maxDistance,
    Math.max(config.minDistance, state.currentDistance + direction * step),
  )
  const nextState: StaircaseState = {
    ...state,
    currentDistance,
    currentStep: step,
    consecutiveCorrect: 0,
    previousMovement: movement,
    reversals: reversalDistances,
    trialCount: nextTrialCount,
    correctCount: nextCorrectCount,
    converged: false,
    convergenceQuality: reversalDistances.length >= config.targetReversals ? 'high' : 'pending',
  }
  nextState.converged = shouldStop(nextState, config)
  if (nextState.converged && reversalDistances.length < config.targetReversals) {
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
