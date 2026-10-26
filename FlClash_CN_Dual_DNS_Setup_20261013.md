# Windows 11 FlClash — 国内直连 + 双路径 DNS 一次性覆写

更新：2026-10-26（同步 Shadowrocket 国内直连规则；仍沿用原 JS URL）

## 结论

iOS Shadowrocket 的 .sgmodule **不能直接导入** FlClash；Mihomo 使用独立的 YAML/JS 配置。为避免让用户重新录入 Oregon/AWS 节点，采用 **一份 FlClash 覆写脚本** + 自动引用的 4 个规则集。不会上传/包含现有节点凭证。FlClash URL 导入脚本后，还需手动关联现有订阅并关闭 App 自身的 DNS 覆写。

## 可复制的唯一导入 URL

https://raw.githubusercontent.com/kelvin-v/Claude/main/FlClash_CN_SplitDNS_Override_20261013.js

此文件是 **覆写脚本，不是 Clash 配置文件，不能用「配置→+→URL 新增订阅」方式导入**。

脚本引用的国内规则自动下载（无需额外导入）：

- 4,007 个国内定制域名（原 520 + blackmatrix7 China_Domain 补全，并排除部分明确海外代理域名）：https://raw.githubusercontent.com/kelvin-v/Claude/main/FlClash_CN_Custom_Domains_20261013.yaml
- 广覆盖国内域名库（MetaCubeX MRS）：https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs
- 中国大陆 IP CIDR 规则库（MetaCubeX MRS）：https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.mrs
- 从现有 Shadowrocket Claude 专项模块转换的 101 条 Mihomo 经典规则：https://raw.githubusercontent.com/kelvin-v/Claude/main/FlClash_Claude_Existing_Rules_20261013.yaml

## Windows 11 导入步骤

1. FlClash 中先**备份配置**，确认当前订阅和节点运行正常。暂不删除/替换现有节点订阅。
2. 打开「工具 → 进阶配置 → 脚本」（版本不同，入口可能显示为「脚本覆写」或「覆写脚本」）。
3. 如已有旧版同名脚本，先检查本地脚本是否已获得 2026-10-26 版本；若仍为旧版，使用上面原 `.js` URL 重新导入或更新，确保覆盖脚本本地快照。首次安装则新建脚本，从 URL 导入。不要把 JS 当订阅 YAML 添加。
4. 返回「配置」，在**当前正在使用的订阅**右侧菜单「更多/⋮ → 覆写」，切换为**脚本模式**并选中这个脚本。
5. 「工具 → 进阶配置 → DNS」如开启「DNS 覆写/覆盖 DNS」，请将此覆写关闭，防止 FlClash 自身 DNS 序列化盖掉脚本 DNS。注意不要关闭 Mihomo 脚本生成的 `dns.enable`。
6. 重新选择该订阅或刷新使覆写生效，打开 FlClash 的「预览/配置预览」与日志，确保 `rule-providers` 已加载 `KELVIN_CN_CUSTOM`、`KELVIN_CN_FULL`、`KELVIN_CN_IP`、`KELVIN_CLAUDE`；在资源页**更新 KELVIN_CN_CUSTOM**，确认能下载最新域名库；`rules` 最末为 `MATCH,<实际代理组>`，并包含 `GEOIP,CN,DIRECT`（不带 `no-resolve`）。DNS 的直连解析器为 AliDNS/DNSPod，普通解析器为 Google/Cloudflare DoH 且带 `#<代理组>`。
7. 若需要整个 Windows 系统（包括部分非 HTTP 软件）由 FlClash 接管，确认 TUN 模式已启用且工作正常；仅使用“系统代理”无法保证所有系统流量受控。
8. 分别测试 `douyin.com`、`toutiao.com`、`taobao.com` 的连接为 DIRECT，以及 `claude.ai`、`chatgpt.com`、`tiktok.com` 和未知国外域名为代理；另查看直连中国公网 IP 的记录是否命中 `KELVIN_CN_IP`，例如 `223.5.5.5`。查看 DNS 运行日志核对解析流向。若预览报错或无法联网，**先取消该订阅的覆写脚本并恢复原 DNS 覆写设置**，节点保持不变。

