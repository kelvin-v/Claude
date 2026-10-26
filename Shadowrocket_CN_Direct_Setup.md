# Shadowrocket 国内直连 + 双 DNS 使用说明

版本：2026-10-26（补充国内域名与 GeoIP 漏网兜底；订阅文件路径保持不变）。目的：国内常用域名及中国大陆 IP 段直连，海外及未匹配请求代理，DNS 按既有路由决策分为 DIRECT / PROXY 两条通道。

## 订阅地址

- 国内直连·极速版（推荐，保留番茄广告 REJECT）：https://raw.githubusercontent.com/kelvin-v/Claude/main/Shadowrocket_CN_Direct_Fast_20261013.sgmodule
- 国内直连·全面版（可选，含更多远程分类规则）：https://raw.githubusercontent.com/kelvin-v/Claude/main/Shadowrocket_CN_Direct_Comprehensive_20261013.sgmodule
- 已有双通道 DNS：https://raw.githubusercontent.com/kelvin-v/Claude/main/Claude_DNS_Overlay.sgmodule
- Claude 专项模块：https://raw.githubusercontent.com/kelvin-v/Claude/main/Claude_All_Services_Shadowrocket_v3.sgmodule
- IPv6 防泄漏（按需启用）：https://raw.githubusercontent.com/kelvin-v/Claude/main/Claude_IPv6_Leak_Guard.sgmodule

## 安装和防冲突

1. 在 Shadowrocket 中备份现有配置。
2. 配置 → 模块 → 对已安装的「中国国内服务直连·极速版」或「全面版」执行更新；**只启用一个版本**，建议极速版。若使用旧版「中国常用服务直连 + 默认代理」，请停用旧版，避免重复及 FINAL 覆盖。
3. 保留原先 `Claude_DNS_Overlay.sgmodule`，**不要再启用前一次提供的另一个双通道 DNS 模块**。同一 DNS 项由多个模块改写时顺序可能造成冲突。
4. 原 `Claude_All_Services_Shadowrocket_v3.sgmodule` 和 `Claude_IPv6_Leak_Guard.sgmodule` 不需要更改；如果多个模块有冲突，应保证 Claude/AI 等特殊代理域名规则在国内大范围直连规则之前生效。
5. 首页全局路由设为「配置」；选择有效的 `PROXY` 节点，刷新模块和配置，检查规则命中与日志。

## DNS 设计与限制

- `DIRECT` 匹配的域名：`direct-dns-server` 国内 AliDNS / DNSPod DoH，通常由本地网络直接请求。
- 两个国内模块新增 `China_Domain.list` 纯域名 `DOMAIN-SET`，补齐原静态规则未覆盖的国内网站。没有直接引入 `China.list` 中宽泛的 USER-AGENT、`.ms` 及 `microsoft` 关键词，避免误伤国际流量。
- 两个国内模块的兜底改为 `GEOIP,CN,DIRECT`（不带 `no-resolve`）：对未命中域名规则的主机可额外解析目标 IP，再判断是否属于中国大陆。可能增加 DNS 查询；仅实际解析到中国大陆 IP 时直连，否则依然由 `FINAL,PROXY` 代理。该机制不保证所有国内网站都被识别。
- 全面版仍保留原 `ChinaIPs.list`（IPv4 CIDR）及 42 组远程分类；极速版不加载这些大型分类列表，仅增加一份 `China_Domain` 域名文件。
- 代理和未分类查询：`dns-server` Google / Cloudflare DoH（`#proxy`），以及国外 DoH 兜底。
- 代理节点域名自举：原 DNS 模块为 `proxy-dns-server` 单独指定 DNS-over-TLS。
- 注意：`FINAL,PROXY` 决定连接策略，**不是保证 DNS 全部在服务器端由 Google / Cloudflare 完成**。代理域名经常由远程代理端解析，实际解析器取决于服务器。若国内 DNS 失败，仍可能发生设置中的 fallback 行为。
- 该模块**不修改** Fake IP、IPv6、Tailscale、MITM、脚本、节点信息、DNS 参数或原 Claude 专项模块。
- 国内 `.cn` 域名默认直连，属于覆盖率优先策略；个别 `.cn` 站点如果希望强制代理，需要添加更高优先级 `PROXY` 规则。
- 国际版 TikTok、CapCut、Lemon8、BytePlus 及字节共享基础域名优先考虑代理，不保证可以按 App 绝对分离同一共享主机名。
- 在同一个文件中保留 `FINAL,PROXY`，若现有主配置已有 `FINAL`，请检查编译后的最终规则位置。
- 全面版保留原 42 组分类 `RULE-SET` 与 1 组 ChinaIPs；极速版新增 1 份 `DOMAIN-SET`。这些规则集由 blackmatrix7/ios_rule_script 维护；首次加载、更新可能需要 GitHub Raw 可达。
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
- 国内综合纯域名库：https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/China/China_Domain.list 。全面版还保留原分类库和 ChinaIPs 地址：https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/ChinaIPs/ChinaIPs.list 。
- 本次通过 GitHub 读取与规则内容检查；**尚未在 iPhone 上导入或验证真实分流**。更新后在「配置 → 测试规则」和连接日志中核验；如果仍有误走代理，请提供实际域名及命中规则。
