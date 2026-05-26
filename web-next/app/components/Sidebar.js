"use client";

import React, { useMemo, useState } from "react";

function formatPrice(value) {
  if (!Number.isFinite(Number(value))) return "--";
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: Number(value) > 10 ? 2 : 4,
    maximumFractionDigits: Number(value) > 10 ? 2 : 4,
  });
}

export default function Sidebar({ availablePairs = [], onPairSelect, selectedPair, tickers = [], lastRefresh }) {
  const [query, setQuery] = useState("");
  const tickerBySymbol = useMemo(() => Object.fromEntries(tickers.map((ticker) => [ticker.symbol, ticker])), [tickers]);

  const filteredPairs = availablePairs.filter((pair) => pair.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <aside className="bg-[#051124] border-r border-blue-900/30 w-72 text-white flex flex-col h-full shadow-xl select-none">
      <div className="p-4 border-b border-blue-900/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-black text-sm text-blue-100 uppercase tracking-widest">市场矩阵</p>
            <p className="text-[10px] text-gray-600">实时行情 + 合规资产池</p>
          </div>
          <span className="text-[10px] text-green-400 font-mono">LIVE</span>
        </div>
        <input
          type="text"
          placeholder="搜索 BTC / ETH / SOL"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full bg-[#08162d] border border-blue-900/50 rounded px-3 py-2 text-[11px] text-blue-100 focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </div>

      <div className="flex justify-between px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight border-b border-blue-900/10">
        <span>交易对</span>
        <span className="text-right">价格 / 24h</span>
      </div>

      <ul className="flex-grow overflow-y-auto custom-scrollbar">
        {filteredPairs.map((pair) => {
          const data = tickerBySymbol[pair];
          const isSelected = pair === selectedPair;
          const isUp = Number(data?.changePct ?? 0) >= 0;

          return (
            <li
              key={pair}
              onClick={() => onPairSelect?.(pair)}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 border-l-2 ${
                isSelected ? "bg-blue-600/10 border-blue-500" : "border-transparent hover:bg-blue-900/20"
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className={`text-[12px] font-bold ${isSelected ? "text-blue-400" : "text-gray-200"}`}>
                    {pair.split("/")[0]}
                  </span>
                  <span className="text-[9px] text-gray-600">/{pair.split("/")[1]}</span>
                </div>
                <span className="text-[9px] text-gray-700">{data?.source?.includes("Binance") ? "external feed" : "fallback feed"}</span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[11px] font-mono text-gray-300">{formatPrice(data?.lastPrice)}</span>
                <span className={`text-[10px] font-medium ${isUp ? "text-green-500" : "text-red-500"}`}>
                  {isUp ? "up" : "down"} {Math.abs(Number(data?.changePct ?? 0)).toFixed(2)}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="p-3 bg-[#08162d] border-t border-blue-900/20">
        <div className="flex items-center justify-between text-[9px] text-gray-600">
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
            <span>Market gateway</span>
          </div>
          <span className="font-mono">{lastRefresh || "--:--:--"}</span>
        </div>
      </div>
    </aside>
  );
}
