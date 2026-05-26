import Link from "next/link";
import React from "react";
import { footerSections } from "../../lib/site/pages";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#080d16] text-gray-400 border-t border-blue-900/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-white text-xl font-bold mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-sm">S</div>
              <span>SafeExchange</span>
            </Link>
            <p className="text-sm leading-6 max-w-sm text-gray-500">
              面向机构与专业用户的数字资产交易基础设施，覆盖现货交易、法币通道、资产证明、风控审计与钱包连接。
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-[11px]">
              <div className="rounded border border-blue-900/40 bg-[#051124] p-3">
                <p className="text-gray-600">合规控制</p>
                <p className="mt-1 font-mono text-green-400">KYC / KYB Ready</p>
              </div>
              <div className="rounded border border-blue-900/40 bg-[#051124] p-3">
                <p className="text-gray-600">资产透明</p>
                <p className="mt-1 font-mono text-blue-300">PoR Framework</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-white font-semibold mb-4 text-sm">{section.title}</h4>
                <ul className="space-y-2 text-xs">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="hover:text-blue-400 transition-colors">
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-blue-900/30 pt-8 mt-10">
          <div className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded border border-yellow-500/20 bg-yellow-500/5 p-4">
              <p className="text-[11px] leading-5 text-yellow-100/70">
                <strong className="text-yellow-100 mr-1">风险警告:</strong>
                数字资产交易涉及重大风险，可能导致本金损失。用户应自行评估风险承受能力，并确认所在地法律是否允许使用相关服务。
                SafeExchange 不向受限司法管辖区、制裁名单主体或无法完成合规审查的客户提供服务。
              </p>
            </div>
            <div className="rounded border border-blue-900/40 bg-[#051124] p-4 text-[11px] leading-5 text-gray-500">
              <p className="text-gray-300 font-bold mb-1">法律与政策提示</p>
              <p>所有政策页面均为正式产品信息架构和条款模板，上线前需由目标市场的法律、合规、税务与安全团队复核。</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px]">
            <div className="flex flex-wrap items-center gap-4">
              <span>© {currentYear} SafeExchange. All Rights Reserved.</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                系统在线
              </span>
              <Link href="/status" className="hover:text-blue-400">服务状态</Link>
              <Link href="/risk-disclosure" className="hover:text-blue-400">风险披露</Link>
            </div>

            <div className="flex items-center gap-6">
              <span className="hover:text-white cursor-pointer">简体中文</span>
              <span className="hover:text-white cursor-pointer">USD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
