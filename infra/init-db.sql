CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  kyc_status TEXT NOT NULL DEFAULT 'pending',
  risk_tier TEXT NOT NULL DEFAULT 'retail',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  asset TEXT NOT NULL,
  balance NUMERIC(30,8) DEFAULT 0,
  locked_balance NUMERIC(30,8) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_identities (
  id BIGSERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  wallet_address TEXT UNIQUE NOT NULL,
  chain_id TEXT,
  auth_method TEXT NOT NULL DEFAULT 'wallet-signature',
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_login_challenges (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  nonce TEXT NOT NULL,
  message TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  consumed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trading_pairs (
  symbol TEXT PRIMARY KEY,
  base_asset TEXT NOT NULL,
  quote_asset TEXT NOT NULL,
  min_notional NUMERIC(30,8) NOT NULL,
  maker_fee_rate NUMERIC(12,8) NOT NULL,
  taker_fee_rate NUMERIC(12,8) NOT NULL,
  status TEXT NOT NULL DEFAULT 'online',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id INT REFERENCES users(id),
  symbol TEXT NOT NULL REFERENCES trading_pairs(symbol),
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  order_type TEXT NOT NULL CHECK (order_type IN ('market', 'limit')),
  amount NUMERIC(30,8) NOT NULL,
  price NUMERIC(30,8) NOT NULL,
  notional NUMERIC(30,8) NOT NULL,
  fee NUMERIC(30,8) NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  filled_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGSERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_created_at ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_user_created_at ON audit_events(user_id, created_at DESC);
