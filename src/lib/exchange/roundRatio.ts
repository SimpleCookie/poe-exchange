/**
 * Snaps a typed exchange ratio to the nearest "nice" fraction that's easy to set up as a bulk
 * listing in-game (e.g. 4.2, 4.25, 4.5) instead of an awkward value like 4.173.
 *
 * Tries a set of step sizes from coarsest to finest and keeps whichever candidate lands closest
 * to the original value, preferring the coarser (simpler) step on a tie.
 */
const NICE_STEPS = [1, 0.5, 0.25, 0.1, 0.05, 0.01]

export function roundToNiceFraction(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return value
  }

  let best = value
  let bestDiff = Infinity

  for (const step of NICE_STEPS) {
    const candidate = Math.round(value / step) * step
    const diff = Math.abs(candidate - value)

    if (diff < bestDiff - 1e-9) {
      bestDiff = diff
      best = candidate
    }
  }

  // Clean up floating point noise (e.g. 4.5000000000000004).
  return Math.round(best * 100) / 100
}
