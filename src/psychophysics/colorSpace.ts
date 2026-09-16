export interface RGB {
  r: number
  g: number
  b: number
}

export interface XYZ {
  x: number
  y: number
  z: number
}

export interface UvPrime {
  u: number
  v: number
}

export interface Lab {
  l: number
  a: number
  b: number
}

const D65: XYZ = { x: 0.95047, y: 1, z: 1.08883 }

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

/** Encoded normalized channel; RGB objects use byte-scale channels. */
export function rgbToLinearChannel(normalized: number): number {
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

export function rgbToLinearRgb(rgb: RGB): RGB {
  return {
    r: rgbToLinearChannel(rgb.r / 255),
    g: rgbToLinearChannel(rgb.g / 255),
    b: rgbToLinearChannel(rgb.b / 255),
  }
}

export function linearRgbToRgb(rgb: RGB): RGB {
  const encode = (value: number) => 255 * (value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055)
  return { r: encode(rgb.r), g: encode(rgb.g), b: encode(rgb.b) }
}

export function uvPrimeToRgb(uv: UvPrime, luminance: number): RGB {
  const x = 9 * luminance * uv.u / (4 * uv.v)
  const z = luminance * (12 - 3 * uv.u - 20 * uv.v) / (4 * uv.v)
  return linearRgbToRgb({
    r: 3.2404542 * x - 1.5371385 * luminance - 0.4985314 * z,
    g: -0.969266 * x + 1.8760108 * luminance + 0.041556 * z,
    b: 0.0556434 * x - 0.2040259 * luminance + 1.0572252 * z,
  })
}

export function linearRgbToXyz(rgb: RGB): XYZ {
  return {
    x: rgb.r * 0.4124564 + rgb.g * 0.3575761 + rgb.b * 0.1804375,
    y: rgb.r * 0.2126729 + rgb.g * 0.7151522 + rgb.b * 0.072175,
    z: rgb.r * 0.0193339 + rgb.g * 0.119192 + rgb.b * 0.9503041,
  }
}

export function rgbToXyz(rgb: RGB): XYZ {
  return linearRgbToXyz(rgbToLinearRgb(rgb))
}

export function xyzToUvPrime(xyz: XYZ): UvPrime {
  const denominator = xyz.x + 15 * xyz.y + 3 * xyz.z
  if (denominator <= 1e-12) return { u: 0, v: 0 }
  return {
    u: (4 * xyz.x) / denominator,
    v: (9 * xyz.y) / denominator,
  }
}

export function rgbToUvPrime(rgb: RGB): UvPrime {
  return xyzToUvPrime(rgbToXyz(rgb))
}

export function uvDistance(first: UvPrime, second: UvPrime): number {
  return Math.hypot(first.u - second.u, first.v - second.v)
}

export function relativeLuminance(rgb: RGB): number {
  return rgbToXyz(rgb).y
}

function labPivot(value: number): number {
  const epsilon = 216 / 24389
  const kappa = 24389 / 27
  return value > epsilon ? Math.cbrt(value) : (kappa * value + 16) / 116
}

export function xyzToLab(xyz: XYZ): Lab {
  const fx = labPivot(xyz.x / D65.x)
  const fy = labPivot(xyz.y / D65.y)
  const fz = labPivot(xyz.z / D65.z)
  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  }
}

export function rgbToLab(rgb: RGB): Lab {
  return xyzToLab(rgbToXyz(rgb))
}

function degrees(value: number): number {
  return (value * 180) / Math.PI
}

function radians(value: number): number {
  return (value * Math.PI) / 180
}

/** CIEDE2000, retained for palette QA rather than the adaptive distance. */
export function deltaE00(firstRgb: RGB, secondRgb: RGB): number {
  const first = rgbToLab(firstRgb)
  const second = rgbToLab(secondRgb)
  const c1 = Math.hypot(first.a, first.b)
  const c2 = Math.hypot(second.a, second.b)
  const cBar = (c1 + c2) / 2
  const g = 0.5 * (1 - Math.sqrt((cBar ** 7) / (cBar ** 7 + 25 ** 7)))
  const a1Prime = (1 + g) * first.a
  const a2Prime = (1 + g) * second.a
  const c1Prime = Math.hypot(a1Prime, first.b)
  const c2Prime = Math.hypot(a2Prime, second.b)
  const h1Prime = (degrees(Math.atan2(first.b, a1Prime)) + 360) % 360
  const h2Prime = (degrees(Math.atan2(second.b, a2Prime)) + 360) % 360
  const deltaL = second.l - first.l
  const deltaC = c2Prime - c1Prime
  let deltaH = h2Prime - h1Prime
  if (c1Prime * c2Prime === 0) deltaH = 0
  else if (deltaH > 180) deltaH -= 360
  else if (deltaH < -180) deltaH += 360
  const deltaBigH = 2 * Math.sqrt(c1Prime * c2Prime) * Math.sin(radians(deltaH / 2))
  const lBar = (first.l + second.l) / 2
  const cBarPrime = (c1Prime + c2Prime) / 2
  let hBarPrime = h1Prime + h2Prime
  if (c1Prime * c2Prime === 0) hBarPrime = h1Prime + h2Prime
  else if (Math.abs(h1Prime - h2Prime) <= 180) hBarPrime /= 2
  else if (hBarPrime < 360) hBarPrime = (hBarPrime + 360) / 2
  else hBarPrime = (hBarPrime - 360) / 2
  const t =
    1 -
    0.17 * Math.cos(radians(hBarPrime - 30)) +
    0.24 * Math.cos(radians(2 * hBarPrime)) +
    0.32 * Math.cos(radians(3 * hBarPrime + 6)) -
    0.20 * Math.cos(radians(4 * hBarPrime - 63))
  const deltaTheta = 30 * Math.exp(-(((hBarPrime - 275) / 25) ** 2))
  const rC = 2 * Math.sqrt((cBarPrime ** 7) / (cBarPrime ** 7 + 25 ** 7))
  const sL = 1 + (0.015 * (lBar - 50) ** 2) / Math.sqrt(20 + (lBar - 50) ** 2)
  const sC = 1 + 0.045 * cBarPrime
  const sH = 1 + 0.015 * cBarPrime * t
  const rT = -Math.sin(radians(2 * deltaTheta)) * rC
  return Math.sqrt(
    (deltaL / sL) ** 2 +
      (deltaC / sC) ** 2 +
      (deltaBigH / sH) ** 2 +
      rT * (deltaC / sC) * (deltaBigH / sH),
  )
}
