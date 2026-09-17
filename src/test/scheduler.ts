import { adaptiveConfig, DIRECTION_ORDER } from '../psychophysics/config'
import { createStaircase, updateStaircase } from '../psychophysics/staircase'
import { timingFlagFor } from '../psychophysics/quality'
import { seededRandom } from '../plate/rng'
import type {
  ColorDirectionId,
  GeneratedPlate,
  QuestionResult,
  StaircaseSnapshot,
  TestEngineState,
  TrialSpec,
} from './types'

const NUMBERS = Array.from({ length: 100 }, (_, number) => number)
const CONTROL_TRIAL_COUNT = 2
const CALIBRATION_GROWTH_FACTOR = 1.25

export interface QuestionCountEstimate {
  answered: number
  minimumTotal: number
  maximumTotal: number
  exact: boolean
}

function directionRecord<T>(factory: (directionId: ColorDirectionId) => T): Record<ColorDirectionId, T> {
  return Object.fromEntries(DIRECTION_ORDER.map((directionId) => [directionId, factory(directionId)])) as Record<ColorDirectionId, T>
}

function createAnchorSlots(): TestEngineState['anchorSlots'] {
  const slots: TestEngineState['anchorSlots'] = []
  for (let anchorIndex = 0; anchorIndex < adaptiveConfig.anchorCountPerDirection; anchorIndex += 1) {
    const base = anchorIndex === 0 ? 3 : 20 + (anchorIndex - 1) * 12
    DIRECTION_ORDER.forEach((directionId, directionIndex) => {
      slots.push({ at: base + directionIndex * 3, directionId, index: anchorIndex, answered: false })
    })
  }
  return slots.sort((first, second) => first.at - second.at)
}

function calibrationAttemptUpperBound(): number {
  let distance: number = adaptiveConfig.calibrationStartDistance
  let attempts = 0
  while (attempts < 100) {
    attempts += 1
    if (distance >= adaptiveConfig.calibrationMaxContrast - 1e-6) return attempts
    distance = Math.min(adaptiveConfig.calibrationMaxContrast, distance * CALIBRATION_GROWTH_FACTOR)
  }
  return attempts
}

function snapshot(state: TestEngineState['tracks'][ColorDirectionId]): StaircaseSnapshot {
  return {
    currentDistance: state.currentDistance,
    currentStep: state.currentStep,
    consecutiveCorrect: state.consecutiveCorrect,
    previousMovement: state.previousMovement,
    reversals: [...state.reversals],
    trialCount: state.trialCount,
    correctCount: state.correctCount,
    converged: state.converged,
    stopped: state.stopped,
  }
}

export function createEngineState(seed = Math.floor(Math.random() * 0x100000000), environmentConfirmed = false): TestEngineState {
  return {
    seed,
    environmentConfirmed,
    phase: 'control',
    status: 'in-progress',
    controlIndex: 0,
    calibrationCursor: 0,
    calibrationDistances: directionRecord<number>(() => adaptiveConfig.calibrationStartDistance),
    calibrationAttempts: directionRecord(() => 0),
    calibrationComplete: directionRecord(() => false),
    calibrationFailed: directionRecord(() => false),
    tracks: directionRecord((directionId) => createStaircase(directionId)),
    anchorSlots: createAnchorSlots(),
    anchorLevels: {},
    adaptiveTrialCount: 0,
    schedulerCursor: 0,
    lastWasAnchor: false,
    questions: [],
  }
}

function numberFor(state: TestEngineState): number {
  const random = seededRandom(seedFor(state) ^ 0x51ed270b)
  return NUMBERS[Math.floor(random() * NUMBERS.length)]
}

function seedFor(state: TestEngineState, offset = 0): number {
  return state.seed + state.questions.length * 7919 + offset * 97
}

function nextAnchor(state: TestEngineState): TestEngineState['anchorSlots'][number] | undefined {
  return state.anchorSlots.find((slot) => !slot.answered && !state.calibrationFailed[slot.directionId] && (state.adaptiveTrialCount >= slot.at || !hasActiveTrack(state)))
}

function hasActiveTrack(state: TestEngineState): boolean {
  return DIRECTION_ORDER.some((directionId) => !state.tracks[directionId].stopped && !state.calibrationFailed[directionId])
}

function chooseDirection(state: TestEngineState): ColorDirectionId | undefined {
  const candidates = DIRECTION_ORDER.filter((directionId) => !state.tracks[directionId].stopped && !state.calibrationFailed[directionId])
  if (!candidates.length) return undefined
  for (let step = 0; step < DIRECTION_ORDER.length; step += 1) {
    const directionId = DIRECTION_ORDER[(state.schedulerCursor + step) % DIRECTION_ORDER.length]
    if (candidates.includes(directionId)) return directionId
  }
  return candidates[0]
}

