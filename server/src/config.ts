import process from 'node:process'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: 'server/.env.local', override: false })
loadEnv({ path: 'server/.env', override: false })

const DEFAULT_PORT = 8787
const DEFAULT_REALM = 'pc'
const DEFAULT_SCOPE = 'service:cxapi service:leagues'

export interface ServerConfig {
  oauthUrl: string
  apiBaseUrl: string
  defaultRealm: string
  requestedScope: string
  userAgent: string
  port: number
  host: string
  clientId: string
  clientSecret: string
}

export function loadServerConfig(): ServerConfig {
  const clientId = process.env.POE_CLIENT_ID ?? ''
  const clientSecret = process.env.POE_CLIENT_SECRET ?? ''
  const contact = process.env.POE_CONTACT ?? ''
  const appVersion = process.env.POE_APP_VERSION ?? '0.1.0'
  const userAgentSuffix = process.env.POE_USER_AGENT_SUFFIX ?? 'PoE Exchange Profit Calc Proxy'

  if (!clientId || !clientSecret || !contact) {
    throw new Error('Missing required env vars: POE_CLIENT_ID, POE_CLIENT_SECRET, POE_CONTACT')
  }

  return {
    oauthUrl: 'https://www.pathofexile.com/oauth/token',
    apiBaseUrl: 'https://api.pathofexile.com',
    defaultRealm: DEFAULT_REALM,
    requestedScope: process.env.POE_SCOPE ?? DEFAULT_SCOPE,
    userAgent: `OAuth ${clientId}/${appVersion} (contact: ${contact}) ${userAgentSuffix}`.trim(),
    port: Number(process.env.POE_PROXY_PORT ?? DEFAULT_PORT),
    host: process.env.POE_PROXY_HOST ?? '127.0.0.1',
    clientId,
    clientSecret,
  }
}
