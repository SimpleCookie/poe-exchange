# PoE Exchange Profit Calc

This app supports two modes:

- `fixture`: local static data for development.
- `api`: live Path of Exile data through a local OAuth proxy server.

The proxy is required so your OAuth client secret never ships to the browser.

## Run Locally (fixture data, no API keys needed)

The fastest way to run the app locally uses built-in fixture data — no PoE OAuth
credentials, proxy server, or network access required.

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`). The app
defaults to `VITE_EXCHANGE_CLIENT=fixture`, so leagues, exchange markets, and
stash holdings are all served from [`src/data/exchangeFixtures.ts`](src/data/exchangeFixtures.ts)
instead of the real PoE API.

## Client Modes

Set `VITE_EXCHANGE_CLIENT`:

- `fixture` (default): uses local fixture data for leagues, exchange markets, and stash holdings.
- `api`: uses live data via `GET /api/poe/*` endpoints proxied by Vite.

Example `.env.local`:

```bash
VITE_EXCHANGE_CLIENT=api
# Optional; defaults to /api/poe
VITE_POE_PROXY_BASE_URL=/api/poe
```

You do not need to rename `.env.local` to `.env` for local Vite development.

## OAuth Proxy Setup

To run against the real PoE API instead of fixtures, you'll need the OAuth proxy:

1. Copy `server/.env.example` to `server/.env.local`.
2. Fill in your values:
	 - `POE_CLIENT_ID`
	 - `POE_CLIENT_SECRET`
	 - `POE_CONTACT` (email or contact URI for User-Agent)
3. Keep `POE_SCOPE=service:cxapi service:leagues` for this app.
4. Optionally set `POE_STASH_CURRENCIES_JSON` for your affordability model.
5. Set `VITE_EXCHANGE_CLIENT=api` in `.env.local` (see [Client Modes](#client-modes) above).

Run both processes:

```bash
npm run dev:proxy
npm run dev
```

Vite forwards `/api/poe/*` to `http://127.0.0.1:8787` in development.

## Docker

This repo includes a Docker setup for both frontend and proxy:

- `Dockerfile.frontend`: builds Vite app and serves it with Nginx.
- `Dockerfile.proxy`: runs the Fastify OAuth proxy.
- `docker-compose.yml`: starts both services together.

### 1. Prepare server env

Copy `server/.env.example` to `server/.env` and fill in:

- `POE_CLIENT_ID`
- `POE_CLIENT_SECRET`
- `POE_CONTACT`

### 2. Start stack

```bash
docker compose up --build
```

### 3. Open app

- Frontend: `http://localhost:8080`

The frontend proxies `/api/poe/*` through Nginx to the proxy container.

## Security + Policy Requirements

- Never put `POE_CLIENT_SECRET` in frontend env vars (`VITE_*`) or committed code.
- The proxy sets the required User-Agent format:
	- `User-Agent: OAuth {clientId}/{version} (contact: {contact}) ...`
- The UI includes the required notice:
	- `This product isn't affiliated with or endorsed by Grinding Gear Games in any way.`
- This project only uses documented endpoints:
	- `GET /league`
	- `GET /currency-exchange[/realm][/id]`

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Rate Limit + Error Handling

The proxy applies conservative controls from PoE response headers:

- Parses `X-Rate-Limit-*` and `X-Rate-Limit-*-State` headers.
- Honors `Retry-After` on `429`.
- Applies a minimum inter-request delay.
- Retries `429` and `5xx` responses with bounded backoff.
- Caches league responses for 5 minutes and exchange responses for 60 seconds.

These controls reduce invalid-request bursts and help avoid access revocation risk.

## Architecture

- `src/lib/exchange/exchangeClient.ts`: interface contract for all clients.
- `src/lib/exchange/fixtureExchangeClient.ts`: fixture implementation.
- `src/lib/exchange/poeApiExchangeClient.ts`: browser client calling the local proxy.
- `src/lib/exchange/createExchangeClient.ts`: mode-based client factory.
- `src/data/exchangeFixtures.ts`: fixture datasets.
- `server/poeProxyServer.ts`: proxy bootstrap entrypoint.
- `server/src/config.ts`: env loading and validated server config.
- `server/src/gateway/poeGateway.ts`: OAuth token flow, PoE API calls, retries, and rate-limit handling.
- `server/src/services/stashConfig.ts`: stash holdings config parsing.
- `server/src/routes/healthRoutes.ts`: health endpoint plugin.
- `server/src/routes/poeRoutes.ts`: PoE API route plugin.
- `server/src/app.ts`: Fastify composition and global error handlers.
