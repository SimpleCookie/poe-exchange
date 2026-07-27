/**
 * PoE's currency-exchange API returns full item-class paths for niche items, e.g.
 * "Metadata/Items/Currency/HarvestSeedGreen" or "Metadata/Items/Scarabs/ScarabRitual4". The
 * segment right after "Metadata/Items/" identifies the item's broad category (Currency,
 * Divination Cards, Scarabs, ...), which lets the UI offer a category filter instead of always
 * listing every item at once.
 */

/** Short codes like "chaos" or "divine" have no path — they're basic currency either way. */
const DEFAULT_CATEGORY = 'Currency'

const CATEGORY_LABELS: Record<string, string> = {
  Currency: 'Currency',
  DivinationCards: 'Divination Cards',
  Scarabs: 'Scarabs',
  MapFragments: 'Map Fragments',
  Delve: 'Delve',
  Heist: 'Heist',
  AtlasExiles: 'Atlas Exiles',
  Deepwater: 'Deepwater',
}

/** Extracts the category segment from a raw currency-exchange id (see module doc above). */
export function getCurrencyCategory(raw: string): string {
  if (!raw.includes('/')) {
    return DEFAULT_CATEGORY
  }

  const parts = raw.split('/')
  return parts.length >= 3 ? parts[2] : DEFAULT_CATEGORY
}

export function formatCategoryLabel(category: string): string {
  const known = CATEGORY_LABELS[category]
  if (known) {
    return known
  }

  // Fallback for categories not yet in the map above: split camelCase into separate words.
  return category.replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim()
}
