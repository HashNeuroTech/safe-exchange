import { ethers } from "ethers";

const NONCE_TTL_MS = 5 * 60 * 1000;

function getAuthState() {
  if (!globalThis.__SAFE_EXCHANGE_AUTH__) {
    globalThis.__SAFE_EXCHANGE_AUTH__ = {
      nonces: new Map(),
      sessions: new Map(),
    };
  }
  return globalThis.__SAFE_EXCHANGE_AUTH__;
}

function normalizeAddress(address) {
  try {
    return ethers.utils.getAddress(address);
  } catch (error) {
    return "";
  }
}

export function getWalletAddressFromRequest(request) {
  const raw = request.headers.get("x-wallet-address") ?? "";
  return normalizeAddress(raw);
}

export function createNonce(address) {
  const walletAddress = normalizeAddress(address);
  if (!walletAddress) {
    return { ok: false, error: "INVALID_ADDRESS", message: "钱包地址无效。" };
  }

  const state = getAuthState();
  const nonce = `SX-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const message = [
    "Sign in to SafeExchange",
    "",
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
    "Purpose: authenticate this browser session.",
    "This signature does not authorize a blockchain transaction.",
  ].join("\n");

  state.nonces.set(walletAddress, {
    nonce,
    message,
    expiresAt: Date.now() + NONCE_TTL_MS,
  });

  return { ok: true, address: walletAddress, nonce, message, expiresAt: new Date(Date.now() + NONCE_TTL_MS).toISOString() };
}

export function verifyWalletSignature({ address, signature }) {
  const walletAddress = normalizeAddress(address);
  if (!walletAddress || !signature) {
    return { ok: false, error: "INVALID_REQUEST", message: "钱包地址或签名缺失。" };
  }

  const state = getAuthState();
  const nonceRecord = state.nonces.get(walletAddress);

  if (!nonceRecord || nonceRecord.expiresAt < Date.now()) {
    return { ok: false, error: "NONCE_EXPIRED", message: "登录挑战已过期，请重新连接钱包。" };
  }

  let recovered;
  try {
    recovered = ethers.utils.verifyMessage(nonceRecord.message, signature);
  } catch (error) {
    return { ok: false, error: "BAD_SIGNATURE", message: "签名格式无效。" };
  }

  if (normalizeAddress(recovered) !== walletAddress) {
    return { ok: false, error: "SIGNATURE_MISMATCH", message: "签名地址与当前钱包不一致。" };
  }

  const session = {
    address: walletAddress,
    loginAt: new Date().toISOString(),
    authMethod: "wallet-signature",
    sessionId: `SES-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  };

  state.nonces.delete(walletAddress);
  state.sessions.set(walletAddress, session);

  return { ok: true, session };
}

export function getSession(address) {
  const walletAddress = normalizeAddress(address);
  if (!walletAddress) return null;
  return getAuthState().sessions.get(walletAddress) ?? null;
}
