"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import TradeArea from "./components/TradeArea";
import OrderBook from "./components/OrderBook";
import News from "./components/News";
import { useWallet } from "../providers/Web3Provider";


const fallbackPairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "ADA/USDT", "XRP/USDT", "DOT/USDT"];

export default function Home() {
  const { address, isAuthenticated } = useWallet();
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [tickers, setTickers] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [lastRefresh, setLastRefresh] = useState("");

  const refreshPortfolio = async () => {
    const response = await fetch("/api/account/portfolio", {
      cache: "no-store",
      headers: address ? { "x-wallet-address": address } : {},
    });
    const payload = await response.json();
    if (payload.ok) setPortfolio(payload.data);
  };

  useEffect(() => {
    const loadTickers = async () => {
      const response = await fetch("/api/market/ticker", { cache: "no-store" });
      const payload = await response.json();
      if (payload.ok) {
        setTickers(Array.isArray(payload.data) ? payload.data : [payload.data]);
        setLastRefresh(new Date().toLocaleTimeString());
      }
    };

    loadTickers();
    refreshPortfolio();
    const timer = setInterval(() => {
      loadTickers();
      refreshPortfolio();
    }, 6000);

    return () => clearInterval(timer);
  }, [address, isAuthenticated]);

  const availablePairs = useMemo(() => {
    if (tickers.length === 0) return fallbackPairs;
    return tickers.map((ticker) => ticker.symbol);
  }, [tickers]);

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-[#051124]">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          availablePairs={availablePairs}
          onPairSelect={setSelectedPair}
          selectedPair={selectedPair}
          tickers={tickers}
          lastRefresh={lastRefresh}
        />

        <div className="flex flex-1 min-w-0">
          <TradeArea currentPair={selectedPair} portfolio={portfolio} onOrderFilled={refreshPortfolio} walletAddress={address} />
          <OrderBook currentPair={selectedPair} />
        </div>
      </div>

      <News portfolio={portfolio} />
    </div>
  );
}
