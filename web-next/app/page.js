"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import TradeArea from "./components/TradeArea";
import OrderBook from "./components/OrderBook";
import News from "./components/News";
import { useWallet } from "../providers/Web3Provider";
// ✨ 保留并激活了你引入的直连行情函数
import { getTickers } from "@/app/lib/exchange/market";

const fallbackPairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "ADA/USDT", "XRP/USDT", "DOT/USDT"];

export default function Home() {
  const { address, isAuthenticated } = useWallet();
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [tickers, setTickers] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [lastRefresh, setLastRefresh] = useState("");

  // 保留原有的资产刷新功能
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
      try {
        // ✨ 修改核心：让浏览器用用户的网络直连 getTickers()，绕过 Vercel 机房 403 封锁
        const rawData = await getTickers();
        if (rawData && rawData.length > 0) {
          setTickers(rawData);
          setLastRefresh(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error("前端直连币安失败，尝试降级走本地 API 路由:", err);
        // ✨ 安全垫：万一用户本地没挂梯子连不上币安，自动无缝降级走你原本的本地接口
        const response = await fetch("/api/market/ticker", { cache: "no-store" });
        const payload = await response.json();
        if (payload.ok) {
          setTickers(Array.isArray(payload.data) ? payload.data : [payload.data]);
          setLastRefresh(new Date().toLocaleTimeString());
        }
      }
    };

    // 网页首次加载，立即抓取一次行情与资产
    loadTickers();
    refreshPortfolio();

    // 维持原有的定时器逻辑（为了行情更灵敏，这里将刷新时间从 6 秒微调为了 4 秒，如果你想换回 6 秒把 4000 改成 6000 即可）
    const timer = setInterval(() => {
      loadTickers();
      refreshPortfolio();
    }, 4000);

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