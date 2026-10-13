// FlClash / Mihomo script override (2026-10-13).
// Apply to an EXISTING subscription using Script Override; not a standalone YAML profile.
// Retains existing proxy nodes, groups, and TUN state. Requires FlClash DNS Override disabled.
const main = (config) => {
  if (!config || typeof config !== "object") return config;
  const groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"] : [];
  const proxies = Array.isArray(config.proxies) ? config.proxies : [];
  const providerNames = Object.keys(config["proxy-providers"] || {});
  const groupNames = groups.map(g => g && g.name).filter(Boolean);
  const preferred = ["PROXY", "Proxy", "代理", "代理选择", "节点选择", "🚀 节点选择", "🚀 代理选择", "🚀 手动切换", "🚀 节点切换", "GLOBAL", "GLOBAL-SELECT", "🌐 全球加速", "国外流量", "国外代理"];
  let target = preferred.find(s => groupNames.includes(s));
  if (!target) {
    const ranked = groups.find(g => g && ["select", "url-test", "fallback", "load-balance"].includes(g.type) &&
      ((g.proxies && g.proxies.length) || (g.use && g.use.length)) &&
      !/直连|国内|广告|拦截|reject|direct|block/i.test(g.name));
    target = ranked && ranked.name;
  }
  if (!target && groups.length) {
    const first = groups.find(g => g && g.name && !/直连|国内|广告|拦截|reject|direct|block/i.test(g.name));
    target = first && first.name;
  }
  if (!target && (proxies.length || providerNames.length)) {
    target = "KELVIN-Proxy";
    config["proxy-groups"] = groups.concat([{
      name: target, type: "select", proxies: proxies.map(p => p.name).filter(Boolean),
      ...(providerNames.length ? { use: providerNames } : {})
    }]);
  }
  // Never replace an existing working configuration with an unusable proxy policy.
  if (!target) return config;

  const cnDNS = ["https://dns.alidns.com/dns-query#DIRECT", "https://doh.pub/dns-query#DIRECT"];
  const proxyDNS = ["https://dns.google/dns-query#" + target, "https://cloudflare-dns.com/dns-query#" + target];
  const oldDNS = config.dns && typeof config.dns === "object" ? config.dns : {};
  config.dns = {
    ...oldDNS,
    enable: true,
    ipv6: false,
    "enhanced-mode": oldDNS["enhanced-mode"] || "fake-ip",
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    "proxy-server-nameserver": ["https://dns.alidns.com/dns-query#DIRECT", "https://doh.pub/dns-query#DIRECT"],
    "direct-nameserver": cnDNS,
    "direct-nameserver-follow-policy": true,
    nameserver: proxyDNS,
    fallback: [],
    "respect-rules": true,
    "nameserver-policy": {
      ...oldDNS["nameserver-policy"],
      "rule-set:KELVIN_CN_CUSTOM,KELVIN_CN_FULL": cnDNS,
      "+.cn": cnDNS,
      "+.lan": ["system"],
      "+.local": ["system"],
      "dns.google": proxyDNS,
      "cloudflare-dns.com": proxyDNS
    }
  };

  const oldProviders = config["rule-providers"] && typeof config["rule-providers"] === "object" ? config["rule-providers"] : {};
  config["rule-providers"] = {
    ...oldProviders,
    KELVIN_CN_CUSTOM: {
      type: "http", behavior: "domain", format: "yaml", interval: 86400, proxy: target,
      url: "https://raw.githubusercontent.com/kelvin-v/Claude/main/FlClash_CN_Custom_Domains_20261013.yaml",
      path: "./ruleset/kelvin-cn-custom-20261013.yaml"
    },
    KELVIN_CN_FULL: {
      type: "http", behavior: "domain", format: "mrs", interval: 86400, proxy: target,
      url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs",
      path: "./ruleset/kelvin-cn-full.mrs"
    }
  };

  const oldRules = Array.isArray(config.rules) ? config.rules.filter(x => typeof x === "string") : [];
  const keep = oldRules.filter(r => !/^(MATCH|FINAL),/.test(r));
  // Keep user ad/tracker blocking ahead of new direct routing.
  const rejected = keep.filter(r => /,(REJECT|REJECT-DROP)(,|$)/.test(r));
  const remain = keep.filter(r => !rejected.includes(r));
  const overseas = [
    "claude.ai", "anthropic.com", "claude.com", "openai.com", "chatgpt.com", "oaistatic.com",
    "google.com", "googleapis.com", "gstatic.com", "github.com", "githubusercontent.com",
    "dns.google", "cloudflare-dns.com", "tiktok.com", "tiktokv.com", "tiktokcdn.com",
    "tiktokcdn-us.com", "tiktokrow.com", "capcut.com", "capcut.net", "lemon8-app.com",
    "byteplus.com", "bytedance.com", "bytedance.net", "bytedance.org"
  ].map(d => "DOMAIN-SUFFIX," + d + "," + target);
  const rules = [
    ...rejected, ...overseas, "DOMAIN-SUFFIX,cn,DIRECT",
    "RULE-SET,KELVIN_CN_CUSTOM,DIRECT",
    "RULE-SET,KELVIN_CN_FULL,DIRECT",
    ...remain, "GEOIP,CN,DIRECT,no-resolve", "MATCH," + target
  ];
  config.rules = [...new Set(rules)];
  // No changes to TUN, incoming port, original groups or node secrets.
  return config;
};
