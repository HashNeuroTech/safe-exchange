export const footerSections = [
  {
    title: "产品",
    links: [
      { title: "现货交易", href: "/trade" },
      { title: "法币交易", href: "/otc" },
      { title: "API文档", href: "/docs" },
      { title: "费率标准", href: "/fees" },
    ],
  },
  {
    title: "服务",
    links: [
      { title: "上币申请", href: "/listing" },
      { title: "机构服务", href: "/institutional" },
      { title: "资产证明", href: "/proof-of-reserves" },
      { title: "帮助中心", href: "/support" },
    ],
  },
  {
    title: "政策",
    links: [
      { title: "政策中心", href: "/policy" },
      { title: "用户协议", href: "/terms" },
      { title: "隐私政策", href: "/privacy" },
      { title: "Cookie政策", href: "/cookies" },
    ],
  },
  {
    title: "合规",
    links: [
      { title: "风险披露", href: "/risk-disclosure" },
      { title: "服务状态", href: "/status" },
      { title: "安全中心", href: "/security" },
      { title: "联系我们", href: "/contact" },
    ],
  },
];

const commonNotice =
  "本页面为 SafeExchange 商用产品所需的正式信息架构与条款模板，具体上线前应由持牌法律、合规、税务及安全团队结合目标司法管辖区复核。";

