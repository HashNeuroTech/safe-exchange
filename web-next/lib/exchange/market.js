import { PAIR_BY_SYMBOL, TRADING_PAIRS } from "./catalog";

const BINANCE_BASE_URL = "https://api.binance.com";

const seedPrices = {
  "BTC/USDT": 51234.5,
  "ETH/USDT": 2945.12,
  "BNB/USDT": 382.15,
  "SOL/USDT": 108.42,
  "ADA/USDT": 0.62,
  "XRP/USDT": 0.58,
  "DOT/USDT": 7.35,
};

const seedChange = {
  "BTC/USDT": 2.45,
  "ETH/USDT": -1.12,
  "BNB/USDT": 0.32,
  "SOL/USDT": 5.67,
  "ADA/USDT": -0.48,
  "XRP/USDT": 1.03,
  "DOT/USDT": -0.26,
};

function jitter(symbol, spread = 0.004) {
  const base = seedPrices[symbol] ?? 100;
  const dayPhase = Math.sin(Date.now() / 45000 + symbol.length);
  const tickPhase = Math.cos(Date.now() / 9000 + symbol.charCodeAt(0));
  return base * (1 + dayPhase * spread + tickPhase * spread * 0.35);
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

async function fetchJson(url, timeoutMs = 2500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Market provider returned ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function fallbackTicker(pair) {
  const price = jitter(pair.symbol);
  const changePct = seedChange[pair.symbol] ?? 0;

  return {
    symbol: pair.symbol,
    baseAsset: pair.baseAsset,
    quoteAsset: pair.quoteAsset,
    lastPrice: price,
    markPrice: price * 1.00008,
    indexPrice: price * 0.99991,
    changePct,
    high24h: price * (1 + Math.abs(changePct) / 100 + 0.012),
    low24h: price * (1 - Math.abs(changePct) / 100 - 0.008),
    volume24h: (price * 18500) / (pair.symbol.includes("BTC") ? 1 : 10),
    source: "SafeExchange synthetic feed",
    ts: new Date().toISOString(),
  };
}

export async function getTicker(symbol) {
  const pair = PAIR_BY_SYMBOL[symbol] ?? TRADING_PAIRS[0];

  try {
    const data = await fetchJson(`${BINANCE_BASE_URL}/api/v3/ticker/24hr?symbol=${pair.providerSymbol}`);
    return {
      symbol: pair.symbol,
      baseAsset: pair.baseAsset,
      quoteAsset: pair.quoteAsset,
      lastPrice: toNumber(data.lastPrice, seedPrices[pair.symbol]),
      markPrice: toNumber(data.weightedAvgPrice, seedPrices[pair.symbol]),
      indexPrice: toNumber(data.prevClosePrice, seedPrices[pair.symbol]),
      changePct: toNumber(data.priceChangePercent, seedChange[pair.symbol]),
      high24h: toNumber(data.highPrice),
      low24h: toNumber(data.lowPrice),
      volume24h: toNumber(data.quoteVolume),
      source: "Binance spot public market data",
      ts: new Date().toISOString(),
    };
  } catch (error) {
    return fallbackTicker(pair);
  }
}

export async function getTickers() {
  return Promise.all(TRADING_PAIRS.map((pair) => getTicker(pair.symbol)));
}

export async function getCandles(symbol, interval = "1m", limit = 80) {
  const pair = PAIR_BY_SYMBOL[symbol] ?? TRADING_PAIRS[0];
  const allowedInterval = ["1m", "5m", "15m", "1h", "4h", "1d"].includes(interval) ? interval : "1m";
  const safeLimit = Math.min(Math.max(Number(limit) || 80, 20), 240);

  try {
    const data = await fetchJson(
      `${BINANCE_BASE_URL}/api/v3/klines?symbol=${pair.providerSymbol}&interval=${allowedInterval}&limit=${safeLimit}`,
      3000
    );

    return data.map((row) => ({
      openTime: row[0],
      open: toNumber(row[1]),
      high: toNumber(row[2]),
      low: toNumber(row[3]),
      close: toNumber(row[4]),
      volume: toNumber(row[5]),
    }));
  } catch (error) {
    const now = Date.now();
    const base = jitter(pair.symbol);
    return Array.from({ length: safeLimit }, (_, index) => {
      const drift = Math.sin(index / 4) * base * 0.004;
      const candleBase = base + drift + (index - safeLimit) * base * 0.0001;
      const high = candleBase * 1.003;
      const low = candleBase * 0.997;
      return {
        openTime: now - (safeLimit - index) * 60000,
        open: candleBase * 0.999,
        high,
        low,
        close: candleBase,
        volume: 600 + index * 13,
      };
    });
  }
}

export async function getOrderBook(symbol, levels = 14) {
  const pair = PAIR_BY_SYMBOL[symbol] ?? TRADING_PAIRS[0];
  const safeLevels = Math.min(Math.max(Number(levels) || 14, 6), 40);

  try {
    const data = await fetchJson(`${BINANCE_BASE_URL}/api/v3/depth?symbol=${pair.providerSymbol}&limit=50`, 2500);
    return {
      symbol: pair.symbol,
      bids: data.bids.slice(0, safeLevels).map(([price, amount]) => ({
        price: toNumber(price),
        amount: toNumber(amount),
        total: toNumber(price) * toNumber(amount),
      })),
      asks: data.asks.slice(0, safeLevels).map(([price, amount]) => ({
        price: toNumber(price),
        amount: toNumber(amount),
        total: toNumber(price) * toNumber(amount),
      })),
      source: "Binance spot public depth",
      ts: new Date().toISOString(),
    };
  } catch (error) {
    const mid = jitter(pair.symbol);
    const bids = Array.from({ length: safeLevels }, (_, index) => {
      const amount = 0.15 + ((index * 7) % 12) / 10;
      const price = mid * (1 - (index + 1) * 0.0007);
      return { price, amount, total: price * amount };
    });
    const asks = Array.from({ length: safeLevels }, (_, index) => {
      const amount = 0.12 + ((index * 5) % 13) / 10;
      const price = mid * (1 + (index + 1) * 0.0007);
      return { price, amount, total: price * amount };
    });

    return {
      symbol: pair.symbol,
      bids,
      asks,
      source: "SafeExchange synthetic depth",
      ts: new Date().toISOString(),
    };
  }
}
