import Fastify, { type FastifyInstance } from 'fastify'
import cookie from '@fastify/cookie'
import { ApiError } from './errors'
import type { AppDependencies } from './types'
import { healthRoutes } from './routes/healthRoutes'
import { oauthRoutes } from './routes/oauthRoutes'
import { poeRoutes } from './routes/poeRoutes'

export function createApp(deps: AppDependencies): FastifyInstance {
  // trustProxy lets Fastify read X-Forwarded-Proto from Traefik/nginx so cookies can be
  // marked secure correctly behind the reverse proxy.
  const app = Fastify({ logger: true, trustProxy: true })

  void app.register(cookie)
  void app.register(healthRoutes, { config: deps.config })
  void app.register(oauthRoutes, deps)
  void app.register(poeRoutes, deps)

  app.setNotFoundHandler(async (_request, reply) => {
    reply.code(404)
    return { error: 'Not found' }
  })

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ApiError) {
      reply.code(error.status || 500).send({
        error: error.message,
        details: error.payload,
      })
      return
    }

    const fallbackMessage = error instanceof Error ? error.message : String(error)
    app.log.error({ err: fallbackMessage }, 'Unexpected proxy error')

    reply.code(500).send({
      error: 'Unexpected proxy error',
    })
  })

  return app
}
