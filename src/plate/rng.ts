export function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function seedForTrial(seed: number, index: number): number {
  return (Math.imul(seed | 0, 1664525) + Math.imul(index | 0, 1013904223)) >>> 0
}