export function selectNextTrial(state: TestEngineState): TrialSpec | null {
  if (state.status !== 'in-progress') return null
  if (state.phase === 'control' && state.controlIndex < 2) {
    return {
      id: `control-${state.controlIndex}`,
      phase: 'control',
      requestedDistance: 0.06,
      targetNumber: numberFor(state),
      seed: seedFor(state, state.controlIndex),
    }
  }
  if (state.phase === 'calibration' && state.calibrationCursor < DIRECTION_ORDER.length) {
    const directionId = DIRECTION_ORDER[state.calibrationCursor]
    return {
      id: `calibration-${directionId}-${state.calibrationAttempts[directionId]}`,
      phase: 'calibration',
      directionId,
      requestedDistance: state.calibrationDistances[directionId],
      targetNumber: numberFor(state),
      seed: seedFor(state),
    }
  }
  const anchor = nextAnchor(state)
  if (anchor && !state.lastWasAnchor) {
    const directionId = anchor.directionId
    return {
      id: `anchor-${directionId}-${anchor.index}`,
      phase: 'anchor',
      directionId,
      requestedDistance: state.anchorLevels[directionId] ?? state.tracks[directionId].currentDistance,
      targetNumber: numberFor(state),
      seed: seedFor(state, anchor.index + 11),
      anchorKey: `anchor-${directionId}`,
      anchorIndex: anchor.index,
    }
  }
  const directionId = chooseDirection(state)
  if (directionId) {
    const track = state.tracks[directionId]
    return {
      id: `adaptive-${directionId}-${track.trialCount}`,
      phase: 'adaptive',
      directionId,
      requestedDistance: track.currentDistance,
      targetNumber: numberFor(state),
      seed: seedFor(state, track.trialCount),
    }
  }
  const remainingAnchor = state.anchorSlots.find((slot) => !slot.answered && !state.calibrationFailed[slot.directionId])
  if (remainingAnchor) {
    const directionId = remainingAnchor.directionId
    return {
      id: `anchor-${directionId}-${remainingAnchor.index}`,
      phase: 'anchor',
      directionId,
      requestedDistance: state.anchorLevels[directionId] ?? state.tracks[directionId].currentDistance,
      targetNumber: numberFor(state),
      seed: seedFor(state, remainingAnchor.index + 11),
      anchorKey: `anchor-${directionId}`,
      anchorIndex: remainingAnchor.index,
    }
  }
  return null
}

function finishIfDone(state: TestEngineState): TestEngineState {
  const noTrial = !selectNextTrial({ ...state, lastWasAnchor: false })
  if (!noTrial) return state
  return { ...state, phase: 'anchor', status: 'complete' }
}

export function recordTrial(
  state: TestEngineState,
  spec: TrialSpec,
  answer: number | null,
  responseTimeMs: number,
  focusInterrupted: boolean,
  plate: GeneratedPlate,
): TestEngineState {
  const expected = selectNextTrial(state)
  if (!expected || JSON.stringify(expected) !== JSON.stringify(spec)) throw new Error('Stale or unexpected trial')
  if (!plate.validation.productionValid || !Number.isFinite(plate.actualNominalDeltaUv) || plate.actualNominalDeltaUv <= 0) {
    throw new Error('Invalid plate cannot enter measurement')
  }
  if (plate.seed !== spec.seed || plate.targetNumber !== spec.targetNumber || plate.requestedDistance !== spec.requestedDistance ||
      (spec.directionId && plate.directionId !== spec.directionId)) throw new Error('Plate does not match trial')
  if (!Number.isFinite(responseTimeMs) || responseTimeMs < 0 || (answer !== null && (!Number.isInteger(answer) || answer < 0 || answer > 99))) {
    throw new Error('Invalid response')
  }
  const correct = answer !== null && answer === spec.targetNumber
  const track = spec.directionId ? state.tracks[spec.directionId] : undefined
  const result: QuestionResult = {
    id: spec.id,
    phase: spec.phase,
    directionId: spec.directionId,
    polarityId: plate.polarityId,
    targetNumber: spec.targetNumber,
    answer,
    correct,
    requestedDistance: spec.requestedDistance,
    nominalDeltaUv: plate.actualNominalDeltaUv,
    paletteId: plate.paletteId,
    seed: spec.seed,
    responseTimeMs,
    focusInterrupted,
    timingFlag: timingFlagFor(responseTimeMs, focusInterrupted),
    anchorKey: spec.anchorKey,
    anchorIndex: spec.anchorIndex,
    staircaseBefore: track ? snapshot(track) : undefined,
  }
  let next: TestEngineState = { ...state, questions: [...state.questions, result], lastWasAnchor: spec.phase === 'anchor' }
  if (spec.phase === 'control') {
    next = { ...next, controlIndex: state.controlIndex + 1 }
    if (next.controlIndex >= 2) next.phase = 'calibration'
  } else if (spec.phase === 'calibration' && spec.directionId) {
    const directionId = spec.directionId
    const attempts = state.calibrationAttempts[directionId] + 1
    const successful = correct
    const atMax = state.calibrationDistances[directionId] >= adaptiveConfig.calibrationMaxContrast - 1e-6
    const calibrationDistances = { ...state.calibrationDistances }
    const calibrationComplete = { ...state.calibrationComplete }
    const calibrationFailed = { ...state.calibrationFailed }
    const tracks = { ...state.tracks }
    if (successful) {
      calibrationComplete[directionId] = true
      tracks[directionId] = { ...tracks[directionId], currentDistance: Math.max(adaptiveConfig.minDistance, plate.actualNominalDeltaUv * 0.72) }
    } else if (atMax) {
      calibrationFailed[directionId] = true
      calibrationComplete[directionId] = true
      tracks[directionId] = { ...tracks[directionId], stopped: true, converged: false, convergenceQuality: 'low', insufficientCalibration: true }
    } else {
      calibrationDistances[directionId] = Math.min(adaptiveConfig.calibrationMaxContrast, spec.requestedDistance * 1.25)
    }
    const shouldAdvance = successful || atMax
    next = {
      ...next,
      calibrationAttempts: { ...state.calibrationAttempts, [directionId]: attempts },
      calibrationDistances,
      calibrationComplete,
      calibrationFailed,
      tracks,
      calibrationCursor: state.calibrationCursor + (shouldAdvance ? 1 : 0),
      phase: state.calibrationCursor + (shouldAdvance ? 1 : 0) >= DIRECTION_ORDER.length ? 'adaptive' : 'calibration',
    }
  } else if (spec.phase === 'adaptive' && spec.directionId) {
    const directionIndex = DIRECTION_ORDER.indexOf(spec.directionId)
    const updatedTrack = updateStaircase(state.tracks[spec.directionId], correct, adaptiveConfig, plate.actualNominalDeltaUv)
    next = {
      ...next,
      tracks: { ...state.tracks, [spec.directionId]: updatedTrack },
      adaptiveTrialCount: state.adaptiveTrialCount + 1,
      schedulerCursor: (directionIndex + 1) % DIRECTION_ORDER.length,
    }
    result.staircaseAfter = snapshot(updatedTrack)
  } else if (spec.phase === 'anchor' && spec.directionId) {
    const anchorSlots = state.anchorSlots.map((slot) =>
      slot.directionId === spec.directionId && slot.index === spec.anchorIndex
        ? { ...slot, answered: true }
        : slot,
    )
    next = {
      ...next,
      anchorSlots,
      anchorLevels: state.anchorLevels[spec.directionId]
        ? state.anchorLevels
        : { ...state.anchorLevels, [spec.directionId]: spec.requestedDistance },
    }
  }
  return finishIfDone(next)
}

