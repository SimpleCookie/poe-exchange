import { loadServerConfig } from './src/config'
import { PoeGateway } from './src/gateway/poeGateway'
import { readStashConfig } from './src/services/stashConfig'
import { createApp } from './src/app'

const config = loadServerConfig()
const gateway = new PoeGateway({
  oauthUrl: config.oauthUrl,
  apiBaseUrl: config.apiBaseUrl,
  requestedScope: config.requestedScope,
  userAgent: config.userAgent,
  clientId: config.clientId,
  clientSecret: config.clientSecret,
})
const stashConfig = readStashConfig()
const app = createApp({ config, gateway, stashConfig })

void app.listen({ port: config.port, host: config.host }).then(() => {
  app.log.info(`PoE OAuth proxy listening on http://${config.host}:${config.port}`)
})
