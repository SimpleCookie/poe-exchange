import { z } from 'zod'

const realmSchema = z.enum(['pc', 'xbox', 'sony', 'poe2'])

export const leaguesQuerySchema = z.object({
  realm: realmSchema.optional(),
  type: z.enum(['main', 'event', 'season']).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
})

export const currencyExchangeQuerySchema = z.object({
  realm: realmSchema.optional(),
  id: z.string().regex(/^\d+$/).optional(),
})

export const stashCurrenciesQuerySchema = z.object({
  league: z.string().min(1).max(100).optional(),
})