## 覆写效果与限制

- 继承原配置的节点、代理组、TUN 开关、入站端口；若没有显式 PROXY 组，尝试挑选可用的非直连策略组。仅原始节点而无策略组时自动创建 `KELVIN-Proxy` 选择组；完全没有代理节点时不改写。
- 前置保留源规则中的 REJECT 广告拦截（不保证与所有复杂规则完全一致）。
- 海外 AI / Google / GitHub / TikTok / CapCut 等关键域名优先走选定代理；同步保护 `microsoftonline.com`、`windows.net` 和 `tiktokd.net/org` 的海外代理例外；以 `KELVIN_CLAUDE` 经典规则集保留原 Claude v3 规则（包括第三方共享服务）。
- 同步小火箭极速版的 26 条番茄小说/穿山甲广告主机 `REJECT` 规则，排在国内 DIRECT 之前；并继续优先保留原订阅中的已有 REJECT 规则。广告域名被其他 App 共享时可能影响其功能。
- 国内 `.cn`、4,007 个定制域名和 MetaCubeX 中国域名集合优先 DIRECT；`RULE-SET,KELVIN_CN_IP,DIRECT,no-resolve` 保持原样以避免该规则触发额外 DNS；最后的 `GEOIP,CN,DIRECT` **去掉** `no-resolve`，允许漏网域名在 GeoIP 检查时解析目的 IP（可能增加 DNS 查询）；未匹配流量继续经 `MATCH,<代理组>` 代理。
- `direct-nameserver` / CN `nameserver-policy`：AliDNS/DNSPod DoH，带 `#DIRECT`。
- `nameserver`：Google/Cloudflare DoH，绑定选定代理组；`proxy-server-nameserver` 独立国内 DoH 做节点自举，`fallback` 清空防止并发混合国外/国内回退。
- IP 库包含中国大陆 IP 范围数据；如跨境 CDN/IP 定位过期或解析为不同地区，真实分流以最终命中规则为准。国内 IP 直连意味着目标网站能够看见本地公网地址，而不是美国代理地址。
- 脚本设置 `dns.ipv6=false`，但这**不等于 Windows 全局 IPv6 防泄漏**。Windows TUN、系统路由、个别应用自带 DoH 需单独检查。
- 国外代理服务器在远端解析目的域名时，所使用的 DNS 不一定是 Google/Cloudflare；本脚本不能强制控制服务器上的 DNS。
- 脚本引入的第三方 MetaCubeX 中国规则按 24h 更新。此次自定义国内域名库还合并 blackmatrix7 `China_Domain.list`（读取时的 blob SHA `2353a7ab`），为一次性同步快照，**不会自动跟随该上游清单后续变化**；GitHub 脚本变更后可能需要在 FlClash 中重新导入脚本。
- 不能保证与未知的 FlClash 版本、现有自定义脚本、复杂广告规则集完全兼容。由于 FANG 当前不在线，尚不能进行 Windows 实机验证。

## 遇到疑难

- 「预览代理组丢失」：取消脚本覆写，恢复原配置；老版本 FlClash 有过此类脚本覆写故障，建议升级稳定版本。
- 「DNS 设置不生效」：检查 FlClash DNS 覆写是否关闭以及当前订阅是否真正关联脚本。
- 「规则集下载失败」：检查当前网络是否能通过所选代理访问 raw.githubusercontent.com。
- 「国内变慢」：核对当前实际 DNS 日志、TUN 接管和旧版 geoip 匹配，勿同时修改节点/DoH/TUN。
- 「国际版 TikTok 直连」：检查脚本覆写的例外规则是否在 CN_FULL 前。

上游资料：https://wiki.metacubex.one/en/config/dns/ 和 https://github.com/chen08209/FlClash/issues/1510 。
