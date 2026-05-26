import React from "react";

export default function News({ portfolio }) {
  const account = portfolio?.account;
  const recentOrders = portfolio?.recentOrders ?? [];

  return (
    <section className="bg-[#051124] border-t border-blue-900/40 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr] gap-0">
        <div className="p-4 border-r border-blue-900/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm uppercase tracking-widest text-blue-100">企业账户</h2>
            <span className="text-[10px] text-green-400">{account?.kycStatus ?? "loading"}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-gray-500 text-[10px] uppercase">净资产</p>
              <p className="font-mono text-white">${Number(account?.equityUsd ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase">风险占用</p>
              <p className="font-mono text-emerald-300">{Number(account?.exposurePct ?? 0).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase">账户等级</p>
              <p className="font-mono text-blue-300">{account?.tier ?? "--"}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-r border-blue-900/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm uppercase tracking-widest text-blue-100">最近成交</h2>
            <span className="text-[10px] text-blue-400">{recentOrders.length} orders</span>
          </div>
          <div className="space-y-2">
            {recentOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between text-[11px]">
                <span className={order.side === "buy" ? "text-green-400" : "text-red-400"}>{order.side.toUpperCase()}</span>
                <span className="text-gray-400">{order.symbol}</span>
                <span className="font-mono text-blue-100">{order.amount}</span>
              </div>
            ))}
            {recentOrders.length === 0 ? <p className="text-[11px] text-gray-600">暂无成交，提交订单后会出现在这里。</p> : null}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm uppercase tracking-widest text-blue-100">平台特色</h2>
            <span className="text-[10px] text-blue-400">SafeEX Shield</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-[#08162d] border border-blue-900/30 rounded p-2">
              <p className="text-gray-500">风险引擎</p>
              <p className="text-green-400 font-mono">pre-trade checks</p>
            </div>
            <div className="bg-[#08162d] border border-blue-900/30 rounded p-2">
              <p className="text-gray-500">资产证明</p>
              <p className="text-blue-300 font-mono">reserve ready</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
