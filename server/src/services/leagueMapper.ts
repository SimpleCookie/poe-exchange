import type { LeaguesResponse } from '../gateway/poeGateway'

export interface LeagueSummary {
  id: string
  /** League name with known Hardcore/SSF prefixes stripped, for grouping variants of the same league. */
  baseId: string
  startAt: string | null
  hardcore: boolean
  ssf: boolean
}

const HARDCORE_SSF_PREFIX = 'HC SSF '
const HARDCORE_PREFIX = 'Hardcore '
const SSF_PREFIX = 'SSF '

/**
 * Derives the display name shared by all mode variants of a league (e.g. "Mercenaries" for
 * "Hardcore Mercenaries"). The hardcore/ssf flags come from the authoritative `rules` field, so
 * this only needs to strip the prefix PoE is known to use for that combination — it is not
 * guessing the mode from the name.
 */
function stripKnownPrefix(name: string, hardcore: boolean, ssf: boolean): string {
  let base = name

  if (hardcore && ssf && base.startsWith(HARDCORE_SSF_PREFIX)) {
    base = base.slice(HARDCORE_SSF_PREFIX.length)
  } else {
    if (ssf && base.startsWith(SSF_PREFIX)) {
      base = base.slice(SSF_PREFIX.length)
    }
    if (hardcore && base.startsWith(HARDCORE_PREFIX)) {
      base = base.slice(HARDCORE_PREFIX.length)
    }
  }

  // The permanent Hardcore league is named "Hardcore" (and its SSF variant "SSF Hardcore"),
  // not "Hardcore Standard" — special-case it so it still groups under the "Standard" base.
  if (hardcore && base === 'Hardcore') {
    base = 'Standard'
  }

  return base
}

/** Maps the raw PoE `/league` payload into sorted, flagged summaries for the frontend. */
export function mapLeagues(raw: LeaguesResponse): LeagueSummary[] {
  const summaries = raw.leagues
    .map((league): LeagueSummary | null => {
      const id = league.id ?? league.name
      if (!id) {
        return null
      }

      const ruleIds = new Set((league.rules ?? []).map((rule) => rule.id))
      const hardcore = ruleIds.has('Hardcore')
      const ssf = ruleIds.has('NoParties')

      return {
        id,
        baseId: stripKnownPrefix(id, hardcore, ssf),
        startAt: league.startAt ?? null,
        hardcore,
        ssf,
      }
    })
    .filter((league): league is LeagueSummary => league !== null)

  return summaries.sort((left, right) => {
    if (left.startAt === right.startAt) {
      return 0
    }
    if (left.startAt === null) {
      return 1
    }
    if (right.startAt === null) {
      return -1
    }
    return right.startAt.localeCompare(left.startAt)
  })
}
