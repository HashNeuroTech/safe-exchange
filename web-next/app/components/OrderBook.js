"use client";

import React, { useEffect, useMemo, useState } from "react";

function formatNumber(value, digits = 2) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export default function OrderBook({ currentPair = "BTC/USDT" }) {
  const [book, setBook] = useState({ bids: [], asks: [], source: "loading" });

  useEffect(() => {
    let isMounted = true;

    const loadBook = async () => {
      const response = await fetch(`/api/market/orderbook?symbol=${encodeURIComponent(currentPair)}&levels=14`, {
        cache: "no-store",
      });
      const payload = await response.json();
      if (isMounted && payload.ok) setBook(payload.data);
    };

    loadBook();
    const timer = setInterval(loadBook, 2500);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [currentPair]);

  const midPrice = useMemo(() => {
    const bid = Number(book.bids?.[0]?.price ?? 0);
    const ask = Number(book.asks?.[0]?.price ?? 0);
    return bid && ask ? (bid + ask) / 2 : bid || ask;
  }, [book]);

  const maxAmount = useMemo(() => {
    const amounts = [...(book.bids ?? []), ...(book.asks ?? [])].map((order) => Number(order.amount));
    return Math.max(...amounts, 1);
  }, [book]);

  const renderOrderList = (list, isBuy) => (
    <div className="flex flex-col text-[11px] font-mono">
      {list.map((order, index) => {
        const amount = Number(order.amount);
        const width = Math.min((amount / maxAmount) * 100, 100);
        return (
          <div
            key={`${order.price}-${index}`}
            className="relative flex justify-between h-6 items-center px-2 hover:bg-blue-500/10 cursor-pointer overflow-hidden group"
          >
            <div className={`absolute right-0 h-full transition-all duration-700 ${isBuy ? "bg-green-500/10" : "bg-red-500/10"}`} style={{ width: `${width}%` }} />
            <span className={`z-10 w-1/3 text-left font-bold ${isBuy ? "text-green-400" : "text-red-400"}`}>
              {formatNumber(order.price, Number(order.price) > 10 ? 2 : 4)}
            </span>
            <span className="z-10 w-1/3 text-right text-blue-100 group-hover:scale-105 transition-transform">
              {formatNumber(order.amount, 5)}
            </span>
            <span className="z-10 w-1/3 text-right text-gray-500">{formatNumber(order.total, 2)}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col bg-[#051124] border-l border-blue-900/30 p-0 min-w-[320px] h-full shadow-2xl select-none">
      <div className="flex justify-between items-center p-3 border-b border-blue-900/20">
        <div>
          <h3 className="text-sm font-bold text-blue-100 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            订单簿
          </h3>
          <p className="text-[10px] text-gray-600 mt-1">{book.source}</p>
        </div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 bg-green-500/40 rounded-sm" />
          <div className="w-3 h-3 bg-red-500/40 rounded-sm" />
        </div>
      </div>

      <div className="flex justify-between px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
        <span className="w-1/3 text-left">价格</span>
        <span className="w-1/3 text-right">数量</span>
        <span className="w-1/3 text-right">累计</span>
      </div>

      <div className="flex-grow flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">{renderOrderList([...(book.asks ?? [])].reverse(), false)}</div>

        <div className="flex items-center justify-between px-3 py-4 my-1 bg-blue-900/5 border-y border-blue-900/20">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black leading-none text-green-400">{formatNumber(midPrice)}</span>
            <span className="text-xs text-green-400">MARK</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 font-mono">fair price</div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">{renderOrderList(book.bids ?? [], true)}</div>
      </div>

      <div className="p-4 bg-[#08162d] border-t border-blue-900/40">
        <div className="flex justify-between items-center mb-3 text-[11px]">
          <span className="font-bold text-gray-400">撮合策略</span>
          <span className="text-blue-500">price-time priority</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
          <div className="bg-[#051124] rounded p-2">
            <p>Tick size</p>
            <p className="font-mono text-blue-100">dynamic</p>
          </div>
          <div className="bg-[#051124] rounded p-2">
            <p>Surveillance</p>
            <p className="font-mono text-green-400">enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
