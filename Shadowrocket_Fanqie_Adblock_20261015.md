# 番茄小说去广告：Shadowrocket 与中国直连极速版整合（2026-10-15）

## 结论
优先使用已修改的“**中国国内服务直连·极速版**”，含原 534 条域名分流规则、内置 `GEOIP,CN`、显式 ChatGPT/Claude 代理规则及新增 **26 条**精选域名级广告拦截规则。没有引入新的远程规则集、脚本、MITM，避免重现大型模块导致的延迟问题。

- 核心版：https://raw.githubusercontent.com/kelvin-v/Claude/main/Shadowrocket_CN_Direct_Fast_20261013.sgmodule
- 可选高级版：https://raw.githubusercontent.com/kelvin-v/Claude/main/Shadowrocket_Fanqie_Advanced_Optional_20261015.sgmodule

## 三个参考项目
1. [afwfv/FanqieHook](https://github.com/afwfv/FanqieHook)：Android LSPosed Hook。依靠客户端类/方法拦截原生广告，**不能**当成 iPhone 小火箭规则使用。
2. [afwfv/DD-AD](https://github.com/afwfv/DD-AD)：DNS/Adblock 域名拦截规则。提取 Pangolin 穿山甲广告服务器、字节系广告 API 相关域名；注意该项目也把部分 snssdk/zijieapi 域名列入白名单，不能照搬全部黑名单。
3. [SherryBX/XiaoQi-sgmodule](https://github.com/SherryBX/XiaoQi-sgmodule)：Shadowrocket 聚合模块，包含约 4000 个域名、约 850 URL 规则与远程脚本。提取少量明确广告路径的思路，排除覆盖整站的域名关键字、大量 MITM hostname 与未经审核远程脚本。

## 核心版修改点
- 在所有原国内 DIRECT 规则之前，前置 26 条 Pangolin、pglstatp 及部分 `ads3/4/5-normal` 和 `ad.zijieapi.com` 广告服务器 REJECT 规则。
- 不封锁 `p*-novel.byteimg.com`、`p*-novel-sign.byteimg.com`、`fqnovelvod.com`、`fanqienovel.com` 等小说图片、正文和音视频站点。
- 不拦截 `i.snssdk.com`、`ib.snssdk.com`、`gecko.zijieapi.com`、`tnc3` 等高风险共享功能接口。
- 无 MITM，无新的 `RULE-SET`。本地 GitHub 文件静态核查不等于 iOS 真机效果验证。
- **注意**：域名级 REJECT 无法只限定番茄小说 App，使用同一广告 SDK 的其他字节系应用广告也可能受到影响；部分主动激励广告/看广告得金币入口可能失效，但不意味着可绕过服务端发奖。

## 可选高级模块
新增 5 条 **仅面向广告路径** 的 URL Rewrite，使用小范围 MITM hostname（`*.pstatp.com`、`i.snssdk.com`、`i-hl.snssdk.com`、`i-lq.snssdk.com`、`gurd.snssdk.com`）。
- 仅当 CA 安装并信任、App 未使用证书锁定时 HTTPS 路径拦截才可能生效。
- 高级模块会扩大 HTTPS 解密范围；如出现封面缺失、听书卡顿、登录失败、证书错误等，立即关闭高级模块。
- 这种网络级方法无法像 Android LSPosed 一样直接隐藏客户端 UI 的原生广告位；**不承诺全广告消失**。
- 不引入任何远程脚本，也不修改 DNS 或代理节点。

## 安装与验证
1. 小火箭 → 配置 → 模块：**停用原“全面版”，只保留更新后的“极速版”启用**，刷新订阅模块。
2. 暂时**不要启用“高级净化”**。保持现有 ChatGPT/Claude、DNS、IPv6 模块与节点不变，先测试 3–5 分钟。
3. 测试番茄小说：开屏、首页信息流、阅读页底部、章节中间广告、听书/激励广告、封面和正文图片、登录及书架同步。确认正常后再决定是否尝试高级模块。
4. 对照 ChatGPT：访问/发消息速度不应再次明显下降；若有下降，关闭极速版并报告命中日志。
5. 如果想继续降低广告，单独添加并启用“高级净化”；在 Shadowrocket HTTPS 解密处启用并信任 CA 证书，**只在理解 MITM 风险后操作**。
6. 规则冲突：现有“广告拦截&净化合集”也可能拦截上述域名。排查时一次只启用一个额外广告模块，不建议把第三方 XiaoQi 45 万字节的全部规则导入本配置。
7. 遇到异常：先关“高级净化”；若仍异常，再关“极速版”。不要同时更改 DNS 和节点；保留原模块订阅作为回滚。

## 开发核查
已核实规则置于国内 DIRECT 前、海外 AI 代理规则保留、无新增远程脚本、保留 `GEOIP,CN,DIRECT,no-resolve` 与 `FINAL,PROXY`。高级版无远程脚本。尚未在 Shadowrocket iOS 实机真机测试。
