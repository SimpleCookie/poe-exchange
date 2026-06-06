import type { FastifyPluginAsync } from 'fastify'
import type { ServerConfig } from '../config'

interface HealthRouteOptions {
  config: ServerConfig
}

export const healthRoutes: FastifyPluginAsync<HealthRouteOptions> = async (app, options) => {
  app.get('/health', async () => {
    return { ok: true, scope: options.config.requestedScope }
  })
}
