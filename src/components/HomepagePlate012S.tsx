type DotRole = 'background' | 'figure'

interface PlateDot {
  cx: number
  cy: number
  r: number
  role: DotRole
  tone: string
}

const BACKGROUND_TONES = ['#b6cd70', '#c7d87c', '#d3dc86', '#9fbe69', '#dce197']
const FIGURE_TONES = ['#f29c5f', '#f6ad70', '#e99158', '#f4a374', '#ee8958']

function createSeededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const abx = bx - ax
  const aby = by - ay
  const lengthSquared = abx * abx + aby * aby
  const projection = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lengthSquared))
  const dx = px - (ax + projection * abx)
  const dy = py - (ay + projection * aby)
  return Math.hypot(dx, dy)
}

function nearStroke(x: number, y: number, points: Array<[number, number]>, width = .072) {
  return points.slice(0, -1).some((point, index) => distanceToSegment(x, y, point[0], point[1], points[index + 1][0], points[index + 1][1]) <= width)
}

function isZero(x: number, y: number) {
  const outer = ((x - .5) / .39) ** 2 + ((y - .5) / .49) ** 2
  const inner = ((x - .5) / .205) ** 2 + ((y - .5) / .31) ** 2
  return outer <= 1 && inner >= 1
}

function isFigurePoint(x: number, y: number) {
  const glyphTop = .25
  const glyphHeight = .5
  const glyphWidth = .145
  const glyphGap = .04
  const glyphStart = .15
  if (y < glyphTop || y > glyphTop + glyphHeight) return false

  const glyphIndex = Math.floor((x - glyphStart) / (glyphWidth + glyphGap))
  if (glyphIndex < 0 || glyphIndex > 3) return false

  const localStart = glyphStart + glyphIndex * (glyphWidth + glyphGap)
  const localX = (x - localStart) / glyphWidth
  const localY = (y - glyphTop) / glyphHeight
  if (localX < 0 || localX > 1 || localY < 0 || localY > 1) return false

  switch (glyphIndex) {
    case 0:
      return isZero(localX, localY)
    case 1:
      return nearStroke(localX, localY, [[.62, .05], [.5, .05], [.5, .94]], .105)
        || nearStroke(localX, localY, [[.5, .94], [.28, .94], [.72, .94]], .095)
    case 2:
      return nearStroke(localX, localY, [
        [.16, .18], [.29, .07], [.73, .07], [.88, .2], [.82, .34], [.58, .52], [.34, .69], [.18, .83], [.21, .94], [.82, .94],
      ], .102)
    default:
      return nearStroke(localX, localY, [
        [.83, .09], [.24, .09], [.13, .2], [.18, .33], [.74, .47], [.86, .59], [.8, .79], [.68, .93], [.2, .93],
      ], .102)
  }
}

function createPlateDots(): PlateDot[] {
  const random = createSeededRandom(12012)
  const dots: PlateDot[] = []
  const spacing = 30

  for (let row = 0, y = 91; y <= 909; row += 1, y += spacing) {
    for (let column = 0, x = 91; x <= 909; column += 1, x += spacing) {
      const cx = x + (random() - .5) * 8
      const cy = y + (random() - .5) * 8
      const r = 8.1 + random() * 4.9
      if (Math.hypot(cx - 500, cy - 500) + r > 424) continue

      const figure = isFigurePoint((cx - 76) / 848, (cy - 144) / 712)
      const tones = figure ? FIGURE_TONES : BACKGROUND_TONES
      dots.push({
        cx,
        cy,
        r,
        role: figure ? 'figure' : 'background',
        tone: tones[Math.floor(random() * tones.length)],
      })
    }
  }

  return dots
}

const PLATE_DOTS = createPlateDots()

export function HomepagePlate012S() {
  return (
    <div className="homepage-plate-shell">
      <svg className="homepage-plate" viewBox="0 0 1000 1000" role="img" aria-label="由彩色圓點組成的 012S 示意圖">
        <circle className="homepage-plate-ring" cx="500" cy="500" r="466" />
        <circle className="homepage-plate-surface" cx="500" cy="500" r="444" />
        <g className="homepage-plate-dots">
          {PLATE_DOTS.map((dot, index) => (
            <circle
              className={`homepage-plate-dot homepage-plate-dot-${dot.role}`}
              cx={dot.cx}
              cy={dot.cy}
              fill={dot.tone}
              key={index}
              r={dot.r}
            />
          ))}
        </g>
        <circle className="homepage-plate-inner-ring" cx="500" cy="500" r="424" />
      </svg>
    </div>
  )
}
