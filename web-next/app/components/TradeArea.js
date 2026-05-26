"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { useWallet } from "../../providers/Web3Provider";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

function formatCurrency(value, digits = 2) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export default function TradeArea({ currentPair = "BTC/USDT", portfolio, onOrderFilled, walletAddress = "" }) {
  const { address, isConnected, isAuthenticated } = useWallet();
  const [interval, setIntervalValue] = useState("1m");
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [ticker, setTicker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tradeType, setTradeType] = useState("buy");
  const [orderType, setOrderType] = useState("market");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [baseAsset, quoteAsset] = currentPair.split("/");
  const balances = useMemo(() => {
    const byAsset = Object.fromEntries((portfolio?.assets ?? []).map((asset) => [asset.asset, asset]));
    return {
      base: byAsset[baseAsset],
      quote: byAsset[quoteAsset],
    };
  }, [portfolio, baseAsset, quoteAsset]);

  useEffect(() => {
    let isMounted = true;

    const loadMarket = async () => {
      setIsLoading(true);
      const [tickerResponse, candlesResponse] = await Promise.all([
        fetch(`/api/market/ticker?symbol=${encodeURIComponent(currentPair)}`, { cache: "no-store" }),
        fetch(`/api/market/candles?symbol=${encodeURIComponent(currentPair)}&interval=${interval}&limit=80`, {
          cache: "no-store",
        }),
      ]);
      const tickerPayload = await tickerResponse.json();
      const candlesPayload = await candlesResponse.json();

      if (!isMounted) return;

      if (tickerPayload.ok) {
        setTicker(tickerPayload.data);
        setLimitPrice((prev) => prev || Number(tickerPayload.data.lastPrice).toFixed(2));
      }

      if (candlesPayload.ok) {
        const labels = candlesPayload.data.map((item) =>
          new Date(item.openTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
        const closes = candlesPayload.data.map((item) => item.close);
        const chartColor = Number(tickerPayload.data?.changePct ?? 0) >= 0 ? "#10b981" : "#ef4444";

        setChartData({
          labels,
          datasets: [
            {
              label: "价格",
              data: closes,
              borderColor: chartColor,
              borderWidth: 2,
              fill: true,
              backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 420);
                gradient.addColorStop(0, `${chartColor}33`);
                gradient.addColorStop(1, "rgba(5, 17, 36, 0)");
                return gradient;
              },
              pointRadius: 0,
              tension: 0.35,
            },
          ],
        });
      }

      setIsLoading(false);
    };

    loadMarket();
    const timer = setInterval(loadMarket, 7000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [currentPair, interval]);

  const estimatedPrice = orderType === "limit" ? Number(limitPrice) : Number(ticker?.lastPrice ?? 0);
  const estimatedNotional = Number(amount || 0) * estimatedPrice;
  const intervals = ["1m", "5m", "15m", "1h", "4h", "1d"];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(walletAddress ? { "x-wallet-address": walletAddress } : {}),
        },
        body: JSON.stringify({
          symbol: currentPair,
          side: tradeType,
          type: orderType,
          amount: Number(amount),
          limitPrice: orderType === "limit" ? Number(limitPrice) : undefined,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "订单提交失败");
      }

      toast.success(`${tradeType === "buy" ? "买入" : "卖出"}订单已成交 ${payload.order.amount} ${baseAsset}`);
      setAmount("");
      onOrderFilled?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col flex-auto bg-[#051124] text-white min-h-screen min-w-0">
      <div className="flex items-center justify-between px-6 py-3 border-b border-blue-900/30 bg-[#08162d]">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tight">{currentPair}</h2>
            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Spot Trading</span>
          </div>
          <div className="flex gap-8 items-center border-l border-blue-900/50 pl-6">
            <div className="flex flex-col">
              <span className={`text-lg font-mono font-bold ${Number(ticker?.changePct ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(ticker?.lastPrice)}
              </span>
              <span className="text-[10px] text-gray-500">{ticker?.source ?? "loading market data"}</span>
            </div>
            <div className="hidden md:flex flex-col text-[11px]">
              <span className="text-gray-500">24h high</span>
              <span className="font-mono">{formatCurrency(ticker?.high24h)}</span>
            </div>
            <div className="hidden md:flex flex-col text-[11px]">
              <span className="text-gray-500">24h low</span>
              <span className="font-mono">{formatCurrency(ticker?.low24h)}</span>
            </div>
            <div className="hidden xl:flex flex-col text-[11px]">
              <span className="text-gray-500">24h volume</span>
              <span className="font-mono">{formatCurrency(ticker?.volume24h, 0)} USDT</span>
            </div>
          </div>
        </div>

        <div className={`px-3 py-1 rounded text-[10px] font-bold border ${isConnected ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"}`}>
          {isAuthenticated ? `Signed in ${address.slice(0, 6)}...` : isConnected ? "Signature pending" : "Wallet not linked"}
        </div>
      </div>

      <div className="flex-grow flex flex-col p-4 min-h-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex bg-blue-950/40 p-1 rounded gap-1">
            {intervals.map((item) => (
              <button
                key={item}
                onClick={() => setIntervalValue(item)}
                className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                  interval === item ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-500 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>Equity: <span className="text-blue-300">${formatCurrency(portfolio?.account?.equityUsd)}</span></span>
            <span>Risk: <span className="text-emerald-300">{formatCurrency(portfolio?.account?.exposurePct)}%</span></span>
          </div>
        </div>

        <div className="flex-grow min-h-[390px] relative bg-[#051124]">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#051124]/50 backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <Line
            data={chartData}
            options={{
              animation: { duration: 700 },
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { grid: { color: "rgba(30, 58, 138, 0.12)" }, ticks: { color: "#64748b", font: { size: 10 } } },
                x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 10 } } },
              },
              plugins: { tooltip: { backgroundColor: "#0f172a", titleColor: "#3b82f6", boxPadding: 6 } },
            }}
          />
        </div>
      </div>

      <div className="p-5 bg-[#08162d] border-t border-blue-900/30">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 max-w-5xl mx-auto">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 bg-blue-950/50 p-1 rounded">
              <button onClick={() => setTradeType("buy")} className={`py-2 rounded font-bold text-sm transition-all ${tradeType === "buy" ? "bg-green-500 text-white" : "text-gray-500"}`}>
                买入
              </button>
              <button onClick={() => setTradeType("sell")} className={`py-2 rounded font-bold text-sm transition-all ${tradeType === "sell" ? "bg-red-500 text-white" : "text-gray-500"}`}>
                卖出
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {["market", "limit"].map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`py-2 rounded border ${orderType === type ? "border-blue-500 bg-blue-500/10 text-blue-200" : "border-blue-900/40 text-gray-500"}`}
                >
                  {type === "market" ? "市价单" : "限价单"}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="relative group">
                <span className="absolute left-3 top-2.5 text-[10px] text-gray-500 font-bold">价格</span>
                <input
                  type="number"
                  value={orderType === "market" ? formatCurrency(ticker?.lastPrice) : limitPrice}
                  disabled={orderType === "market"}
                  onChange={(event) => setLimitPrice(event.target.value)}
                  className="w-full bg-[#051124] border border-blue-900/50 rounded py-2 pl-12 pr-14 text-sm font-mono focus:border-blue-500 outline-none disabled:text-gray-500"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-gray-400">USDT</span>
              </label>
              <label className="relative group">
                <span className="absolute left-3 top-2.5 text-[10px] text-gray-500 font-bold">数量</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full bg-[#051124] border border-blue-900/50 rounded py-2 pl-12 pr-14 text-sm font-mono focus:border-blue-500 outline-none"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-gray-400">{baseAsset}</span>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isAuthenticated}
              className={`w-full py-3 rounded font-black text-sm shadow-xl transition-transform active:scale-95 disabled:opacity-60 ${
                tradeType === "buy" ? "bg-green-500 shadow-green-500/20" : "bg-red-500 shadow-red-500/20"
              }`}
            >
              {!isAuthenticated ? "签名登录后交易" : isSubmitting ? "风控校验中..." : `${tradeType === "buy" ? "立即买入" : "立即卖出"} ${baseAsset}`}
            </button>
          </div>

          <div className="bg-[#051124] border border-blue-900/40 rounded p-4">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-3">Institutional Account</p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">可用 {quoteAsset}</span>
                <span className="font-mono text-green-400">{formatCurrency(balances.quote?.available, 2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">可用 {baseAsset}</span>
                <span className="font-mono text-blue-100">{formatCurrency(balances.base?.available, 6)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">预计成交额</span>
                <span className="font-mono text-white">{formatCurrency(estimatedNotional, 2)} USDT</span>
              </div>
              <div className="pt-3 border-t border-blue-900/30 text-[10px] text-gray-500 leading-5">
                已启用最小成交额、余额、单笔风险限额与审计流水。
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
