/**
 * Maps PoE1 currency item display names (as returned by the stash API's `typeLine`)
 * to the currency codes used by the Currency Exchange API's market_id field.
 */
export const CURRENCY_NAME_TO_CODE: Record<string, string> = {
  // Core currencies
  'Chaos Orb': 'chaos',
  'Divine Orb': 'divine',
  'Exalted Orb': 'exalted',
  'Mirror of Kalandra': 'mirror',
  'Eternal Orb': 'eternal',

  // Annulment / crafting
  'Orb of Annulment': 'annulment',
  "Rogue's Marker": 'rogues-marker',

  // Alteration family
  'Orb of Alteration': 'alteration',
  'Orb of Augmentation': 'aug',
  'Regal Orb': 'regal',

  // Alchemy family
  'Orb of Alchemy': 'alchemy',
  'Orb of Transmutation': 'transmute',
  'Orb of Chance': 'chance',
  'Orb of Scouring': 'scouring',
  'Blessed Orb': 'blessed',

  // Fusing / linking
  'Orb of Fusing': 'fusing',
  "Jeweller's Orb": 'jewellers',
  'Chromatic Orb': 'chromatic',

  // Quality currencies
  "Gemcutter's Prism": 'gcp',
  "Cartographer's Chisel": 'chisel',
  "Blacksmith's Whetstone": 'whetstone',
  "Armourer's Scrap": 'armourers-scrap',

  // Currency for maps / endgame
  'Orb of Regret': 'regret',
  'Vaal Orb': 'vaal',
  'Orb of Binding': 'binding',
  'Orb of Horizons': 'horizons',
  "Engineer's Orb": 'engineers',
  'Ancient Orb': 'ancient',
  "Harbinger's Orb": 'harbingers',

  // Awakening / maven era
  "Awakener's Orb": 'awakeners',
  "Maven's Orb": 'mavens',
  'Sacred Orb': 'sacred',

  // Eldritch currencies
  'Eldritch Chaos Orb': 'eldritch-chaos',
  'Eldritch Exalted Orb': 'eldritch-exalted',
  'Eldritch Orb of Annulment': 'eldritch-annul',
  'Grand Eldritch Ichors': 'grand-ichors',
  'Grand Eldritch Embers': 'grand-embers',
  'Lesser Eldritch Ichors': 'lesser-ichors',
  'Lesser Eldritch Embers': 'lesser-embers',
  'Greater Eldritch Ichors': 'greater-ichors',
  'Greater Eldritch Embers': 'greater-embers',
  'Exceptional Eldritch Ichors': 'exceptional-ichors',
  'Exceptional Eldritch Embers': 'exceptional-embers',
}
