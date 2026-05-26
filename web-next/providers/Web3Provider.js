"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { ethers } from "ethers";

const WalletContext = createContext({
  address: "",
  chainId: "",
  session: null,
  isConnected: false,
  isAuthenticated: false,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export function Web3Provider({ children }) {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("");
  const [session, setSession] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("未检测到浏览器钱包，请安装 MetaMask 或兼容 EIP-1193 的钱包。");
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      const walletAddress = accounts[0] ?? "";
      if (!walletAddress) {
        throw new Error("钱包没有返回可用账户。");
      }

      const nonceResponse = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress }),
      });
      const noncePayload = await nonceResponse.json();

      if (!nonceResponse.ok || !noncePayload.ok) {
        throw new Error(noncePayload.message || "无法创建登录挑战。");
      }

      const signer = provider.getSigner();
      const signature = await signer.signMessage(noncePayload.message);
      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress, signature }),
      });
      const verifyPayload = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyPayload.ok) {
        throw new Error(verifyPayload.message || "钱包签名验证失败。");
      }

      setAddress(walletAddress);
      setChainId(String(network.chainId));
      setSession(verifyPayload.session);
      return verifyPayload.session;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress("");
    setChainId("");
    setSession(null);
  };

  const value = useMemo(
    () => ({
      address,
      chainId,
      session,
      isConnected: Boolean(address),
      isAuthenticated: Boolean(session),
      isConnecting,
      connectWallet,
      disconnectWallet,
    }),
    [address, chainId, session, isConnecting]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  return useContext(WalletContext);
}
