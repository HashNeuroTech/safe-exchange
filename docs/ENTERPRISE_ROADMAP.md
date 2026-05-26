# SafeExchange Enterprise Roadmap

## Product Positioning

SafeExchange is now shaped as an enterprise digital asset venue rather than a simple demo terminal. The first production-grade slice includes market data, a portfolio ledger, pre-trade risk checks, order submission, execution records, wallet connectivity, compliance status, and audit events.

## Current MVP Scope

- Real market data gateway with Binance public data and deterministic fallback data.
- Spot trading terminal with ticker, chart, order book, account balances, order submission, and recent fills.
- In-memory portfolio ledger for fast local development.
- Pre-trade controls for unsupported pairs, invalid amount, minimum notional, balance checks, and single-order risk limits.
- Wallet connection through browser-native EIP-1193 providers using ethers.
- Wallet signature login with nonce challenge and server-side signature verification.
- Wallet-scoped sandbox accounts, portfolios, orders, trades, and audit events.
- Platform status endpoint for operational components and compliance controls.
- Database schema prepared for users, accounts, trading pairs, orders, and audit events.
- Production Dockerfile with standalone Next.js output and non-root runtime user.

## Commercial Hardening Checklist

1. Replace the in-memory ledger with PostgreSQL transactions and row-level locks.
2. Add authentication, session management, MFA, and RBAC for retail, institutional, operations, and admin roles.
3. Add KYC/KYB provider integration and jurisdiction gating.
4. Add a real matching engine or connect to a regulated liquidity venue.
5. Add deposit and withdrawal services with hot/cold wallet separation, approval workflows, and address screening.
6. Add market surveillance for wash trading, spoofing, rate abuse, and self-trade prevention.
7. Add proof-of-reserves reporting and liabilities snapshots.
8. Add observability: structured logs, metrics, tracing, alerts, and incident runbooks.
9. Add secrets management and environment-specific configuration.
10. Add full test coverage for order lifecycle, ledger invariants, risk limits, and wallet workflows.

## Wallet Login Model

SafeExchange does not start or control Hardhat. The browser connects to whichever EIP-1193 wallet provider is active, such as MetaMask. If MetaMask is set to a local Hardhat network, the connected account will look like a Hardhat test account. In production, users connect their own MetaMask or compatible wallet in their own browser.

The current implementation uses a nonce challenge:

1. Frontend requests `POST /api/auth/nonce` for the selected wallet address.
2. User signs the SafeExchange login message in their wallet.
3. Frontend submits the signature to `POST /api/auth/verify`.
4. Server verifies the signature and creates a wallet-scoped session record.
5. Portfolio and order APIs use the wallet address header to isolate sandbox accounts.

Production should replace the in-memory session store with signed HTTP-only cookies, CSRF protection, persistent sessions, device management, MFA, and a durable user/wallet identity table.

## API Surface

- `GET /api/market/ticker`
- `GET /api/market/ticker?symbol=BTC/USDT`
- `GET /api/market/candles?symbol=BTC/USDT&interval=1m&limit=80`
- `GET /api/market/orderbook?symbol=BTC/USDT&levels=14`
- `GET /api/account/portfolio`
- `GET /api/orders`
- `POST /api/orders`
- `GET /api/platform/status`

## Characteristic Features

- SafeEX Shield: pre-trade risk checks, audit log, compliance status, and withdrawal policy hooks.
- Enterprise Account View: KYC status, risk utilization, portfolio equity, recent fills.
- Market Resilience: external feed first, fallback feed when provider access fails.
- Wallet-Ready Architecture: wallet connection is separated from the trading ledger, so custodial and non-custodial modes can evolve independently.
