# Shadowrocket 国内直连 + 双 DNS 使用说明

版本：2026-10-13（同日更新：中国大陆 IPv4 段直连）。目的：国内常用域名及中国大陆 IP 段直连，海外及未匹配请求代理，DNS 按既有路由决策分为 DIRECT / PROXY 两条通道。

## 订阅地址

- 国内直连模块：https://raw.githubusercontent.com/kelvin-v/Claude/main/Shadowrocket_CN_Direct_Comprehensive_20261013.sgmodule
- 已有双通道 DNS：https://raw.githubusercontent.com/kelvin-v/Claude/main/Claude_DNS_Overlay.sgmodule
- Claude 专项模块：https://raw.githubusercontent.com/kelvin-v/Claude/main/Claude_All_Services_Shadowrocket_v3.sgmodule
- IPv6 防泄漏（按需启用）：https://raw.githubusercontent.com/kelvin-v/Claude/main/Claude_IPv6_Leak_Guard.sgmodule

## 安装和防冲突

1. 在 Shadowrocket 中备份现有配置。
2. 配置 → 模块 → 添加/通过 URL 导入国内直连模块；启用。若已导入旧版 **中国常用服务直连 + 默认代理**，将旧版停用，避免重复及 FINAL 覆盖。
3. 保留原先 `Claude_DNS_Overlay.sgmodule`，**不要再启用前一次提供的另一个双通道 DNS 模块**。同一 DNS 项由多个模块改写时顺序可能造成冲突。
4. 原 `Claude_All_Services_Shadowrocket_v3.sgmodule` 和 `Claude_IPv6_Leak_Guard.sgmodule` 不需要更改；如果多个模块有冲突，应保证 Claude/AI 等特殊代理域名规则在国内大范围直连规则之前生效。
5. 首页全局路由设为「配置」；选择有效的 `PROXY` 节点，刷新模块和配置，检查规则命中与日志。

## DNS 设计与限制

- `DIRECT` 匹配的域名：`direct-dns-server` 国内 AliDNS / DNSPod DoH，通常由本地网络直接请求。
- 中国大陆 IP 段：增加 `ChinaIPs.list`（约 19,228 条 IPv4 CIDR，来源截至 2026-10-12）作为 `RULE-SET`，及 `GEOIP,CN,DIRECT,no-resolve` 补充判断。规则使用 `no-resolve`，只对已经得到目标 IP 的连接匹配，不为不认识的域名额外做 DNS 查询；故**未列入国内域名库的国内域名仍可能走代理**。
- 代理和未分类查询：`dns-server` Google / Cloudflare DoH（`#proxy`），以及国外 DoH 兜底。
- 代理节点域名自举：原 DNS 模块为 `proxy-dns-server` 单独指定 DNS-over-TLS。
- 注意：`FINAL,PROXY` 决定连接策略，**不是保证 DNS 全部在服务器端由 Google / Cloudflare 完成**。代理域名经常由远程代理端解析，实际解析器取决于服务器。若国内 DNS 失败，仍可能发生设置中的 fallback 行为。
- 该模块**不修改** Fake IP、IPv6、Tailscale、MITM、脚本、节点信息、DNS 参数或原 Claude 专项模块。
- 国内 `.cn` 域名默认直连，属于覆盖率优先策略；个别 `.cn` 站点如果希望强制代理，需要添加更高优先级 `PROXY` 规则。
- 国际版 TikTok、CapCut、Lemon8、BytePlus 及字节共享基础域名优先考虑代理，不保证可以按 App 绝对分离同一共享主机名。
- 在同一个文件中保留 `FINAL,PROXY`，若现有主配置已有 `FINAL`，请检查编译后的最终规则位置。
- 规则中 42 组分类域名 `RULE-SET` 加 1 组中国 IP 网段 `RULE-SET` 指向 blackmatrix7/ios_rule_script 的公开列表，由第三方维护；首次下载或更新规则集可能需要能够访问 GitHub Raw。
- **请注意**：启用 `Claude_IPv6_Leak_Guard` 的情况下 `IP-CIDR6,::/0,REJECT` 会拒绝 IPv6；本次 ChinaIPs 列表是 IPv4 规则，不会覆盖 IPv6 防泄漏策略。
- 广告净化模块包含微信/QQ 相关的拦截与 MITM，曾出现调整顺序后微信无法连接的情况；本次更新不调整任何模块排序或广告规则。若仍有故障，先测试关闭广告模块并检查日志。

## 建议检查

| 域名 | 预期 |
| --- | --- |
| toutiao.com / douyin.com / ixigua.com / fanqienovel.com | DIRECT |
| weixin.com / taobao.com / jd.com / meituan.com | DIRECT |
| tiktok.com / capcut.com / claude.ai / google.com | PROXY |
| 国内公网 IP（例如 223.5.5.5） | DIRECT（以真实命中为准） |
| 未匹配域名或 IP | PROXY |

先在小火箭「配置 → 测试规则」中检查，再查看「数据 → DNS 日志」确认解析器；分别用 Wi-Fi 与蜂窝网络测试真实应用。若国内 App 变慢，先停用此国内模块进行 A/B 对比，**不要同时修改节点和 DNS**。

## 规则来源与生成说明

- 基础头条/字节跳动条目来自 https://github.com/blackmatrix7/ios_rule_script/blob/master/rule/Shadowrocket/ByteDance/ByteDance.list (2026-10-04)，仅保留 DOMAIN/DOMAIN-SUFFIX；排除原始 TikTok USER-AGENT/IP。
- 其余在线类别均使用 blackmatrix7 的 Shadowrocket 分类规则集；新增中国大陆 IP 段列表：https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/ChinaIPs/ChinaIPs.list 。主模块内可直接查阅每个源的 URL。
- 该文件在 GitHub 上通过 UTF-8 读取、规则结构与前后版本保留检查；**尚未在 iPhone 上导入测试**。请以 Shadowrocket 本机编译、日志为准。
