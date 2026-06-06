import Fastify, { type FastifyInstance } from 'fastify'
import { ApiError } from './errors'
import type { AppDependencies } from './types'
import { healthRoutes } from './routes/healthRoutes'
import { poeRoutes } from './routes/poeRoutes'

export function createApp(deps: AppDependencies): FastifyInstance {
  const app = Fastify({ logger: true })

  void app.register(healthRoutes, { config: deps.config })
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

    reply.code(500).send({
      error: 'Unexpected proxy error',
      details: fallbackMessage,
    })
  })

  return app
}
