import { ASSET_RISK_TIERS, DEFAULT_ACCOUNT_ID, PAIR_BY_SYMBOL, TRADING_PAIRS } from "./catalog";
import { getTicker } from "./market";

const initialBalances = {
  USDT: { available: 124500, locked: 0 },
  BTC: { available: 0.421, locked: 0 },
  ETH: { available: 8.5, locked: 0 },
  SOL: { available: 180, locked: 0 },
  BNB: { available: 45, locked: 0 },
  ADA: { available: 24000, locked: 0 },
  XRP: { available: 18000, locked: 0 },
  DOT: { available: 1300, locked: 0 },
};

function createState() {
  return {
    accounts: {
      [DEFAULT_ACCOUNT_ID]: {
        id: DEFAULT_ACCOUNT_ID,
        legalName: "Demo Institutional Desk",
        tier: "enterprise",
        kycStatus: "verified",
        riskLimitUsd: 250000,
        balances: structuredClone(initialBalances),
      },
    },
    orders: [],
    trades: [],
    auditLog: [],
    sequence: 100000,
  };
}

function getState() {
  if (!globalThis.__SAFE_EXCHANGE_STATE__) {
    globalThis.__SAFE_EXCHANGE_STATE__ = createState();
  }
  return globalThis.__SAFE_EXCHANGE_STATE__;
}

function round(value, digits = 8) {
  return Number(Number(value).toFixed(digits));
}

function accountIdFromWallet(address) {
  return address ? `wallet:${address.toLowerCase()}` : DEFAULT_ACCOUNT_ID;
}

function createWalletAccount(address) {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return {
    id: accountIdFromWallet(address),
    walletAddress: address,
    legalName: `Wallet Account ${shortAddress}`,
    tier: "sandbox",
    kycStatus: "wallet-verified",
    riskLimitUsd: 50000,
    balances: structuredClone(initialBalances),
  };
}

function getOrCreateAccount(accountId = DEFAULT_ACCOUNT_ID, walletAddress = "") {
  const state = getState();
  const resolvedAccountId = walletAddress ? accountIdFromWallet(walletAddress) : accountId;

  if (!state.accounts[resolvedAccountId] && walletAddress) {
    state.accounts[resolvedAccountId] = createWalletAccount(walletAddress);
    writeAudit(resolvedAccountId, "ACCOUNT_CREATED", { walletAddress });
  }

  return state.accounts[resolvedAccountId] ?? state.accounts[DEFAULT_ACCOUNT_ID];
}

function assertValidOrder(input) {
  const pair = PAIR_BY_SYMBOL[input.symbol];
  const side = input.side === "sell" ? "sell" : "buy";
  const type = input.type === "limit" ? "limit" : "market";
  const amount = Number(input.amount);
  const limitPrice = input.limitPrice === undefined || input.limitPrice === "" ? undefined : Number(input.limitPrice);

  if (!pair) {
    return { ok: false, error: "UNSUPPORTED_PAIR", message: "该交易对暂未开放交易。" };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "INVALID_AMOUNT", message: "请输入大于 0 的交易数量。" };
  }

  if (type === "limit" && (!Number.isFinite(limitPrice) || limitPrice <= 0)) {
    return { ok: false, error: "INVALID_PRICE", message: "限价单需要有效价格。" };
  }

  return { ok: true, pair, side, type, amount, limitPrice };
}

function upsertBalance(account, asset) {
  if (!account.balances[asset]) {
    account.balances[asset] = { available: 0, locked: 0 };
  }
  return account.balances[asset];
}

function writeAudit(accountId, action, payload) {
  const state = getState();
  state.auditLog.unshift({
    id: `AUD-${++state.sequence}`,
    accountId,
    action,
    payload,
    ts: new Date().toISOString(),
  });
  state.auditLog = state.auditLog.slice(0, 80);
}

export async function getPortfolio(accountId = DEFAULT_ACCOUNT_ID, walletAddress = "") {
  const state = getState();
  const account = getOrCreateAccount(accountId, walletAddress);
  const tickers = await Promise.all(TRADING_PAIRS.map((pair) => getTicker(pair.symbol)));
  const priceByAsset = Object.fromEntries(tickers.map((ticker) => [ticker.baseAsset, ticker.lastPrice]));
  priceByAsset.USDT = 1;

  const assets = Object.entries(account.balances).map(([asset, balance]) => {
    const price = priceByAsset[asset] ?? 0;
    const total = balance.available + balance.locked;
    return {
      asset,
      available: round(balance.available),
      locked: round(balance.locked),
      total: round(total),
      usdValue: round(total * price, 2),
      riskTier: ASSET_RISK_TIERS[asset] ?? "watchlist",
    };
  });

  const equityUsd = assets.reduce((sum, asset) => sum + asset.usdValue, 0);
  const exposurePct = account.riskLimitUsd > 0 ? equityUsd / account.riskLimitUsd : 0;

  return {
    account: {
      id: account.id,
      legalName: account.legalName,
      walletAddress: account.walletAddress ?? "",
      tier: account.tier,
      kycStatus: account.kycStatus,
      riskLimitUsd: account.riskLimitUsd,
      equityUsd: round(equityUsd, 2),
      exposurePct: round(exposurePct * 100, 2),
    },
    assets,
    recentOrders: state.orders.filter((order) => order.accountId === account.id).slice(0, 8),
    recentTrades: state.trades.filter((trade) => trade.accountId === account.id).slice(0, 8),
    auditLog: state.auditLog.filter((event) => event.accountId === account.id).slice(0, 6),
  };
}

