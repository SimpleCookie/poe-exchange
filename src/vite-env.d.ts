/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EXCHANGE_CLIENT?: 'fixture' | 'api'
  readonly VITE_POE_PROXY_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
