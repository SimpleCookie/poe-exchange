import { CURRENCY_NAME_TO_CODE } from '../lib/currencyNames'

export interface StashHolding {
  league: string
  currency: string
  amount: number
}

interface StashTabSummary {
  id: string
  type: string
  name: string
}

interface StashItem {
  typeLine: string
  stackSize?: number
}

async function fetchUserJson<T>(url: string, userToken: string, userAgent: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${userToken}`,
      'User-Agent': userAgent,
    },
  })

  if (!response.ok) {
    throw new Error(`PoE stash request failed (${response.status}) for ${url}`)
  }

  return (await response.json()) as T
}

/**
 * Reads the user's Currency stash tabs for a given league and returns aggregated holdings
 * keyed by the CX API currency codes (e.g. "chaos", "divine").
 *
 * Only tabs of type "CurrencyStash" are read to avoid excessive API calls.
 * A maximum of 5 such tabs are processed.
 */
export async function readStashCurrencies(
  league: string,
  userToken: string,
  userAgent: string,
  apiBaseUrl: string,
): Promise<StashHolding[]> {
  const leagueEncoded = encodeURIComponent(league)

  const { stashes } = await fetchUserJson<{ stashes: StashTabSummary[] }>(
    `${apiBaseUrl}/stash/${leagueEncoded}`,
    userToken,
    userAgent,
  )

  const currencyTabs = stashes.filter((tab) => tab.type === 'CurrencyStash')

  const holdings: Record<string, number> = {}

  for (const tab of currencyTabs.slice(0, 5)) {
    const { stash: tabData } = await fetchUserJson<{ stash: { items?: StashItem[] } }>(
      `${apiBaseUrl}/stash/${leagueEncoded}/${tab.id}`,
      userToken,
      userAgent,
    )

    for (const item of tabData.items ?? []) {
      const code = CURRENCY_NAME_TO_CODE[item.typeLine]
      if (code && item.stackSize && item.stackSize > 0) {
        holdings[code] = (holdings[code] ?? 0) + item.stackSize
      }
    }
  }

  return Object.entries(holdings).map(([currency, amount]) => ({ league, currency, amount }))
}
