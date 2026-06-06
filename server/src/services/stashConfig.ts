import process from 'node:process'

export type StashConfig = Record<string, Record<string, number>>

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

export function readStashConfig(): StashConfig {
  const rawJson = process.env.POE_STASH_CURRENCIES_JSON

  if (!rawJson) {
    return {}
  }

  try {
    const parsed = JSON.parse(rawJson)
    const root = asRecord(parsed)
    if (!root) {
      return {}
    }

    const result: StashConfig = {}

    for (const [league, value] of Object.entries(root)) {
      const leagueEntries = asRecord(value)
      if (!leagueEntries) {
        continue
      }

      const normalized: Record<string, number> = {}
      for (const [currency, amount] of Object.entries(leagueEntries)) {
        if (typeof amount === 'number' && amount >= 0) {
          normalized[currency] = amount
        }
      }

      result[league] = normalized
    }

    return result
  } catch {
    return {}
  }
}
