import { seededRandom } from './rng'
import type { PlateDot } from '../test/types'

const GLYPHS: Record<string, string[]> = {
  '0': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  '3': ['11110', '00011', '00011', '01110', '00011', '00011', '11110'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '6': ['01110', '11000', '11000', '11110', '11011', '11011', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '11011', '00011', '00110', '01100', '11000', '11111'],
  '4': ['00110', '01110', '11010', '11010', '11111', '00010', '00111'],
  '5': ['11111', '11000', '11110', '00011', '00011', '11011', '01110'],
  '7': ['11111', '00011', '00110', '01100', '01100', '01100', '01100'],
  '9': ['01110', '11011', '11011', '01111', '00011', '00011', '01110'],
}

function glyphForNumber(number: number): string[] {
  if (!Number.isInteger(number) || number < 0 || number > 99) throw new Error('Unsupported target number')
  return String(number)
    .split('')
    .map((digit) => GLYPHS[digit])
    .reduce<string[]>((rows, glyph, index, glyphs) => {
      if (!rows.length) return [...glyph]
      return rows.map((row, rowIndex) => `${row}0${glyph[rowIndex]}`)
    }, [])
}

export function buildDotLayout(
  number: number,
  seed: number,
  columns = 30,
  rows = 18,
): PlateDot[] {
  const random = seededRandom(seed)
  const glyph = glyphForNumber(number)
  const glyphWidth = glyph[0].length
  // The canvas is 5:3. Use square physical glyph cells, independent of digit count.
  const cellHeight = 0.88 / 7
  const cellWidth = cellHeight / (5 / 3)
  const left = (1 - glyphWidth * cellWidth) / 2
  const top = (1 - 7 * cellHeight) / 2
  const dots: PlateDot[] = []
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const glyphRow = Math.floor(((row + 0.5) / rows - top) / cellHeight)
      const glyphColumn = Math.floor(((column + 0.5) / columns - left) / cellWidth)
      const isFigure = glyphRow >= 0 && glyphRow < 7 && glyphColumn >= 0 && glyphColumn < glyphWidth && glyph[glyphRow][glyphColumn] === '1'
      const x = (column + 0.5 + (random() - 0.5) * 0.55) / columns
      const y = (row + 0.5 + (random() - 0.5) * 0.55) / rows
      const radius = 0.010 + random() * 0.004
      dots.push({ x, y, radius, isFigure, color: { r: 0, g: 0, b: 0 } })
    }
  }
  return dots
}
