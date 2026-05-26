"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useWallet } from "../../providers/Web3Provider";

export default function Header() {
  const { address, chainId, isConnected, isAuthenticated, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const loadStatus = async () => {
      const response = await fetch("/api/platform/status", { cache: "no-store" });
      const payload = await response.json();
      if (payload.ok) setStatus(payload.data);
    };

    loadStatus();
    const timer = setInterval(loadStatus, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleConnect = async () => {
    if (isConnected) {
      disconnectWallet();
      toast("钱包已从交易终端断开");
      return;
    }

    try {
      await connectWallet();
      toast.success("钱包签名登录成功，已创建独立交易账户");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formattedAddress = isAuthenticated ? `${address.slice(0, 6)}...${address.slice(-4)}` : "签名登录";
  const onlineCount = status?.components?.filter((item) => item.status === "online").length ?? 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#051124]/95 border-b border-blue-900/40 backdrop-blur px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold italic shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              S
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              SAFE<span className="text-blue-500">EX</span>
            </span>
          </div>
          <span className="text-[10px] text-blue-700 font-bold uppercase tracking-widest mt-0.5">
            Regulated Digital Asset Venue
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-5 border-l border-blue-900/50 pl-8">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase">系统组件</span>
            <span className="text-xs font-mono text-green-400">{onlineCount}/5 Online</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase">运营模式</span>
            <span className="text-xs font-mono text-blue-300">{status?.mode ?? "loading"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase">合规</span>
            <span className="text-xs font-mono text-emerald-300">KYC + Risk Engine</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {[
            { label: "市场", href: "/" },
            { label: "交易", href: "/trade" },
            { label: "资产", href: "/proof-of-reserves" },
            { label: "风控", href: "/risk-disclosure" },
            { label: "机构", href: "/institutional" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="text-gray-400 hover:text-white transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`flex items-center gap-2 px-5 py-2 rounded font-bold text-xs transition-all active:scale-95 ${
            isConnected
              ? "bg-blue-500/10 border border-blue-500/50 text-blue-300 hover:bg-blue-500/20"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isAuthenticated ? "bg-green-500 animate-pulse" : "bg-blue-200"}`} />
          {isConnecting ? "连接中..." : formattedAddress}
          {chainId ? <span className="text-[10px] text-blue-500">#{chainId}</span> : null}
        </button>
      </div>
    </header>
  );
}
