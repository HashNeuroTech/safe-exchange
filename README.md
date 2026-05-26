# SafeExchange

Enterprise digital asset exchange terminal built with Next.js.

## Run Locally

```bash
cd web-next
npm install
npm run dev
```

Open `http://localhost:3000`.

## Services

```bash
docker compose up --build
```

The Docker setup includes:

- `web-next`: trading terminal
- `postgres`: exchange ledger database
- `redis`: cache and future event bus

## Implemented

- Real market ticker, candles, and order book endpoints with fallback data.
- Portfolio, balance, order, trade, and audit state.
- Buy/sell order ticket with risk checks and balance mutation.
- Browser wallet connection through EIP-1193 and ethers.
- Production headers, standalone build output, and hardened Docker runtime.

See `docs/ENTERPRISE_ROADMAP.md` for commercial hardening steps.