export const sitePages = {
  trade: {
    title: "现货交易",
    eyebrow: "Spot Trading",
    summary: "面向专业交易者与机构账户的现货交易服务，支持实时行情、订单簿、交易前风控、成交审计与资产账本联动。",
    primaryAction: { label: "进入交易终端", href: "/" },
    secondaryAction: { label: "查看费率", href: "/fees" },
    highlights: ["实时行情与深度订单簿", "市价/限价订单工作流", "余额、最小成交额与风险限额检查", "成交、费用与审计流水"],
    sections: [
      {
        heading: "交易能力",
        body: "SafeExchange 现货模块将行情、订单、账户资产和风险检查放在同一个交易界面。企业账户可在下单前看到净资产、风险占用、可用余额和预计成交额。",
        items: ["支持 BTC/USDT、ETH/USDT、SOL/USDT 等主流交易对", "行情源异常时自动切换为内部回退行情", "订单成交后同步更新资产、成交记录和审计事件"],
      },
      {
        heading: "企业控制",
        body: "每笔订单进入撮合或模拟成交前都会执行基础风控。后续接入真实撮合引擎时，可扩展为额度、KYC、司法管辖区、黑名单、异常交易和自成交防护策略。",
      },
    ],
    notice: commonNotice,
  },
  otc: {
    title: "法币交易",
    eyebrow: "Fiat Gateway",
    summary: "为合规市场设计的法币入金、出金与场外兑换服务页面，强调 KYC/KYB、支付通道、限额、人工审核和风险拦截。",
    primaryAction: { label: "提交法币需求", href: "/contact" },
    secondaryAction: { label: "查看政策中心", href: "/policy" },
    highlights: ["KYC/KYB 后开放", "支付通道分级限额", "大额订单人工复核", "反洗钱与制裁名单筛查"],
    sections: [
      {
        heading: "服务范围",
        body: "法币交易适用于希望通过银行转账、合规支付渠道或授权 OTC 服务商完成入金、出金与大宗兑换的客户。",
        items: ["个人实名账户与企业 KYB 账户分层开通", "支持按地区配置支付方式、限额和审核规则", "所有入出金记录纳入审计流水和风险监测"],
      },
      {
        heading: "上线要求",
        body: "正式上线前需要接入持牌支付服务商、AML 服务、交易监控和客户身份识别流程，并明确不服务受限地区、制裁名单或高风险业务。",
      },
    ],
    notice: commonNotice,
  },
  docs: {
    title: "API文档",
    eyebrow: "Developer API",
    summary: "为做市商、机构客户和内部运营系统准备的 API 文档入口，覆盖行情、账户、订单、资产、状态和审计接口。",
    primaryAction: { label: "查看接口概览", href: "#api-overview" },
    secondaryAction: { label: "联系机构团队", href: "/institutional" },
    highlights: ["REST API", "行情与订单接口", "API Key 权限模型", "IP 白名单与签名校验规划"],
    sections: [
      {
        heading: "接口概览",
        anchor: "api-overview",
        body: "当前 MVP 已提供本地 REST API，后续生产环境应增加 API Key、HMAC 签名、时间戳、防重放、IP 白名单、限频和审计。",
        items: [
          "GET /api/market/ticker",
          "GET /api/market/candles?symbol=BTC/USDT&interval=1m",
          "GET /api/market/orderbook?symbol=BTC/USDT",
          "GET /api/account/portfolio",
          "GET /api/orders",
          "POST /api/orders",
          "GET /api/platform/status",
        ],
      },
      {
        heading: "生产安全要求",
        body: "机构 API 必须隔离读取、交易、提现和管理权限。交易权限默认不包含提现；提现权限必须额外审批，并结合地址白名单、额度、冷却期和多因素验证。",
      },
    ],
    notice: commonNotice,
  },
  fees: {
    title: "费率标准",
    eyebrow: "Fee Schedule",
    summary: "清晰披露交易、法币、提现、机构服务和特殊处理费，降低客户误解和合规风险。",
    highlights: ["Maker/Taker 费率", "机构阶梯费率", "链上网络费用", "大宗与 OTC 报价差"],
    sections: [
      {
        heading: "现货费率",
        body: "默认现货费率以交易对配置为准。MVP 中 BTC/USDT、ETH/USDT 等交易对已包含 maker/taker 费率字段，生产环境可扩展 VIP 等级与交易量阶梯。",
        items: ["Maker: 0.08% 起", "Taker: 0.10% 起", "机构客户可申请定制费率", "所有费用在成交记录中单独展示"],
      },
      {
        heading: "提现与网络费用",
        body: "链上提现费用应按网络实时状态动态计算。平台不得将网络拥堵、矿工费或验证者费误导为固定收益或可控成本。",
      },
    ],
    notice: commonNotice,
  },
  listing: {
    title: "上币申请",
    eyebrow: "Token Listing",
    summary: "项目方上币申请入口，覆盖资产尽调、合规审查、技术集成、安全评估、流动性方案和持续披露义务。",
    primaryAction: { label: "联系上币团队", href: "/contact" },
    secondaryAction: { label: "查看风险披露", href: "/risk-disclosure" },
    highlights: ["项目尽调", "智能合约审计", "流动性评估", "持续信息披露"],
    sections: [
      {
        heading: "申请材料",
        body: "项目方应提交主体信息、团队背景、代币经济模型、合约地址、审计报告、法律意见、市场流动性计划和风险披露材料。",
        items: ["公司或基金会注册资料", "代币分配、锁仓、解锁时间表", "合约审计与漏洞赏金记录", "主要做市、托管和钱包安排"],
      },
      {
        heading: "审查流程",
        body: "SafeExchange 可基于技术、安全、合规、流动性和用户保护原因拒绝或下架资产。任何上币费用、营销合作或做市安排都应单独披露。",
      },
    ],
    notice: commonNotice,
  },
  institutional: {
    title: "机构服务",
    eyebrow: "Institutional Desk",
    summary: "为基金、家族办公室、做市商、项目方与高净值客户提供企业账户、API 交易、风控额度、OTC 和报表服务。",
    primaryAction: { label: "预约机构开户", href: "/contact" },
    secondaryAction: { label: "查看 API 文档", href: "/docs" },
    highlights: ["KYB 企业开户", "专属费率与额度", "API 与子账户", "审计报表与对账"],
    sections: [
      {
        heading: "服务模块",
        body: "机构客户需要更强的权限隔离、审批链路、额度管理和对账能力。SafeExchange 的机构服务围绕交易效率和资金安全设计。",
        items: ["主账户/子账户与角色权限", "交易 API、只读 API 和报表 API", "大额交易人工服务与 OTC 报价", "月度账单、成交、费用和资产报表"],
      },
      {
        heading: "准入与治理",
        body: "机构服务默认要求 KYB、受益所有人识别、授权代表验证和制裁名单筛查。高风险行业、匿名结构或无法确认资金来源的申请应被拒绝。",
      },
    ],
    notice: commonNotice,
  },
  "proof-of-reserves": {
    title: "资产证明",
    eyebrow: "Proof of Reserves",
    summary: "面向用户和机构的资产透明度页面，规划储备地址披露、负债快照、Merkle 证明、审计报告和风险说明。",
    primaryAction: { label: "查看平台状态", href: "/status" },
    secondaryAction: { label: "了解安全中心", href: "/security" },
    highlights: ["储备资产披露", "负债快照", "Merkle 证明", "第三方审计规划"],
    sections: [
      {
        heading: "披露模型",
        body: "资产证明不等同于完整财务审计。正式上线时，应同时披露链上储备、用户负债快照、证明方法、审计时间、排除项和已知限制。",
        items: ["热钱包、冷钱包和托管地址分组披露", "按资产展示储备率和更新时间", "用户可验证自己是否纳入负债树", "异常变动触发公告和复核"],
      },
      {
        heading: "客户保护",
        body: "平台应避免用资产证明替代偿付能力、内部控制或法律义务披露。资产证明页面需要配合风险披露、服务状态和审计报告一起阅读。",
      },
    ],
    notice: commonNotice,
  },
  support: {
    title: "帮助中心",
    eyebrow: "Support Center",
    summary: "覆盖开户、充值提现、交易、风控、API、法币、账户安全和争议处理的客户支持入口。",
    primaryAction: { label: "联系我们", href: "/contact" },
    secondaryAction: { label: "查看安全中心", href: "/security" },
    highlights: ["账户与 KYC", "充值提现", "交易与订单", "API 与机构支持"],
    sections: [
      {
        heading: "常见问题",
        body: "帮助中心应优先解决用户最常见、最高风险的问题，并保留清晰的工单升级路径。",
        items: ["如何完成身份验证", "充值未到账如何处理", "订单为何被风控拒绝", "如何创建 API Key 与设置 IP 白名单", "如何申请机构账户"],
      },
      {
        heading: "服务承诺",
        body: "生产环境建议设置工单编号、响应时效、紧急冻结通道、资产误转处理规则和投诉升级机制。",
      },
    ],
    notice: commonNotice,
  },
  policy: {
    title: "政策中心",
    eyebrow: "Policy Hub",
    summary: "集中展示 SafeExchange 的用户条款、隐私、Cookie、风险披露、上币、费率、法币、资产证明和安全政策。",
    primaryAction: { label: "用户协议", href: "/terms" },
    secondaryAction: { label: "隐私政策", href: "/privacy" },
    highlights: ["条款版本管理", "合规披露", "客户保护", "争议处理"],
    sections: [
      {
        heading: "政策目录",
        body: "正式商用平台应保证所有关键政策可访问、可追溯、可归档，并在重大变更时通知用户。",
        items: ["用户协议", "隐私政策", "Cookie 政策", "风险披露", "费率标准", "资产证明说明", "上币与下架规则"],
      },
      {
        heading: "版本与通知",
        body: "条款变更应记录版本号、发布日期、生效日期和重大变更摘要。涉及费用、提现、数据处理或争议管辖的重大调整应提前通知。",
      },
    ],
    notice: commonNotice,
  },
  terms: {
    title: "用户协议",
    eyebrow: "Terms of Service",
    summary: "定义用户与平台之间的服务关系、账户义务、禁止行为、风险承担、费用、限制地区、终止、责任限制和争议处理。",
    highlights: ["账户资格", "禁止行为", "费用与订单", "服务限制与终止"],
    sections: [
      {
        heading: "账户与资格",
        body: "用户必须具备签署协议、使用数字资产服务和承担交易风险的法律能力。平台可要求身份验证、资金来源说明、授权代表文件或其他合规资料。",
      },
      {
        heading: "交易与订单",
        body: "用户确认订单一经提交可能立即执行。成交价格可能受市场波动、流动性、网络延迟、系统维护和第三方服务影响。用户应自行确认订单参数。",
      },
      {
        heading: "禁止行为",
        body: "禁止洗钱、恐怖融资、规避制裁、市场操纵、虚假交易、自成交滥用、盗用账户、攻击系统、绕过风控或提交虚假信息。",
      },
      {
        heading: "责任限制",
        body: "在法律允许范围内，平台不对用户因市场波动、第三方网络、链上拥堵、不可抗力、用户操作错误或账户凭证泄露造成的损失承担超出适用法律要求的责任。",
      },
    ],
    notice: commonNotice,
  },
  privacy: {
    title: "隐私政策",
    eyebrow: "Privacy Policy",
    summary: "说明 SafeExchange 如何收集、使用、存储、共享和保护个人信息、机构信息、交易数据、设备数据和合规资料。",
    highlights: ["身份与 KYB/KYC 数据", "交易与资产数据", "安全与风控数据", "用户权利与数据保留"],
    sections: [
      {
        heading: "我们收集的信息",
        body: "可能包括身份信息、联系方式、企业注册资料、受益所有人信息、设备与日志信息、交易记录、链上地址、支付信息、客服记录和合规筛查结果。",
      },
      {
        heading: "使用目的",
        body: "数据用于开户、身份验证、风险控制、交易执行、资产对账、客户支持、安全监控、法律合规、争议处理和产品改进。",
      },
      {
        heading: "共享与跨境",
        body: "平台可能与 KYC/KYB 服务商、支付服务商、托管方、审计方、云服务商、监管机构或执法机关共享必要数据。跨境传输应遵守适用法律并采用合理保护措施。",
      },
      {
        heading: "用户权利",
        body: "在适用法律允许范围内，用户可请求访问、更正、删除、限制处理或导出个人信息。部分数据因反洗钱、税务、审计或争议处理义务需要继续保留。",
      },
    ],
    notice: commonNotice,
  },
  cookies: {
    title: "Cookie政策",
    eyebrow: "Cookie Policy",
    summary: "说明平台使用必要 Cookie、偏好 Cookie、安全 Cookie、分析 Cookie 和第三方技术的方式。",
    highlights: ["必要 Cookie", "安全与风控", "偏好设置", "分析与改进"],
    sections: [
      {
        heading: "使用类型",
        body: "必要 Cookie 用于登录、会话、安全和交易功能；偏好 Cookie 用于语言、币种和界面设置；分析 Cookie 用于了解产品表现和稳定性。",
      },
      {
        heading: "用户选择",
        body: "用户可通过浏览器或平台设置管理非必要 Cookie。禁用必要 Cookie 可能导致登录、交易、风控或安全功能不可用。",
      },
      {
        heading: "第三方技术",
        body: "支付、KYC、风控、监控和分析服务可能使用各自的 Cookie 或类似技术。平台应在生产环境中列明主要第三方名称、目的和链接。",
      },
    ],
    notice: commonNotice,
  },
  "risk-disclosure": {
    title: "风险披露",
    eyebrow: "Risk Disclosure",
    summary: "清晰披露数字资产市场、杠杆、链上、监管、流动性、技术、安全和第三方服务风险。",
    highlights: ["本金损失风险", "市场波动", "链上不可逆", "监管与地区限制"],
    sections: [
      {
        heading: "市场风险",
        body: "数字资产价格可能剧烈波动，流动性可能快速下降，用户可能遭受全部本金损失。历史价格、储备证明或平台声誉不构成收益保证。",
      },
      {
        heading: "链上风险",
        body: "区块链交易通常不可逆。错误地址、错误网络、私钥泄露、合约漏洞、网络分叉或拥堵都可能导致资产损失。",
      },
      {
        heading: "服务与监管风险",
        body: "平台可能因维护、风控、法律、制裁、监管或第三方服务中断而暂停交易、充值、提现或账户访问。",
      },
    ],
    notice: commonNotice,
  },
  status: {
    title: "服务状态",
    eyebrow: "System Status",
    summary: "展示交易所核心组件状态：行情网关、风控引擎、资产账本、钱包连接、合规监控和 API 服务。",
    highlights: ["Market Data Gateway", "Risk Engine", "Portfolio Ledger", "Compliance Monitor"],
    sections: [
      {
        heading: "当前状态",
        body: "MVP 已提供 /api/platform/status 接口。生产环境应接入真实监控、历史可用率、维护公告、事故复盘和订阅通知。",
        items: ["核心交易接口可用率", "充值提现处理状态", "行情源状态", "数据库、缓存和队列状态"],
      },
      {
        heading: "事故沟通",
        body: "重大事故应包含影响范围、开始时间、缓解措施、恢复时间、客户影响、补偿安排和后续改进计划。",
      },
    ],
    notice: commonNotice,
  },
  security: {
    title: "安全中心",
    eyebrow: "Security Center",
    summary: "集中展示账户安全、钱包安全、平台安全、漏洞披露、提现审批、地址白名单和异常活动处理机制。",
    highlights: ["MFA", "地址白名单", "冷/热钱包隔离", "漏洞披露"],
    sections: [
      {
        heading: "账户安全",
        body: "生产环境应启用 MFA、设备管理、登录提醒、提现冷却期、API 权限隔离、IP 白名单和异常登录拦截。",
      },
      {
        heading: "资产安全",
        body: "托管模式下应采用冷热钱包隔离、多签、审批工作流、地址筛查、额度控制和定期储备核验。非托管模式下应清晰说明用户自管私钥责任。",
      },
      {
        heading: "漏洞披露",
        body: "建议建立安全邮箱、漏洞分级、响应 SLA、奖励范围和禁止行为边界，并对严重漏洞进行公开修复说明。",
      },
    ],
    notice: commonNotice,
  },
  contact: {
    title: "联系我们",
    eyebrow: "Contact",
    summary: "为上币、机构开户、法币通道、媒体、合规和安全事件提供正式联系入口。",
    highlights: ["机构开户", "上币申请", "合规与执法请求", "安全漏洞报告"],
    sections: [
      {
        heading: "业务联系",
        body: "请按事项类型提交材料，便于团队分流处理。生产环境建议接入工单系统并自动生成追踪编号。",
        items: ["机构服务：institutional@safe.exchange", "上币申请：listing@safe.exchange", "法币合作：fiat@safe.exchange", "安全漏洞：security@safe.exchange"],
      },
      {
        heading: "合规请求",
        body: "监管、执法和法律请求应通过专门通道提交，并包含正式文件、机构身份、请求范围、法律依据和联系人信息。",
      },
    ],
    notice: commonNotice,
  },
};

export function getPageBySlug(slugParts = []) {
  const slug = slugParts.length === 0 ? "policy" : slugParts.join("/");
  return sitePages[slug] ?? null;
}

export function getAllStaticSlugs() {
  return Object.keys(sitePages).map((slug) => ({ slug: slug.split("/") }));
}