export function progressPercent(state: TestEngineState): number {
  if (state.status === 'complete') return 100
  const trackProgress = DIRECTION_ORDER.reduce((sum, directionId) => {
    const track = state.tracks[directionId]
    return sum + Math.min(1, track.trialCount / adaptiveConfig.maximumTrials)
  }, 0) / DIRECTION_ORDER.length
  const controlProgress = Math.min(1, state.controlIndex / 2) * 0.12
  const calibrationProgress = (state.calibrationCursor / DIRECTION_ORDER.length) * 0.12
  const anchorProgress = ((state.anchorSlots.length - state.anchorSlots.filter((slot) => !slot.answered).length) / state.anchorSlots.length) * 0.1
  return Math.min(100, Math.round((controlProgress + calibrationProgress + trackProgress * 0.66 + anchorProgress) * 100))
}

/**
 * The adaptive section has a real range rather than a fixed question count.
 * Before calibration is known, show the pass-calibration range; once all
 * directions are calibrated, calculate the remaining lower/upper bound from
 * each track and the still-unanswered anchors.
 */
export function questionCountEstimate(state: TestEngineState): QuestionCountEstimate {
  const answered = state.questions.length
  if (state.status === 'complete') return { answered, minimumTotal: answered, maximumTotal: answered, exact: true }
  if (state.phase === 'control' || state.phase === 'calibration') {
    const directionCount = DIRECTION_ORDER.length
    const anchorCount = directionCount * adaptiveConfig.anchorCountPerDirection
    return {
      answered,
      minimumTotal: CONTROL_TRIAL_COUNT + directionCount + directionCount * adaptiveConfig.minimumTrials + anchorCount,
      maximumTotal: CONTROL_TRIAL_COUNT + directionCount * calibrationAttemptUpperBound() + directionCount * adaptiveConfig.maximumTrials + anchorCount,
      exact: false,
    }
  }

  let minimumRemaining = 0
  let maximumRemaining = 0
  DIRECTION_ORDER.forEach((directionId) => {
    if (state.calibrationFailed[directionId]) return
    const track = state.tracks[directionId]
    if (!track.stopped) {
      minimumRemaining += Math.max(0, adaptiveConfig.minimumTrials - track.trialCount)
      maximumRemaining += Math.max(0, adaptiveConfig.maximumTrials - track.trialCount)
    }
    const unansweredAnchors = state.anchorSlots.filter((slot) => slot.directionId === directionId && !slot.answered).length
    minimumRemaining += unansweredAnchors
    maximumRemaining += unansweredAnchors
  })
  return {
    answered,
    minimumTotal: answered + minimumRemaining,
    maximumTotal: answered + maximumRemaining,
    exact: minimumRemaining === maximumRemaining,
  }
}
