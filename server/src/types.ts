import type { ServerConfig } from './config'
import type { PoeGateway } from './gateway/poeGateway'
import type { StashConfig } from './services/stashConfig'

export interface AppDependencies {
  config: ServerConfig
  gateway: PoeGateway
  stashConfig: StashConfig
}
