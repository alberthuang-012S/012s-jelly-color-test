export type ColorDirectionId = 'A' | 'B' | 'C' | 'D' | 'E'
export type TestPhase = 'control' | 'calibration' | 'adaptive' | 'anchor'
export type ThresholdMethod = 'psychometric' | 'reversal-fallback'

export interface StaircaseState {
  directionId: ColorDirectionId
  currentDistance: number
  minDistance: number
  maxDistance: number
  currentStep: number
  consecutiveCorrect: number
  previousMovement: 'harder' | 'easier' | null
  reversals: number[]
  trialCount: number
  correctCount: number
  converged: boolean
  stopped?: boolean
  convergenceQuality: 'pending' | 'high' | 'low'
  insufficientCalibration: boolean
}

export interface StaircaseSnapshot {
  stopped?: boolean
  currentDistance: number
  currentStep: number
  consecutiveCorrect: number
  previousMovement: StaircaseState['previousMovement']
  reversals: number[]
  trialCount: number
  correctCount: number
  converged: boolean
}

export interface PlateDot {
  x: number
  y: number
  radius: number
  isFigure: boolean
  color: { r: number; g: number; b: number }
}

export interface PlateValidation {
  maskCoverage: boolean
  dotCount: boolean
  figureBackgroundDensity: boolean
  nominalChromaticDistance: boolean
  meanLuminanceDifference: boolean
  luminanceDistributionOverlap: boolean
  grayscaleLeakage: boolean
  noInvalidRgbClipping: boolean
  productionValid: boolean
  rejectedReasons: string[]
}

export interface GeneratedPlate {
  id: string
  paletteId: string
  seed: number
  targetNumber: number
  directionId?: ColorDirectionId
  requestedDistance: number
  actualNominalDeltaUv: number
  figureColor: { r: number; g: number; b: number }
  backgroundColor: { r: number; g: number; b: number }
  dots: PlateDot[]
  validation: PlateValidation
  regenerated: boolean
}

export interface TrialSpec {
  id: string
  phase: TestPhase
  directionId?: ColorDirectionId
  requestedDistance: number
  targetNumber: number
  seed: number
  anchorKey?: string
  anchorIndex?: number
}

export interface QuestionResult {
  id: string
  phase: TestPhase
  directionId?: ColorDirectionId
  targetNumber: number
  answer: number | null
  correct: boolean
  requestedDistance?: number
  nominalDeltaUv?: number
  paletteId: string
  seed: number
  responseTimeMs: number
  focusInterrupted: boolean
  timingFlag?: string
  anchorKey?: string
  anchorIndex?: number
  staircaseBefore?: StaircaseSnapshot
  staircaseAfter?: StaircaseSnapshot
}

export interface DeviceInfo {
  viewport: string
  devicePixelRatio: number
  browser: string
  colorDepth: number
  prefersColorScheme: string
  colorGamut: string
}

export interface DirectionThreshold {
  directionId: ColorDirectionId
  label?: string
  threshold?: number
  thresholdMethod?: ThresholdMethod
  trialCount: number
  reversalCount: number
  convergenceQuality: 'pending' | 'high' | 'low'
  fitQuality?: number
  insufficientCalibration?: boolean
}

export interface DifficultyCurvePoint {
  distance: number
  probability: number
  count?: number
}

export interface DifficultyBand {
  label: 'High Contrast' | 'Medium Contrast' | 'Low Contrast' | 'Very Low Contrast'
  min: number
  max: number
  count: number
  accuracy: number
}

export interface DifficultyCurve {
  observed: DifficultyCurvePoint[]
  fitted: DifficultyCurvePoint[]
  threshold75?: number
  bands: DifficultyBand[]
}

export interface ConsistencyBreakdown {
  score: number
  anchorAgreement: number
  monotonicity: number
  fitQuality: number
}

export interface QualityBreakdown {
  score: number
  classification: 'HIGH' | 'GOOD' | 'MODERATE' | 'LOW'
  controlQuality: number
  consistencyQuality: number
  timingQuality: number
  completionQuality: number
  interruptions: number
  extremeFastCount: number
  extremeSlowCount: number
  reasons: string[]
}

export interface SessionMetrics {
  directionalThresholds: DirectionThreshold[]
  overallDcdt?: number
  chromaticAccuracy: number
  directionAccuracy: Record<ColorDirectionId, number>
  consistency: ConsistencyBreakdown
  quality: QualityBreakdown
  difficultyCurve: DifficultyCurve
}

export interface TestEngineState {
  seed: number
  environmentConfirmed?: boolean
  phase: TestPhase
  status: 'in-progress' | 'complete' | 'partial'
  controlIndex: number
  calibrationCursor: number
  calibrationDistances: Record<ColorDirectionId, number>
  calibrationAttempts: Record<ColorDirectionId, number>
  calibrationComplete: Record<ColorDirectionId, boolean>
  calibrationFailed: Record<ColorDirectionId, boolean>
  tracks: Record<ColorDirectionId, StaircaseState>
  anchorSlots: Array<{ at: number; directionId: ColorDirectionId; index: number; answered: boolean }>
  anchorLevels: Partial<Record<ColorDirectionId, number>>
  adaptiveTrialCount: number
  schedulerCursor: number
  lastWasAnchor: boolean
  questions: QuestionResult[]
}

export interface TestSession {
  engineVersion?: string
  environmentConfirmed?: boolean
  id: string
  startedAt: string
  completedAt?: string
  deviceInfo: DeviceInfo
  questions: QuestionResult[]
  directionalThresholds: DirectionThreshold[]
  overallDcdt?: number
  chromaticAccuracy: number
  consistencyIndex: number
  resultQualityIndex: number
  status: 'complete' | 'partial' | 'low-quality'
  metrics: SessionMetrics
  normativeVersion?: string
  percentile?: number
}
