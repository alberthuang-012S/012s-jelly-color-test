import { seededRandom } from './rng'
import type { PlateDot } from '../test/types'

interface Point {
  x: number
  y: number
}

interface Stroke {
  points: Point[]
  closed?: boolean
}

const PLATE_CENTER = 0.5
const PLATE_RADIUS = 0.43
const TARGET_DOT_MIN = 460
const TARGET_DOT_SPAN = 61
const DOT_EDGE_MARGIN = 0.006
const MIN_DOT_GAP = 0.0015
const MIN_DOT_RADIUS = 0.008
const MAX_DOT_RADIUS = 0.0176
const MASK_HEIGHT = 0.56
const MASK_TOP = 0.22
const GLYPH_MASK_SIZE = 128
const GLYPH_STROKE_RADIUS = 0.12
const PLACEMENT_RADIUS = PLATE_RADIUS - DOT_EDGE_MARGIN - MAX_DOT_RADIUS - MIN_DOT_GAP
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const ANGLE_JITTER = 0.035
const RADIAL_JITTER = 0.0015

function path(...points: Point[]): Stroke {
  return { points }
}

function loop(...points: Point[]): Stroke {
  return { points, closed: true }
}

function ellipse(cx: number, cy: number, rx: number, ry: number, steps = 28): Stroke {
  return loop(...Array.from({ length: steps }, (_, index) => {
    const angle = (index / steps) * Math.PI * 2
    return { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry }
  }))
}

/**
 * Smooth, vector-like number strokes in a unit-height cell. These paths are
 * sampled into a high-resolution mask, so the figure dots inherit a rounded,
 * organic boundary without a coarse 5 × 7 bitmap grid.
 */
const GLYPHS: Record<string, Stroke[]> = {
  '0': [ellipse(0.5, 0.5, 0.3, 0.41)],
  '1': [
    path({ x: 0.3, y: 0.24 }, { x: 0.48, y: 0.1 }, { x: 0.53, y: 0.1 }, { x: 0.53, y: 0.9 }),
    path({ x: 0.28, y: 0.9 }, { x: 0.77, y: 0.9 }),
  ],
  '2': [path(
    { x: 0.2, y: 0.25 }, { x: 0.28, y: 0.13 }, { x: 0.48, y: 0.1 }, { x: 0.68, y: 0.15 },
    { x: 0.77, y: 0.27 }, { x: 0.72, y: 0.4 }, { x: 0.23, y: 0.9 }, { x: 0.78, y: 0.9 },
  )],
  '3': [path(
    { x: 0.2, y: 0.19 }, { x: 0.32, y: 0.11 }, { x: 0.58, y: 0.1 }, { x: 0.73, y: 0.18 },
    { x: 0.76, y: 0.3 }, { x: 0.71, y: 0.4 }, { x: 0.54, y: 0.49 }, { x: 0.68, y: 0.55 },
    { x: 0.77, y: 0.66 }, { x: 0.73, y: 0.82 }, { x: 0.58, y: 0.9 }, { x: 0.31, y: 0.88 },
    { x: 0.2, y: 0.8 },
  )],
  '4': [
    path({ x: 0.49, y: 0.1 }, { x: 0.2, y: 0.59 }, { x: 0.82, y: 0.59 }),
    path({ x: 0.49, y: 0.1 }, { x: 0.72, y: 0.1 }, { x: 0.72, y: 0.9 }),
  ],
  '5': [
    path({ x: 0.78, y: 0.1 }, { x: 0.24, y: 0.1 }, { x: 0.22, y: 0.47 }, { x: 0.58, y: 0.47 }),
    path(
      { x: 0.58, y: 0.47 }, { x: 0.69, y: 0.5 }, { x: 0.76, y: 0.62 }, { x: 0.74, y: 0.74 },
      { x: 0.65, y: 0.85 }, { x: 0.49, y: 0.9 }, { x: 0.3, y: 0.9 }, { x: 0.22, y: 0.86 },
    ),
  ],
  '6': [path(
    { x: 0.71, y: 0.13 }, { x: 0.51, y: 0.1 }, { x: 0.33, y: 0.16 }, { x: 0.23, y: 0.34 },
    { x: 0.22, y: 0.7 }, { x: 0.32, y: 0.86 }, { x: 0.52, y: 0.91 }, { x: 0.73, y: 0.84 },
    { x: 0.79, y: 0.67 }, { x: 0.71, y: 0.51 }, { x: 0.53, y: 0.45 }, { x: 0.27, y: 0.52 },
  )],
  '7': [path({ x: 0.2, y: 0.1 }, { x: 0.79, y: 0.1 }, { x: 0.43, y: 0.9 })],
  '8': [ellipse(0.5, 0.29, 0.27, 0.2), ellipse(0.5, 0.71, 0.29, 0.21)],
  '9': [
    ellipse(0.49, 0.29, 0.27, 0.2),
    path({ x: 0.76, y: 0.4 }, { x: 0.72, y: 0.69 }, { x: 0.6, y: 0.86 }, { x: 0.4, y: 0.9 }),
  ],
}

