import type { FastifyPluginAsync } from 'fastify'
import type { AppDependencies } from '../types'
import {
  currencyExchangeQuerySchema,
  leaguesQuerySchema,
  stashCurrenciesQuerySchema,
} from './querySchemas'
import { parseQueryOrReply } from './validation'

export const poeRoutes: FastifyPluginAsync<AppDependencies> = async (app, deps) => {
  app.get('/api/poe/leagues', async (request, reply) => {
    const parsedQuery = parseQueryOrReply(leaguesQuerySchema, request.query, reply)
    if (!parsedQuery) {
      return
    }

    const params = new URLSearchParams()
    params.set('realm', parsedQuery.realm ?? deps.config.defaultRealm)
    params.set('type', parsedQuery.type ?? 'main')
    if (parsedQuery.limit) {
      params.set('limit', parsedQuery.limit)
    }
    if (parsedQuery.offset) {
      params.set('offset', parsedQuery.offset)
    }

    return await deps.gateway.getLeagues(`?${params.toString()}`)
  })

  app.get('/api/poe/currency-exchange', async (request, reply) => {
    const parsedQuery = parseQueryOrReply(currencyExchangeQuerySchema, request.query, reply)
    if (!parsedQuery) {
      return
    }

    const realm = parsedQuery.realm ?? deps.config.defaultRealm
    const id = parsedQuery.id
    const realmPath = realm === 'pc' ? '' : `/${encodeURIComponent(realm)}`
    const idPath = id ? `/${encodeURIComponent(id)}` : ''
    const endpoint = `/currency-exchange${realmPath}${idPath}`

    return await deps.gateway.getCurrencyExchange(endpoint)
  })

  app.get('/api/poe/stash-currencies', async (request, reply) => {
    const parsedQuery = parseQueryOrReply(stashCurrenciesQuerySchema, request.query, reply)
    if (!parsedQuery) {
      return
    }

    const league = parsedQuery.league ?? ''
    const entries = deps.stashConfig[league]

    if (!entries) {
      return { stash: [] }
    }

    const stash = Object.entries(entries).map(([currency, amount]) => ({
      league,
      currency,
      amount,
    }))

    return { stash }
  })
}
