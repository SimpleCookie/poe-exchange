/**
 * PoE's currency-exchange API mostly returns short codes (e.g. "chaos", "divine"), but some
 * niche items — league-specific currencies like Harvest seeds — come back as full item class
 * paths instead, e.g. "Metadata/Items/Currency/HarvestSeedGreen". Rendering that raw path breaks
 * table layouts (long unbroken string, no wrap points) and is not user-friendly, so this turns it
 * into a readable label for display purposes only.
 */

/**
 * Some item class paths use internal GGG naming that doesn't match the in-game display name at
 * all (e.g. Chaos Orb's class name literally is "CurrencyRerollRare" because it rerolls a rare
 * item's modifiers). Override those known cases instead of showing the confusing internal name.
 */
const KNOWN_ITEM_LABELS: Record<string, string> = {
  CurrencyRerollRare: 'Chaos Orb',
  CurrencyModValues: 'Divine Orb',
}

export function formatCurrencyLabel(raw: string): string {
  const lastSegment = raw.includes('/') ? (raw.split('/').pop() ?? raw) : raw

  const knownLabel = KNOWN_ITEM_LABELS[lastSegment]
  if (knownLabel) {
    return knownLabel
  }

  // Split camelCase / PascalCase into separate words, e.g. "HarvestSeedGreen" -> "Harvest Seed Green".
  return lastSegment.replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim()
}