function glyphForNumber(number: number): string[] {
  if (!Number.isInteger(number) || number < 0 || number > 99) throw new Error('Unsupported target number')
  return String(number).split('')
}

function distanceSquaredToSegment(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy
  if (lengthSquared === 0) return (point.x - start.x) ** 2 + (point.y - start.y) ** 2
  const projection = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared))
  const nearestX = start.x + projection * dx
  const nearestY = start.y + projection * dy
  return (point.x - nearestX) ** 2 + (point.y - nearestY) ** 2
}

function pointIsInsideStroke(point: Point, stroke: Stroke, strokeRadius: number): boolean {
  const segments = stroke.points.length - 1 + (stroke.closed ? 1 : 0)
  for (let index = 0; index < segments; index += 1) {
    const start = stroke.points[index]
    const end = stroke.points[(index + 1) % stroke.points.length]
    if (distanceSquaredToSegment(point, start, end) <= strokeRadius * strokeRadius) return true
  }
  return false
}

function createGlyphMask(strokes: Stroke[]): Uint8Array {
  const mask = new Uint8Array(GLYPH_MASK_SIZE * GLYPH_MASK_SIZE)
  for (let row = 0; row < GLYPH_MASK_SIZE; row += 1) {
    for (let column = 0; column < GLYPH_MASK_SIZE; column += 1) {
      const point = {
        x: (column + 0.5) / GLYPH_MASK_SIZE,
        y: (row + 0.5) / GLYPH_MASK_SIZE,
      }
      if (strokes.some((stroke) => pointIsInsideStroke(point, stroke, GLYPH_STROKE_RADIUS))) {
        mask[row * GLYPH_MASK_SIZE + column] = 1
      }
    }
  }
  return mask
}

const GLYPH_MASKS: Record<string, Uint8Array> = Object.fromEntries(
  Object.entries(GLYPHS).map(([digit, strokes]) => [digit, createGlyphMask(strokes)]),
) as Record<string, Uint8Array>

function pointIsInNumberMask(digitMasks: Uint8Array[], x: number, y: number): boolean {
  const digitCellWidth = digitMasks.length === 1 ? 0.3 : 0.32
  const digitGap = digitMasks.length === 1 ? 0 : 0.04
  const totalWidth = digitCellWidth * digitMasks.length + digitGap * Math.max(0, digitMasks.length - 1)
  const groupLeft = PLATE_CENTER - totalWidth / 2
  const localY = (y - MASK_TOP) / MASK_HEIGHT
  if (localY < 0 || localY > 1) return false
  const maskRow = Math.min(GLYPH_MASK_SIZE - 1, Math.floor(localY * GLYPH_MASK_SIZE))

  for (let index = 0; index < digitMasks.length; index += 1) {
    const localX = (x - (groupLeft + index * (digitCellWidth + digitGap))) / digitCellWidth
    if (localX < 0 || localX > 1) continue
    const maskColumn = Math.min(GLYPH_MASK_SIZE - 1, Math.floor(localX * GLYPH_MASK_SIZE))
    if (digitMasks[index][maskRow * GLYPH_MASK_SIZE + maskColumn] === 1) return true
  }
  return false
}

/**
 * Creates an Ishihara-like point field without a placement grid. A sunflower
 * sequence gives the disk a blue-noise-like baseline; seeded angular and
 * radial perturbations keep the spacing organic while remaining inexpensive to
 * generate for simulation and production stress tests.
 */
export function buildDotLayout(number: number, seed: number): PlateDot[] {
  const random = seededRandom(seed)
  const targetCount = TARGET_DOT_MIN + Math.floor(random() * TARGET_DOT_SPAN)
  const dots: PlateDot[] = []
  const digits = glyphForNumber(number)
  const digitMasks = digits.map((digit) => GLYPH_MASKS[digit])
  const angleOffset = random() * Math.PI * 2

  for (let index = 0; index < targetCount; index += 1) {
    const radius = MIN_DOT_RADIUS + Math.pow(random(), 1.15) * (MAX_DOT_RADIUS - MIN_DOT_RADIUS)
    const normalizedRadius = (index + 0.5) / targetCount
    const radiusJitter = (random() - 0.5) * RADIAL_JITTER
    const distance = Math.min(PLACEMENT_RADIUS, Math.max(0, Math.sqrt(normalizedRadius) * PLACEMENT_RADIUS + radiusJitter))
    const angle = angleOffset + index * GOLDEN_ANGLE + (random() - 0.5) * ANGLE_JITTER
    const x = PLATE_CENTER + Math.cos(angle) * distance
    const y = PLATE_CENTER + Math.sin(angle) * distance
    const dot: PlateDot = {
      x,
      y,
      radius,
      isFigure: pointIsInNumberMask(digitMasks, x, y),
      color: { r: 0, g: 0, b: 0 },
    }
    dots.push(dot)
  }
  return dots
}