export function listOrders(accountId = DEFAULT_ACCOUNT_ID) {
  const state = getState();
  return state.orders.filter((order) => order.accountId === accountId).slice(0, 50);
}

export async function placeOrder(rawInput, accountId = DEFAULT_ACCOUNT_ID, walletAddress = "") {
  const state = getState();
  const account = getOrCreateAccount(accountId, walletAddress);
  const validation = assertValidOrder(rawInput);

  if (!validation.ok) {
    return { ok: false, status: 400, ...validation };
  }

  const { pair, side, type, amount, limitPrice } = validation;
  const ticker = await getTicker(pair.symbol);
  const executionPrice = type === "limit" ? limitPrice : ticker.lastPrice;
  const notional = amount * executionPrice;
  const feeRate = type === "limit" ? pair.makerFeeRate : pair.takerFeeRate;
  const fee = notional * feeRate;

  if (notional < pair.minNotional) {
    return {
      ok: false,
      status: 400,
      error: "MIN_NOTIONAL",
      message: `单笔订单金额需不低于 ${pair.minNotional} ${pair.quoteAsset}。`,
    };
  }

  if (notional > account.riskLimitUsd * 0.25) {
    return {
      ok: false,
      status: 409,
      error: "RISK_LIMIT",
      message: "该订单超过单笔风险限额，请拆分订单或提升机构额度。",
    };
  }

  const baseBalance = upsertBalance(account, pair.baseAsset);
  const quoteBalance = upsertBalance(account, pair.quoteAsset);
  const orderId = `SX-${++state.sequence}`;
  const now = new Date().toISOString();

  if (side === "buy") {
    const cost = notional + fee;
    if (quoteBalance.available < cost) {
      return { ok: false, status: 409, error: "INSUFFICIENT_BALANCE", message: `${pair.quoteAsset} 可用余额不足。` };
    }

    quoteBalance.available = round(quoteBalance.available - cost);
    baseBalance.available = round(baseBalance.available + amount);
  } else {
    if (baseBalance.available < amount) {
      return { ok: false, status: 409, error: "INSUFFICIENT_BALANCE", message: `${pair.baseAsset} 可用余额不足。` };
    }

    baseBalance.available = round(baseBalance.available - amount);
    quoteBalance.available = round(quoteBalance.available + notional - fee);
  }

  const order = {
    id: orderId,
    accountId: account.id,
    symbol: pair.symbol,
    side,
    type,
    amount: round(amount, pair.precision.amount),
    price: round(executionPrice, pair.precision.price),
    notional: round(notional, 2),
    fee: round(fee, 6),
    feeAsset: pair.quoteAsset,
    status: "filled",
    createdAt: now,
    filledAt: now,
    venue: "SafeExchange internal spot book",
  };

  const trade = {
    id: `TRD-${++state.sequence}`,
    orderId,
    accountId: account.id,
    symbol: pair.symbol,
    side,
    amount: order.amount,
    price: order.price,
    notional: order.notional,
    fee: order.fee,
    createdAt: now,
  };

  state.orders.unshift(order);
  state.trades.unshift(trade);
  state.orders = state.orders.slice(0, 100);
  state.trades = state.trades.slice(0, 100);
  writeAudit(account.id, "ORDER_FILLED", { orderId, symbol: pair.symbol, side, notional: order.notional });

  return { ok: true, order, trade };
}

export function getPlatformStatus() {
  const state = getState();
  return {
    name: "SafeExchange",
    mode: "enterprise-sandbox",
    uptime: process.uptime(),
    components: [
      { name: "Market Data Gateway", status: "online", latencyMs: 38 },
      { name: "Risk Engine", status: "online", latencyMs: 4 },
      { name: "Portfolio Ledger", status: "online", latencyMs: 7 },
      { name: "Wallet Connector", status: "ready", latencyMs: 12 },
      { name: "Compliance Monitor", status: "online", latencyMs: 15 },
    ],
    controls: {
      kycRequired: true,
      restrictedJurisdictions: ["US sanctioned regions", "OFAC lists"],
      proofOfReserves: "scheduled",
      withdrawalPolicy: "manual approval above risk threshold",
    },
    totals: {
      ordersInMemory: state.orders.length,
      auditsInMemory: state.auditLog.length,
    },
    ts: new Date().toISOString(),
  };
}
