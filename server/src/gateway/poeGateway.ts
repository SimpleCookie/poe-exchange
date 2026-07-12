import { ApiError } from '../errors'

interface RateTriple {
  a: number
  b: number
  c: number
}

interface ApiResponse {
  ok: boolean
  status: number
  body: unknown
}

export interface LeaguesResponse {
  leagues: Array<{
    id?: string
    name?: string
    startAt?: string | null
    rules?: Array<{ id?: string; name?: string }>
  }>
}

export interface CurrencyExchangeResponse {
  next_change_id?: number
  markets: Array<{
    league: string
    market_id: string
    volume_traded: Record<string, number>
    lowest_ratio: Record<string, number>
    highest_ratio: Record<string, number>
    lowest_stock: Record<string, number>
    highest_stock: Record<string, number>
  }>
}

interface OAuthTokenResponse {
  access_token: string
}

interface GatewayOptions {
  oauthUrl: string
  apiBaseUrl: string
  requestedScope: string
  userAgent: string
  clientId: string
  clientSecret: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function parseCsvTriples(value: string | null): RateTriple[] {
  if (!value) {
    return []
  }

  return value.split(',').map((entry) => {
    const [left, middle, right] = entry.trim().split(':')
    return {
      a: Number(left),
      b: Number(middle),
      c: Number(right),
    }
  })
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function hasAccessToken(value: unknown): value is OAuthTokenResponse {
  const record = asRecord(value)
  return Boolean(record && typeof record.access_token === 'string')
}

export class PoeGateway {
  private readonly oauthUrl: string
  private readonly apiBaseUrl: string
  private readonly requestedScope: string
  private readonly userAgent: string
  private readonly clientId: string
  private readonly clientSecret: string

  private token: string | null = null
  private blockedUntil = 0
  private nextRequestAt = 0
  // Serializes all outbound PoE API requests so concurrent callers cannot
  // bypass the pacing enforced by waitForRateWindow / captureRateLimitState.
  private requestQueue: Promise<unknown> = Promise.resolve()
  private leaguesCache: { expiresAt: number; value: LeaguesResponse | null } = {
    expiresAt: 0,
    value: null,
  }
  private marketCache = new Map<string, { expiresAt: number; value: CurrencyExchangeResponse }>()

  constructor(options: GatewayOptions) {
    this.oauthUrl = options.oauthUrl
    this.apiBaseUrl = options.apiBaseUrl
    this.requestedScope = options.requestedScope
    this.userAgent = options.userAgent
    this.clientId = options.clientId
    this.clientSecret = options.clientSecret
  }

  async getLeagues(queryString: string): Promise<LeaguesResponse> {
    const now = Date.now()

    if (this.leaguesCache.value && this.leaguesCache.expiresAt > now) {
      return this.leaguesCache.value
    }

    const payload = await this.requestJson<LeaguesResponse>(`/league${queryString}`)
    this.leaguesCache = {
      value: payload,
      expiresAt: now + 5 * 60 * 1000,
    }

    return payload
  }

  async getCurrencyExchange(path: string): Promise<CurrencyExchangeResponse> {
    const now = Date.now()
    const cached = this.marketCache.get(path)

    if (cached && cached.expiresAt > now) {
      return cached.value
    }

    const payload = await this.requestJson<CurrencyExchangeResponse>(path)
    // Hourly digest data is immutable once published. Cache for 55 minutes so
    // repeated requests within the same hour never hit the PoE API again.
    this.marketCache.set(path, {
      value: payload,
      expiresAt: now + 55 * 60 * 1000,
    })

    return payload
  }

  private async requestJson<T>(path: string): Promise<T> {
    const data = await this.enqueueRequest(path)

    if (!data.ok) {
      const message = this.extractApiMessage(data.body) ?? `PoE API request failed (${data.status})`
      throw new ApiError(data.status, message, data.body)
    }

    return data.body as T
  }

  /**
   * Enqueues a request so that only one outbound PoE API call can be in-flight
   * at a time. This ensures the rate-limit pacing state is read and written by
   * at most one call at once, preventing concurrent requests from both reading
   * the same "next window" and bursting together.
   */
  private enqueueRequest(path: string): Promise<ApiResponse> {
    const next = this.requestQueue.then(() => this.requestWithRetries(path))
    // Let the queue continue even if this particular request throws.
    this.requestQueue = next.catch(() => undefined)
    return next
  }

  private async requestWithRetries(path: string): Promise<ApiResponse> {
    const maxAttempts = 4
    let tokenRefreshed = false

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      await this.waitForRateWindow()
      const token = await this.getToken(false)

      const response = await fetch(`${this.apiBaseUrl}${path}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'User-Agent': this.userAgent,
        },
      })

      this.captureRateLimitState(response.headers)
      const body = await this.safeJson(response)

      // 401: refresh token once. A second 401 means the token is truly invalid —
      // retrying again would just rack up more 4xx hits toward the ban threshold.
      if (response.status === 401 && !tokenRefreshed && attempt < maxAttempts) {
        tokenRefreshed = true
        await this.getToken(true)
        continue
      }

      // 403: wrong scope or revoked access — retrying will never succeed and every
      // 4xx counts toward the invalid-request ban threshold, so bail immediately.
      if (response.status === 403) {
        return { ok: false, status: response.status, body }
      }

      if (response.status === 429 && attempt < maxAttempts) {
        const retryAfterSeconds = Number(response.headers.get('Retry-After') ?? 1)
        const delayMs = Math.max(1000, retryAfterSeconds * 1000)
        this.blockedUntil = Math.max(this.blockedUntil, Date.now() + delayMs)
        await sleep(delayMs)
        continue
      }

      if (response.status >= 500 && attempt < maxAttempts) {
        const delayMs = Math.min(10_000, 500 * 2 ** attempt)
        await sleep(delayMs)
        continue
      }

      return {
        ok: response.ok,
        status: response.status,
        body,
      }
    }

    throw new ApiError(503, 'PoE API unavailable after retries')
  }

  private async getToken(forceRefresh: boolean): Promise<string> {
    if (this.token && !forceRefresh) {
      return this.token
    }

    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
      scope: this.requestedScope,
    })

    const response = await fetch(this.oauthUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.userAgent,
      },
      body,
    })

    const payload = await this.safeJson(response)

    if (!response.ok || !hasAccessToken(payload)) {
      const message = this.extractApiMessage(payload) ?? 'Unable to request OAuth token'
      throw new ApiError(response.status || 500, message, payload)
    }

    this.token = payload.access_token
    return payload.access_token
  }

  private async waitForRateWindow(): Promise<void> {
    const waitUntil = Math.max(this.nextRequestAt, this.blockedUntil)
    const remaining = waitUntil - Date.now()

    if (remaining > 0) {
      await sleep(remaining)
    }
  }

  private captureRateLimitState(headers: Headers): void {
    this.nextRequestAt = Date.now() + 250

    const retryAfterSeconds = Number(headers.get('Retry-After') ?? 0)
    if (retryAfterSeconds > 0) {
      this.blockedUntil = Math.max(this.blockedUntil, Date.now() + retryAfterSeconds * 1000)
    }

    const rules = (headers.get('X-Rate-Limit-Rules') ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)

    for (const rule of rules) {
      const limitTriples = parseCsvTriples(headers.get(`X-Rate-Limit-${rule}`))
      const stateTriples = parseCsvTriples(headers.get(`X-Rate-Limit-${rule}-State`))

      for (let i = 0; i < stateTriples.length; i += 1) {
        const state = stateTriples[i]
        const limit = limitTriples[i]

        if (!state) {
          continue
        }

        if (state.c > 0) {
          this.blockedUntil = Math.max(this.blockedUntil, Date.now() + state.c * 1000)
        }

        if (!limit || !Number.isFinite(limit.a) || !Number.isFinite(limit.b)) {
          continue
        }

        if (state.a >= limit.a - 1) {
          this.nextRequestAt = Math.max(this.nextRequestAt, Date.now() + limit.b * 1000)
        }
      }
    }
  }

  private extractApiMessage(payload: unknown): string | null {
    const data = asRecord(payload)
    if (!data) {
      return null
    }

    if (typeof data.error === 'string') {
      if (typeof data.error_description === 'string') {
        return `${data.error}: ${data.error_description}`
      }

      return data.error
    }

    const nestedError = asRecord(data.error)
    if (nestedError && typeof nestedError.message === 'string') {
      return nestedError.message
    }

    return null
  }

  private async safeJson(response: Response): Promise<unknown> {
    try {
      return await response.json()
    } catch {
      return null
    }
  }
}
