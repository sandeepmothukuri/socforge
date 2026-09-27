"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
import { IocHoverCard } from "@/components/ui/IocHoverCard";
import {
  Globe,
  ShieldAlert,
  Flame,
  Download,
  Copy,
  Check,
  Search,
  ExternalLink,
  Crosshair,
  Layers,
  Terminal,
  FileCode,
  Sparkles,
  Server,
  User,
  Shield,
  Activity,
  AlertTriangle,
  Radio,
  Clock,
  Send,
  Zap,
  Network,
  Share2,
  Filter,
  CheckCircle2,
  ChevronRight,
  Target,
  Cpu,
  Database,
  Lock,
  Eye,
  FileCheck
} from "lucide-react";

interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  targetSectors: string[];
  threatLevel: "CRITICAL" | "HIGH" | "MEDIUM";
  activeSince: string;
  motivation: "Espionage" | "Sabotage" | "Financial / eCrime" | "Disruption";
  description: string;
  campaigns: { year: string; name: string; impact: string; cves?: string[] }[];
  ttpList: { technique: string; tactic: string; name: string; detectionRule: string }[];
  diamondModel: {
    adversary: { title: string; desc: string; attribution: string; confidence: string };
    capability: { title: string; desc: string; weapons: string[]; exploits: string[] };
    infrastructure: { title: string; desc: string; nodes: string[]; protocols: string[] };
    victim: { title: string; desc: string; sectors: string[]; regions: string[] };
  };
  iocs: { type: string; value: string; confidence: number; firstSeen: string }[];
}

const THREAT_ACTORS: ThreatActor[] = [
  {
    id: "apt29",
    name: "APT29 (Cozy Bear / Midnight Blizzard)",
    aliases: ["Nobelium", "Midnight Blizzard", "The Dukes", "UNC2452"],
    origin: "Russian Federation (SVR)",
    motivation: "Espionage",
    targetSectors: ["Government", "Defense", "Think Tanks", "Cloud Providers"],
    threatLevel: "CRITICAL",
    activeSince: "2008",
    description: "Highly sophisticated nation-state threat group focusing on strategic foreign intelligence espionage, supply chain backdoors, and cloud identity token replay attacks (OAuth consent abuse, token extraction).",
    campaigns: [
      { year: "2020", name: "Solorigate Supply Chain Backdoor", impact: "Compromise of SolarWinds Orion software build pipeline impacting 18,000+ organizations.", cves: ["CVE-2020-10148"] },
      { year: "2023", name: "Microsoft Executive Mailbox Token Theft", impact: "Password spray attack on legacy non-production tenant compromising executive emails.", cves: ["OAuth Token Replay"] },
      { year: "2026", name: "Edge Device Ivanti & Cloud Token Ingress", impact: "Exploitation of zero-day VPN gateways to pivot into hybrid Entra ID environments.", cves: ["CVE-2024-21887", "CVE-2026-3192"] }
    ],
    ttpList: [
      { technique: "T1195.002", tactic: "Initial Access", name: "Compromise Software Supply Chain", detectionRule: "sigma/apt29_orion_backdoor.yml" },
      { technique: "T1003.001", tactic: "Credential Access", name: "LSASS Memory Dump", detectionRule: "sigma/proc_access_lsass_suspicious.yml" },
      { technique: "T1098.005", tactic: "Persistence", name: "Device Registration Modification", detectionRule: "sigma/azure_ad_device_trust_tampering.yml" },
      { technique: "T1566.002", tactic: "Initial Access", name: "Spearphishing Link", detectionRule: "sigma/email_suspicious_oauth_consent.yml" },
      { technique: "T1071.001", tactic: "Command and Control", name: "Web Protocols (Fast-Flux C2)", detectionRule: "sigma/net_c2_fastflux_beacon.yml" }
    ],
    diamondModel: {
      adversary: {
        title: "Russian Foreign Intelligence Service (SVR)",
        desc: "Specialized in long-dwell stealth operations, deep reconnaissance, and credential harvesting.",
        attribution: "Unit 26165 & SVR Active Operations",
        confidence: "99% High Confidence (CISA / NSA / GCHQ)"
      },
      capability: {
        title: "Custom Multi-Stage Malware & Cloud Tooling",
        desc: "Bespoke stealth implants, memory-resident injectors, and Graph API exfiltration harnesses.",
        weapons: ["WellMess", "GoldFinder", "MagicWeb", "EnvyScout"],
        exploits: ["CVE-2023-42793", "CVE-2024-21887", "OAuth Consent Abuse"]
      },
      infrastructure: {
        title: "Residential Proxies & Legitimate Cloud Nodes",
        desc: "Bulletproof VPS nodes, compromised residential IoT routing proxies, and hijacked Microsoft 365 tenants.",
        nodes: ["185.220.101.5", "45.154.255.89", "cloud-sync-telemetry.org"],
        protocols: ["HTTPS/TLS 1.3", "WebSocket Encrypted", "DNS Tunneling"]
      },
      victim: {
        title: "Target Geopolitical & Tech Entities",
        desc: "Western government ministries, military alliances, foreign affairs departments, and cloud software supply chains.",
        sectors: ["Government & Diplomatic", "Defense Industrial Base", "Hyperscale Cloud Vendors"],
        regions: ["North America", "NATO Members", "Western Europe"]
      }
    },
    iocs: [
      { type: "IP", value: "185.220.101.5", confidence: 98, firstSeen: "2026-09-18" },
      { type: "Domain", value: "cloud-sync-telemetry.org", confidence: 95, firstSeen: "2026-09-20" },
      { type: "SHA256", value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", confidence: 90, firstSeen: "2026-09-22" },
      { type: "Certificate", value: "SolarWinds.Orion.Core.BusinessLayer.dll", confidence: 99, firstSeen: "2026-08-14" }
    ]
  },
  {
    id: "volt-typhoon",
    name: "Volt Typhoon (Bronze Silhouette)",
    aliases: ["Vanguard Panda", "Insidious Taurus", "UNC3236"],
    origin: "China (PLA / MSS)",
    motivation: "Sabotage",
    targetSectors: ["Critical Infrastructure", "Energy", "Telecommunications", "Maritime", "Water"],
    threatLevel: "CRITICAL",
    activeSince: "2021",
    description: "Living-off-the-land (LOTL) specialist focusing on persistent pre-positioning within critical infrastructure networks using compromised SOHO edge routers and native administrative binaries.",
    campaigns: [
      { year: "2023", name: "Guam Telecommunications & Port Probe", impact: "Stealth intrusion into strategic Pacific maritime and telecommunications communications hubs.", cves: ["FortiOS Zero-Day"] },
      { year: "2024", name: "KV-Botnet SOHO Compromise Wave", impact: "Botnet of end-of-life Cisco & Netgear routers used as covert obfuscation mesh.", cves: ["Cisco IOS Exploitation"] },
      { year: "2026", name: "US Power Grid SCADA & OT Pre-Positioning", impact: "Living-off-the-land reconnaissance on electrical substation relay control systems.", cves: ["CVE-2024-21893"] }
    ],
    ttpList: [
      { technique: "T1059.001", tactic: "Execution", name: "PowerShell & WMI LOTL", detectionRule: "sigma/wmi_suspicious_lotl_execution.yml" },
      { technique: "T1047", tactic: "Execution", name: "Windows Management Instrumentation", detectionRule: "sigma/wmic_process_discovery.yml" },
      { technique: "T1136.001", tactic: "Persistence", name: "Local Administrator Creation", detectionRule: "sigma/net_user_admin_created.yml" },
      { technique: "T1078.002", tactic: "Defense Evasion", name: "Domain Accounts Abuse", detectionRule: "sigma/ad_privileged_account_anomalous_login.yml" }
    ],
    diamondModel: {
      adversary: {
        title: "People's Liberation Army / MSS Cyber Warfare Group",
        desc: "Focuses on strategic pre-positioning to enable disruptive sabotage during geopolitical crises.",
        attribution: "Joint MSS / PLA Strategic Support Force Unit",
        confidence: "98% High Confidence (CISA / FBI / Five Eyes)"
      },
      capability: {
        title: "Living-Off-The-Land (LOTL) & Fast Reverse Proxy",
        desc: "Zero-malware footprint; utilizes built-in Windows administrative utilities (cmd, wmic, ntdsutil, certutil).",
        weapons: ["Fast Reverse Proxy (FRP)", "Earthworm", "ntdsutil active dumping"],
        exploits: ["CVE-2023-3519", "CVE-2024-21893 (Ivanti SSRF)"]
      },
      infrastructure: {
        title: "KV-Botnet Compromised SOHO Edge Routers",
        desc: "Infected Cisco, Fortinet, and Netgear routers operating as a multi-tier proxy network directly originating within target geography.",
        nodes: ["45.154.255.89", "194.26.29.112", "router-firmware-update.net"],
        protocols: ["SOCKS5 Over SSH", "FRP Reverse Tunnel", "Raw TLS Port 443"]
      },
      victim: {
        title: "Western Critical Infrastructure Operators",
        desc: "Municipal water authorities, electrical transmission grids, communications carriers, and naval defense logistics.",
        sectors: ["Energy & Grid Operations", "Municipal Water Supply", "Telecommunications Carriers"],
        regions: ["United States", "Guam / Pacific", "Australia / UK"]
      }
    },
    iocs: [
      { type: "IP", value: "45.154.255.89", confidence: 94, firstSeen: "2026-09-15" },
      { type: "Domain", value: "router-firmware-update.net", confidence: 92, firstSeen: "2026-09-17" },
      { type: "UserAgent", value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) FRP/0.48", confidence: 88, firstSeen: "2026-09-19" }
    ]
  },
  {
    id: "lazarus",
    name: "Lazarus Group (HIDDEN COBRA / Diamond Sleet)",
    aliases: ["Zinc", "Diamond Sleet", "Labyrinth Chollima", "APT38"],
    origin: "North Korea (RGB)",
    motivation: "Financial / eCrime",
    targetSectors: ["Cryptocurrency", "Defense", "Financial Institutions", "Aerospace"],
    threatLevel: "CRITICAL",
    activeSince: "2009",
    description: "State-sponsored cyber offensive organization executing massive cryptocurrency heists, SWIFT financial fraud, and destructive wiper attacks to fund weapons programs.",
    campaigns: [
      { year: "2014", name: "Sony Pictures Destructive Wiper Attack", impact: "Destruction of thousands of corporate workstations and leak of unreleased media.", cves: ["Bespoke Wiper"] },
      { year: "2022", name: "Ronin Bridge $620M Crypto Heist", impact: "Compromise of private validator keys leading to the largest crypto theft in history.", cves: ["Social Engineering"] },
      { year: "2026", name: "Web3 Cross-Chain Protocol Exploitations", impact: "Social engineering of blockchain core developers via fake Job Offer Trojan PDFs.", cves: ["CVE-2024-21413"] }
    ],
    ttpList: [
      { technique: "T1566.001", tactic: "Initial Access", name: "Spearphishing Attachment (Trojan PDF)", detectionRule: "sigma/pdf_malicious_script_spawner.yml" },
      { technique: "T1055", tactic: "Defense Evasion", name: "Process Injection (Memory Unhooking)", detectionRule: "sigma/proc_injection_ntdll_unhook.yml" },
      { technique: "T1485", tactic: "Impact", name: "Data Destruction (Wiper)", detectionRule: "sigma/wiper_disk_mbr_overwrite.yml" }
    ],
    diamondModel: {
      adversary: {
        title: "Reconnaissance General Bureau (RGB) Unit 121",
        desc: "Dual mandate: Geopolitical strategic espionage and foreign currency generation via cyber theft.",
        attribution: "Democratic People's Republic of Korea (DPRK)",
        confidence: "99% High Confidence (US Treasury / CISA)"
      },
      capability: {
        title: "HermitWiper, Manuscrypt & AppleJeus Multi-Platform Malwares",
        desc: "Cross-platform capability attacking Windows, macOS, and Linux with custom encryption and DLL side-loading.",
        weapons: ["HermitWiper", "Manuscrypt", "AppleJeus", "BLINDINGCAN"],
        exploits: ["CVE-2022-47966", "CVE-2024-21413 (Outlook Moniker)"]
      },
      infrastructure: {
        title: "Global Multi-Hop C2 & Decentralized Mixing Pools",
        desc: "Compromised university web servers in Asia and Eastern Europe, multi-hop VPN relays, and crypto mixers (Tornado Cash).",
        nodes: ["103.208.220.12", "193.142.146.33", "secure-blockchain-node.org"],
        protocols: ["Custom Binary Protocol Over TLS", "HTTP POST Steganography", "gRPC Encrypted"]
      },
      victim: {
        title: "Cryptocurrency Exchanges & Financial FinTech",
        desc: "Crypto bridges, Web3 developers, central banks, defense contractors, and media corporations.",
        sectors: ["Blockchain & Cryptocurrency", "Commercial Banking", "Aerospace & Satellite"],
        regions: ["Global", "Japan / South Korea", "United States", "Singapore"]
      }
    },
    iocs: [
      { type: "IP", value: "103.208.220.12", confidence: 96, firstSeen: "2026-09-12" },
      { type: "Domain", value: "secure-blockchain-node.org", confidence: 93, firstSeen: "2026-09-16" },
      { type: "SHA256", value: "8f4a1239cba8791024bcde459012384758129038290384710293481230491024", confidence: 99, firstSeen: "2026-09-21" }
    ]
  },
  {
    id: "scattered-spider",
    name: "Scattered Spider (UNC3944 / Octo Tempest)",
    aliases: ["Starfraud", "Muddled Libra", "0ktapus"],
    origin: "Transnational eCrime",
    motivation: "Financial / eCrime",
    targetSectors: ["Hospitality", "Casinos", "Telecommunications", "FinTech", "SaaS Providers"],
    threatLevel: "CRITICAL",
    activeSince: "2022",
    description: "Highly aggressive social engineering collective targeting IT Help Desks with MFA fatigue, SIM swapping, and Okta administrator takeover leading to enterprise-wide ransomware deployment (BlackCat/RansomHub).",
    campaigns: [
      { year: "2023", name: "Las Vegas Casino Cyber Siege", impact: "Simultaneous ransomware paralyzation of major gaming and hotel resort properties.", cves: ["MFA Fatigue Bypass"] },
      { year: "2024", name: "Identity Provider Single-Sign-On Takeover", impact: "Compromise of customer support portals across global cloud software vendors.", cves: ["Okta Support Impersonation"] },
      { year: "2026", name: "Cloud Infrastructure Entra ID Extortion", impact: "Mass exfiltration of cloud databases followed by automated tenant encryption.", cves: ["Entra ID Backdoors"] }
    ],
    ttpList: [
      { technique: "T1566.004", tactic: "Initial Access", name: "Spearphishing Voice (Vishing Help Desk)", detectionRule: "sigma/okta_mfa_reset_suspicious.yml" },
      { technique: "T1621", tactic: "Credential Access", name: "Multi-Factor Authentication Request Generation", detectionRule: "sigma/mfa_fatigue_push_spam.yml" },
      { technique: "T1078.004", tactic: "Defense Evasion", name: "Cloud Administration Accounts Takeover", detectionRule: "sigma/cloud_global_admin_added.yml" }
    ],
    diamondModel: {
      adversary: {
        title: "The Com / Octo Tempest Cyber Collective",
        desc: "English-speaking native social engineering specialists adept at psychological manipulation and telecommunications routing.",
        attribution: "Decentralized youth cybercrime community (US/UK/EU)",
        confidence: "95% High Confidence (Mandiant / Microsoft / CrowdStrike)"
      },
      capability: {
        title: "Okta Impersonation & BYOVD Ransomware",
        desc: "Bring-Your-Own-Vulnerable-Driver (BYOVD) EDR killers, Azure/AWS admin scripts, and BlackCat/ALPHV encryptors.",
        weapons: ["POORTRY EDR Killer", "Stonestop", "Mimikatz Cloud Token Harvester"],
        exploits: ["SIM Swapping", "OAuth Application Backdoors", "CVE-2023-4966 (Citrix Bleed)"]
      },
      infrastructure: {
        title: "Reverse Proxy Phishing & Telegram C2",
        desc: "Evilginx2 phishing domains mirroring legitimate Okta/Microsoft login portals, Telegram C2 channels, and Starlink mobile gateways.",
        nodes: ["194.38.20.15", "sso-portal-login-verify.com", "okta-auth-reset.net"],
        protocols: ["HTTPS Evilginx Reverse Proxy", "Telegram API C2", "AnyDesk / TeamViewer RMM"]
      },
      victim: {
        title: "Fortune 500 Enterprises & Service Providers",
        desc: "Hospitality chains, retail payment processors, telecom carriers, and enterprise SaaS providers.",
        sectors: ["Hospitality & Gaming", "Telecommunications", "Enterprise SaaS"],
        regions: ["United States", "United Kingdom", "Canada"]
      }
    },
    iocs: [
      { type: "IP", value: "194.38.20.15", confidence: 97, firstSeen: "2026-09-20" },
      { type: "Domain", value: "sso-portal-login-verify.com", confidence: 99, firstSeen: "2026-09-23" },
      { type: "Domain", value: "okta-auth-reset.net", confidence: 95, firstSeen: "2026-09-25" }
    ]
  },
  {
    id: "lockbit",
    name: "LockBit 3.0 (LockBit Black)",
    aliases: ["Bitwise Spider"],
    origin: "eCrime / RaaS",
    motivation: "Financial / eCrime",
    targetSectors: ["Healthcare", "Manufacturing", "Financial", "Retail"],
    threatLevel: "HIGH",
    activeSince: "2019",
    description: "Prolific Ransomware-as-a-Service group utilizing double extortion, custom anti-analysis packers, and automated volume shadow copy destruction.",
    campaigns: [
      { year: "2022", name: "LockBit 3.0 Black Launch", impact: "Introduction of bug bounty program and anti-reversing defenses.", cves: ["Anti-Hooking"] },
      { year: "2024", name: "Operation Cronos Law Enforcement Seizure", impact: "Global takedown of infrastructure, followed by affiliate splinter re-emergence.", cves: ["Affiliate Leaks"] },
      { year: "2026", name: "LockBit 4.0 Quantum Multi-OS Encryptor", impact: "Deployment of cross-compiled Rust encryptors attacking ESXi hypervisors.", cves: ["CVE-2024-37085"] }
    ],
    ttpList: [
      { technique: "T1486", tactic: "Impact", name: "Data Encrypted for Impact", detectionRule: "sigma/ransomware_mass_file_renaming.yml" },
      { technique: "T1490", tactic: "Impact", name: "Inhibit System Recovery (vssadmin delete)", detectionRule: "sigma/vssadmin_shadow_deletion.yml" },
      { technique: "T1562.001", tactic: "Defense Evasion", name: "Disable Defender / EDR Services", detectionRule: "sigma/sc_stop_windefend.yml" }
    ],
    diamondModel: {
      adversary: {
        title: "LockBit Cartel & Core Developers",
        desc: "Commercial ransomware franchise offering 80/20 affiliate revenue splits and automated leak portals.",
        attribution: "RaaS Syndicates in Eastern Europe",
        confidence: "99% High Confidence"
      },
      capability: {
        title: "StealBit Exfiltration Engine & LB3 Encryptor",
        desc: "StealBit high-speed data exfiltration engine, LB3 multi-threaded encryptor with AES-256-GCM + RSA-4096.",
        weapons: ["StealBit", "LockBit 3.0 Black", "Cobalt Strike Beacons"],
        exploits: ["CVE-2023-4966", "CVE-2023-38831 (WinRAR)"]
      },
      infrastructure: {
        title: "Tor Hidden Services & Bulletproof Hosters",
        desc: "Tor .onion negotiation portals, bulletproof Swiss/Russian VPS nodes, and MEGA/DropBox exfiltration endpoints.",
        nodes: ["lockbitapt2...onion", "185.193.64.20", "data-exfil-node8.com"],
        protocols: ["Tor V3 Onion Services", "HTTPS MEGA API", "BitTorrent P2P"]
      },
      victim: {
        title: "Mid-to-Large Global Commercial Enterprises",
        desc: "Hospitals, manufacturing supply chains, critical food distributors, and financial institutions.",
        sectors: ["Healthcare & Hospitals", "Industrial Manufacturing", "Retail & Commerce"],
        regions: ["Global", "North America", "Europe", "Latin America"]
      }
    },
    iocs: [
      { type: "SHA256", value: "d58b73a90823485a73e4b7890123efab998124890123bcde4590123847581290", confidence: 99, firstSeen: "2026-09-10" },
      { type: "File", value: "Restore-My-Files.txt", confidence: 95, firstSeen: "2026-09-12" },
      { type: "Onion", value: "lockbitapt2...onion", confidence: 99, firstSeen: "2026-09-15" }
    ]
  }
];

export default function ThreatIntelPage() {
  const [selectedActor, setSelectedActor] = useState<ThreatActor>(THREAT_ACTORS[0]);
  const [searchFilter, setSearchFilter] = useState("");
  const [motivationFilter, setMotivationFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"diamond" | "matrix" | "campaigns" | "stix">("diamond");
  const [selectedDiamondVertex, setSelectedDiamondVertex] = useState<"adversary" | "capability" | "infrastructure" | "victim" | "core">("core");
  const [copiedStix, setCopiedStix] = useState(false);
  const [stixPushed, setStixPushed] = useState(false);

  const filteredActors = THREAT_ACTORS.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.aliases.some(alias => alias.toLowerCase().includes(searchFilter.toLowerCase())) ||
      a.origin.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesMotivation =
      motivationFilter === "ALL" ||
      a.motivation.toLowerCase().includes(motivationFilter.toLowerCase());
    return matchesSearch && matchesMotivation;
  });

  const generateStixBundle = () => {
    const stix = {
      type: "bundle",
      id: `bundle--${selectedActor.id}-${Date.now()}`,
      spec_version: "2.1",
      objects: [
        {
          type: "threat-actor",
          id: `threat-actor--${selectedActor.id}`,
          created: "2026-09-24T00:00:00.000Z",
          modified: new Date().toISOString(),
          name: selectedActor.name,
          description: selectedActor.description,
          aliases: selectedActor.aliases,
          threat_actor_types: [selectedActor.origin.toLowerCase()],
          sophistication: "advanced",
          primary_motivation: selectedActor.motivation.toLowerCase()
        },
        ...selectedActor.iocs.map(ioc => ({
          type: "indicator",
          id: `indicator--${Math.random().toString(36).substring(7)}`,
          pattern: `[${ioc.type.toLowerCase()}:value = '${ioc.value}']`,
          pattern_type: "stix",
          valid_from: new Date().toISOString(),
          confidence: ioc.confidence
        })),
        ...selectedActor.ttpList.map(ttp => ({
          type: "attack-pattern",
          id: `attack-pattern--${ttp.technique.replace(".", "-")}`,
          name: ttp.name,
          external_references: [
            {
              source_name: "mitre-attack",
              external_id: ttp.technique,
              url: `https://attack.mitre.org/techniques/${ttp.technique.replace(".", "/")}`
            }
          ]
        }))
      ]
    };
    return JSON.stringify(stix, null, 2);
  };

  const handleDownloadStix = () => {
    const bundle = generateStixBundle();
    const blob = new Blob([bundle], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `STIX2.1-${selectedActor.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyStix = () => {
    navigator.clipboard.writeText(generateStixBundle());
    setCopiedStix(true);
    setTimeout(() => setCopiedStix(false), 2000);
  };

  const handlePushToSIEM = () => {
    setStixPushed(true);
    setTimeout(() => setStixPushed(false), 3000);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#000000] text-neutral-100">
        {/* Header */}
        <header className="h-16 border-b border-[#262626] bg-[#050505]/95 px-6 flex items-center justify-between flex-shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Threat Actor & Campaign Intelligence Hub
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-mono font-normal">
                  STIX 2.1 / TAXII Ready
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-normal">
                  MITRE v15
                </span>
              </h1>
              <p className="text-[11px] text-neutral-400 font-mono">
                Adversary tradecraft profiling, Diamond Model correlation & automated indicator extraction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("socforge-open-copilot", {
                      detail: { prompt: `Analyze active CTI campaigns and Diamond Model for ${selectedActor.name}` }
                    })
                  );
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-[#262626] transition font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>AI CTI Synthesizer</span>
            </button>

            <button
              onClick={handleDownloadStix}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-[#262626] transition font-bold"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export STIX 2.1
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Threat Actor Catalog (Sidebar) */}
          <div className="w-80 border-r border-[#262626] bg-[#050505] flex flex-col overflow-y-auto p-3 space-y-2.5 flex-shrink-0">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search threat actors, aliases, origin..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#0A0A0A] border border-[#262626] rounded-xl text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-white transition"
              />
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2" />
            </div>

            {/* Motivation Filters */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {["ALL", "Espionage", "Sabotage", "Financial"].map((mot) => (
                <button
                  key={mot}
                  onClick={() => setMotivationFilter(mot)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition ${
                    motivationFilter === mot
                      ? "bg-white text-black font-bold"
                      : "bg-[#0A0A0A] text-neutral-400 hover:text-white border border-[#262626]"
                  }`}
                >
                  {mot}
                </button>
              ))}
            </div>

            {/* Actor List */}
            <div className="space-y-2 flex-1">
              {filteredActors.map((actor) => {
                const isSelected = selectedActor.id === actor.id;
                return (
                  <div
                    key={actor.id}
                    onClick={() => {
                      setSelectedActor(actor);
                      setSelectedDiamondVertex("core");
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? "border-red-500 bg-[#121212] shadow-md shadow-red-500/10"
                        : "border-[#262626] bg-[#0A0A0A] hover:border-neutral-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        {actor.threatLevel}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Since {actor.activeSince}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-white line-clamp-1">{actor.name}</h3>

                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1 border-t border-[#262626]">
                      <span className="text-neutral-500">{actor.origin}</span>
                      <span className="text-emerald-400 font-bold">{actor.motivation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Stage & Workspace */}
          <div className="flex-1 flex flex-col bg-[#000000] overflow-y-auto p-6 space-y-6">
            {/* Threat Group Banner */}
            <div className="p-6 rounded-2xl bg-[#050505] border border-[#262626] space-y-4 relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      {selectedActor.threatLevel} THREAT
                    </span>
                    <span className="text-xs font-mono text-neutral-300">
                      Origin: <strong className="text-white">{selectedActor.origin}</strong>
                    </span>
                    <span className="text-xs font-mono text-neutral-300">
                      Motivation: <strong className="text-emerald-400">{selectedActor.motivation}</strong>
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white tracking-tight">{selectedActor.name}</h2>
                  <p className="text-xs text-neutral-400 max-w-3xl leading-relaxed">
                    {selectedActor.description}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#262626] font-mono text-xs space-y-1.5 lg:w-72 flex-shrink-0">
                  <div className="text-neutral-400 uppercase text-[10px]">Target Industry Sectors</div>
                  <div className="font-bold text-white text-xs leading-snug">
                    {selectedActor.targetSectors.join(", ")}
                  </div>
                  <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-[10px]">
                    <span className="text-neutral-500">Known Aliases:</span>
                    <span className="text-neutral-300 truncate max-w-[140px]">{selectedActor.aliases.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Studio Workspace Sub-Tabs */}
            <div className="flex items-center gap-3 border-b border-[#262626] pb-1 text-xs font-mono">
              <button
                onClick={() => setActiveTab("diamond")}
                className={`py-2 px-3 rounded-lg flex items-center gap-2 font-semibold transition ${
                  activeTab === "diamond"
                    ? "bg-white text-black font-bold shadow-md"
                    : "text-neutral-400 hover:text-white hover:bg-[#0A0A0A]"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-red-500" />
                Interactive Diamond Model
              </button>

              <button
                onClick={() => setActiveTab("matrix")}
                className={`py-2 px-3 rounded-lg flex items-center gap-2 font-semibold transition ${
                  activeTab === "matrix"
                    ? "bg-white text-black font-bold shadow-md"
                    : "text-neutral-400 hover:text-white hover:bg-[#0A0A0A]"
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                MITRE ATT&CK Matrix ({selectedActor.ttpList.length} TTPs)
              </button>

              <button
                onClick={() => setActiveTab("campaigns")}
                className={`py-2 px-3 rounded-lg flex items-center gap-2 font-semibold transition ${
                  activeTab === "campaigns"
                    ? "bg-white text-black font-bold shadow-md"
                    : "text-neutral-400 hover:text-white hover:bg-[#0A0A0A]"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Campaign History ({selectedActor.campaigns.length})
              </button>

              <button
                onClick={() => setActiveTab("stix")}
                className={`py-2 px-3 rounded-lg flex items-center gap-2 font-semibold transition ${
                  activeTab === "stix"
                    ? "bg-white text-black font-bold shadow-md"
                    : "text-neutral-400 hover:text-white hover:bg-[#0A0A0A]"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-purple-400" />
                STIX 2.1 & TAXII Feed
              </button>
            </div>

            {/* TAB 1: INTERACTIVE DIAMOND MODEL */}
            {activeTab === "diamond" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Intrusion Topology & 4-Vertex Diamond ({selectedActor.name})
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-500">
                    Click any vertex node to inspect correlated intelligence
                  </span>
                </div>

                {/* Professional Diamond Model Visualizer */}
                <div className="relative rounded-2xl bg-[#050505] border border-[#262626] shadow-2xl overflow-hidden">
                  {/* Model Header & Explanatory Legend */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-[#1f1f1f] bg-[#080808]">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white tracking-wide">Diamond Model of Intrusion Analysis</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 font-mono">
                            Caltagirone et al. Standard
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-500 font-mono">
                          Vertical Socio-Political intent aligned with Horizontal Technical execution
                        </p>
                      </div>
                    </div>

                    {/* Quick Vertex Focus Filter */}
                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      {[
                        { id: "core", label: "Intrusion", color: "text-red-400 bg-red-500/10 border-red-500/30" },
                        { id: "adversary", label: "Adversary (Who)", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
                        { id: "capability", label: "Capability (How)", color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
                        { id: "infrastructure", label: "Infrastructure (Where)", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
                        { id: "victim", label: "Victim (Whom)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" }
                      ].map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedDiamondVertex(v.id as any)}
                          className={`px-2.5 py-1 rounded-lg border transition ${
                            selectedDiamondVertex === v.id
                              ? `${v.color} font-bold shadow-sm`
                              : "border-[#262626] bg-[#0a0a0a] text-neutral-400 hover:text-white"
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Diamond Diagram Canvas */}
                  <div className="relative px-6 py-8" style={{ minHeight: 520 }}>
                    {/* Background Matrix Grid */}
                    <div
                      className="absolute inset-0 opacity-[0.03] pointer-events-none"
                      style={{
                        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                        backgroundSize: "28px 28px"
                      }}
                    />

                    {/* SVG Connector Layer */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: 520 }}>
                      <defs>
                        <linearGradient id="line-adv-cap" x1="50%" y1="18%" x2="22%" y2="50%">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="line-adv-inf" x1="50%" y1="18%" x2="78%" y2="50%">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="line-cap-vic" x1="22%" y1="50%" x2="50%" y2="82%">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="line-inf-vic" x1="78%" y1="50%" x2="50%" y2="82%">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>

                      {/* Diamond Perimeter Lines */}
                      <line x1="50%" y1="18%" x2="20%" y2="50%" stroke="url(#line-adv-cap)" strokeWidth="1.5" strokeDasharray="5,4" />
                      <line x1="50%" y1="18%" x2="80%" y2="50%" stroke="url(#line-adv-inf)" strokeWidth="1.5" strokeDasharray="5,4" />
                      <line x1="20%" y1="50%" x2="50%" y2="82%" stroke="url(#line-cap-vic)" strokeWidth="1.5" strokeDasharray="5,4" />
                      <line x1="80%" y1="50%" x2="50%" y2="82%" stroke="url(#line-inf-vic)" strokeWidth="1.5" strokeDasharray="5,4" />

                      {/* Central Cross Axes */}
                      {/* Vertical: Socio-Political Axis */}
                      <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="#262626" strokeWidth="1" strokeDasharray="3,3" />
                      {/* Horizontal: Technical Axis */}
                      <line x1="22%" y1="50%" x2="78%" y2="50%" stroke="#262626" strokeWidth="1" strokeDasharray="3,3" />
                    </svg>

                    {/* Edge Relationship Badges (Absolute positioned for crystal clarity) */}
                    {/* Top-Left: EMPLOYS */}
                    <div className="absolute top-[28%] left-[28%] -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="px-2 py-0.5 rounded-full bg-[#0a0a0a]/95 border border-amber-500/40 text-[9px] font-mono font-bold text-amber-400 shadow-md backdrop-blur-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        EMPLOYS
                      </div>
                    </div>

                    {/* Top-Right: OPERATES */}
                    <div className="absolute top-[28%] right-[28%] translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="px-2 py-0.5 rounded-full bg-[#0a0a0a]/95 border border-purple-500/40 text-[9px] font-mono font-bold text-purple-400 shadow-md backdrop-blur-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        OPERATES
                      </div>
                    </div>

                    {/* Bottom-Left: EXPLOITS */}
                    <div className="absolute bottom-[28%] left-[28%] -translate-x-1/2 translate-y-1/2 z-10">
                      <div className="px-2 py-0.5 rounded-full bg-[#0a0a0a]/95 border border-sky-500/40 text-[9px] font-mono font-bold text-sky-400 shadow-md backdrop-blur-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        EXPLOITS
                      </div>
                    </div>

                    {/* Bottom-Right: DELIVERS */}
                    <div className="absolute bottom-[28%] right-[28%] translate-x-1/2 translate-y-1/2 z-10">
                      <div className="px-2 py-0.5 rounded-full bg-[#0a0a0a]/95 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-400 shadow-md backdrop-blur-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        DELIVERS
                      </div>
                    </div>

                    {/* Axis Labels */}
                    <div className="absolute top-[37%] left-[50%] -translate-x-1/2 z-10 pointer-events-none">
                      <span className="text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-black/80 border border-[#222] text-neutral-500">
                        ↕ Socio-Political Axis
                      </span>
                    </div>
                    <div className="absolute top-[50%] left-[34%] -translate-y-1/2 z-10 pointer-events-none">
                      <span className="text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-black/80 border border-[#222] text-neutral-500">
                        Technical Axis ↔
                      </span>
                    </div>

                    {/* ─── VERTEX 1: ADVERSARY (Top) ─── */}
                    <div className="flex justify-center mb-6 relative z-20">
                      <div
                        onClick={() => setSelectedDiamondVertex("adversary")}
                        className={`w-80 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${
                          selectedDiamondVertex === "adversary"
                            ? "border-amber-500 bg-[#140f06] shadow-xl shadow-amber-500/20 ring-1 ring-amber-500/50"
                            : "border-[#262626] bg-[#0A0A0A] hover:border-amber-500/50 hover:bg-[#0d0a05]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                              <User className="w-4 h-4 text-amber-400" />
                            </div>
                            <div>
                              <div className="text-[9px] font-mono text-amber-500/80 uppercase tracking-widest font-bold">1. Adversary</div>
                              <div className="text-xs font-bold text-white leading-tight">WHO? Threat Actor</div>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {selectedActor.origin}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-200 font-semibold leading-snug line-clamp-1">
                          {selectedActor.diamondModel.adversary.title}
                        </p>
                        <div className="text-[10px] text-neutral-500 mt-1 flex items-center justify-between border-t border-[#1f1f1f] pt-1">
                          <span>Motivation: <strong className="text-neutral-300">{selectedActor.motivation}</strong></span>
                          <span className="text-amber-400/90 font-mono">{selectedActor.diamondModel.adversary.confidence}</span>
                        </div>
                      </div>
                    </div>

                    {/* ─── MIDDLE ROW: CAPABILITY — INTRUSION CORE — INFRASTRUCTURE ─── */}
                    <div className="flex items-center justify-between gap-4 my-2 relative z-20">
                      {/* VERTEX 2: CAPABILITY (Left) */}
                      <div
                        onClick={() => setSelectedDiamondVertex("capability")}
                        className={`w-72 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${
                          selectedDiamondVertex === "capability"
                            ? "border-sky-400 bg-[#061017] shadow-xl shadow-sky-400/20 ring-1 ring-sky-400/50"
                            : "border-[#262626] bg-[#0A0A0A] hover:border-sky-400/50 hover:bg-[#060c12]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-sky-400/10 border border-sky-400/30 flex items-center justify-center">
                              <Zap className="w-4 h-4 text-sky-400" />
                            </div>
                            <div>
                              <div className="text-[9px] font-mono text-sky-400/80 uppercase tracking-widest font-bold">2. Capability</div>
                              <div className="text-xs font-bold text-white leading-tight">HOW? Weapons & TTPs</div>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-400/10 text-sky-300 border border-sky-500/30">
                            {selectedActor.ttpList.length} TTPs
                          </span>
                        </div>
                        <p className="text-xs text-neutral-200 font-semibold leading-snug line-clamp-1">
                          {selectedActor.diamondModel.capability.title}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2 pt-1.5 border-t border-[#1f1f1f]">
                          {selectedActor.diamondModel.capability.weapons.slice(0, 3).map((w) => (
                            <span key={w} className="px-1.5 py-0.5 rounded text-[9px] bg-sky-500/10 text-sky-300 border border-sky-500/20 font-mono">
                              {w}
                            </span>
                          ))}
                          {selectedActor.diamondModel.capability.weapons.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] text-neutral-500 font-mono">
                              +{selectedActor.diamondModel.capability.weapons.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* INTRUSION CORE NODE (Center) */}
                      <div
                        onClick={() => setSelectedDiamondVertex("core")}
                        className={`flex-shrink-0 w-32 h-32 rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-center transition-all duration-200 select-none ${
                          selectedDiamondVertex === "core"
                            ? "border-red-500 bg-[#150505] shadow-2xl shadow-red-500/30 ring-2 ring-red-500/60"
                            : "border-[#333] bg-[#0A0A0A] hover:border-red-500/60 hover:bg-[#100707]"
                        }`}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-red-500 mb-1 animate-pulse" style={{ boxShadow: "0 0 10px rgba(239,68,68,0.7)" }} />
                        <span className="text-[8px] font-mono text-red-400/80 uppercase tracking-widest font-bold">Intrusion Core</span>
                        <span className="text-xs font-mono text-white font-bold tracking-tight">
                          {selectedActor.id.toUpperCase().replace("-", " ")}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 mt-1 font-bold">
                          {selectedActor.threatLevel}
                        </span>
                        <span className="text-[8px] font-mono text-neutral-500 mt-1">Active Since {selectedActor.activeSince}</span>
                      </div>

                      {/* VERTEX 3: INFRASTRUCTURE (Right) */}
                      <div
                        onClick={() => setSelectedDiamondVertex("infrastructure")}
                        className={`w-72 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${
                          selectedDiamondVertex === "infrastructure"
                            ? "border-purple-500 bg-[#120617] shadow-xl shadow-purple-500/20 ring-1 ring-purple-500/50"
                            : "border-[#262626] bg-[#0A0A0A] hover:border-purple-500/50 hover:bg-[#0e0614]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                              <Server className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <div className="text-[9px] font-mono text-purple-400/80 uppercase tracking-widest font-bold">3. Infrastructure</div>
                              <div className="text-xs font-bold text-white leading-tight">WHERE? C2 & Nodes</div>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                            {selectedActor.diamondModel.infrastructure.protocols[0] || "TLS"}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-200 font-semibold leading-snug line-clamp-1">
                          {selectedActor.diamondModel.infrastructure.title}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2 pt-1.5 border-t border-[#1f1f1f]">
                          {selectedActor.diamondModel.infrastructure.nodes.slice(0, 2).map((n) => (
                            <span key={n} className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                              {n}
                            </span>
                          ))}
                          {selectedActor.diamondModel.infrastructure.nodes.length > 2 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] text-neutral-500 font-mono">
                              +{selectedActor.diamondModel.infrastructure.nodes.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ─── VERTEX 4: VICTIM (Bottom) ─── */}
                    <div className="flex justify-center mt-6 relative z-20">
                      <div
                        onClick={() => setSelectedDiamondVertex("victim")}
                        className={`w-80 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${
                          selectedDiamondVertex === "victim"
                            ? "border-emerald-500 bg-[#05140b] shadow-xl shadow-emerald-500/20 ring-1 ring-emerald-500/50"
                            : "border-[#262626] bg-[#0A0A0A] hover:border-emerald-500/50 hover:bg-[#06110a]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                              <Target className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                              <div className="text-[9px] font-mono text-emerald-500/80 uppercase tracking-widest font-bold">4. Victim</div>
                              <div className="text-xs font-bold text-white leading-tight">WHOM? Targeted Assets</div>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                            {selectedActor.diamondModel.victim.regions[0] || "Global"}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-200 font-semibold leading-snug line-clamp-1">
                          {selectedActor.diamondModel.victim.title}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2 pt-1.5 border-t border-[#1f1f1f]">
                          {selectedActor.diamondModel.victim.sectors.slice(0, 3).map((s) => (
                            <span key={s} className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Vertex Detail Drawer / Guidance Footer */}
                  <div className="px-6 py-3 border-t border-[#1f1f1f] bg-[#080808] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-neutral-400">
                      <span className="text-white font-bold uppercase">Focus:</span>
                      <span className="capitalize text-emerald-400 font-bold">{selectedDiamondVertex}</span>
                      <span className="text-neutral-600">|</span>
                      <span className="text-neutral-400 text-[11px]">
                        {selectedDiamondVertex === "adversary" && `Attribution: ${selectedActor.diamondModel.adversary.attribution}`}
                        {selectedDiamondVertex === "capability" && `Exploits: ${selectedActor.diamondModel.capability.exploits.join(", ")}`}
                        {selectedDiamondVertex === "infrastructure" && `Protocols: ${selectedActor.diamondModel.infrastructure.protocols.join(", ")}`}
                        {selectedDiamondVertex === "victim" && `Impacted Regions: ${selectedActor.diamondModel.victim.regions.join(", ")}`}
                        {selectedDiamondVertex === "core" && `Full Intrusion Event: ${selectedActor.name} (${selectedActor.campaigns.length} Recorded Campaigns)`}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          window.dispatchEvent(
                            new CustomEvent("socforge-open-copilot", {
                              detail: {
                                prompt: `Provide deep Diamond Model threat intelligence and MITRE correlation for ${selectedActor.name}, focusing on the ${selectedDiamondVertex.toUpperCase()} vertex.`
                              }
                            })
                          );
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white border border-[#262626] transition text-[11px] font-bold"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-red-400" />
                      <span>Synthesize {selectedDiamondVertex.toUpperCase()}</span>
                    </button>
                  </div>
                </div>

                {/* Vertex Deep Inspector Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                  {/* Card 1: Adversary */}
                  <div
                    onClick={() => setSelectedDiamondVertex("adversary")}
                    className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                      selectedDiamondVertex === "adversary"
                        ? "bg-[#100c05] border-amber-500 shadow-lg shadow-amber-500/10"
                        : "bg-[#050505] border-[#262626] hover:border-amber-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        1. ADVERSARY (MOTIVATION & IDENTITY)
                      </span>
                      <span className="text-[10px] text-amber-300/80">
                        {selectedActor.diamondModel.adversary.confidence}
                      </span>
                    </div>
                    <p className="text-white font-bold">{selectedActor.diamondModel.adversary.title}</p>
                    <p className="text-neutral-400 text-[11px]">{selectedActor.diamondModel.adversary.desc}</p>
                    <div className="text-[10px] text-neutral-500 pt-1 border-t border-[#262626]">
                      Attribution: <span className="text-neutral-300">{selectedActor.diamondModel.adversary.attribution}</span>
                    </div>
                  </div>

                  {/* Card 2: Capability */}
                  <div
                    onClick={() => setSelectedDiamondVertex("capability")}
                    className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                      selectedDiamondVertex === "capability"
                        ? "bg-[#050a10] border-sky-400 shadow-lg shadow-sky-400/10"
                        : "bg-[#050505] border-[#262626] hover:border-sky-400/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sky-400 font-bold uppercase flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-sky-300" />
                        2. CAPABILITY (WEAPONRY & TTPS)
                      </span>
                      <span className="text-[10px] text-sky-300/80">Custom Tooling</span>
                    </div>
                    <p className="text-white font-bold">{selectedActor.diamondModel.capability.title}</p>
                    <p className="text-neutral-400 text-[11px]">{selectedActor.diamondModel.capability.desc}</p>
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-[#262626]">
                      {selectedActor.diamondModel.capability.weapons.map((w) => (
                        <span key={w} className="px-1.5 py-0.5 rounded bg-sky-400/10 text-sky-300 border border-sky-500/30 text-[10px]">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Infrastructure */}
                  <div
                    onClick={() => setSelectedDiamondVertex("infrastructure")}
                    className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                      selectedDiamondVertex === "infrastructure"
                        ? "bg-[#0c0512] border-purple-500 shadow-lg shadow-purple-500/10"
                        : "bg-[#050505] border-[#262626] hover:border-purple-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-bold uppercase flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5" />
                        3. INFRASTRUCTURE (C2 & NETWORKS)
                      </span>
                      <span className="text-[10px] text-purple-300/80">Proxy Mesh</span>
                    </div>
                    <p className="text-white font-bold">{selectedActor.diamondModel.infrastructure.title}</p>
                    <p className="text-neutral-400 text-[11px]">{selectedActor.diamondModel.infrastructure.desc}</p>
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-[#262626]">
                      {selectedActor.diamondModel.infrastructure.nodes.map((n) => (
                        <span key={n} className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px]">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card 4: Victim */}
                  <div
                    onClick={() => setSelectedDiamondVertex("victim")}
                    className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                      selectedDiamondVertex === "victim"
                        ? "bg-[#051009] border-emerald-500 shadow-lg shadow-emerald-500/10"
                        : "bg-[#050505] border-[#262626] hover:border-emerald-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        4. VICTIM (IMPACTED TARGETS)
                      </span>
                      <span className="text-[10px] text-emerald-300/80">Target Persona</span>
                    </div>
                    <p className="text-white font-bold">{selectedActor.diamondModel.victim.title}</p>
                    <p className="text-neutral-400 text-[11px]">{selectedActor.diamondModel.victim.desc}</p>
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-[#262626]">
                      {selectedActor.diamondModel.victim.sectors.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MITRE ATT&CK MATRIX */}
            {activeTab === "matrix" && (
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Observed MITRE ATT&CK Enterprise Techniques & Detection Signatures
                  </h3>
                  <span className="text-[10px] text-neutral-400">
                    Integrated with SOCForge Sigma / KQL Rule Engine
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedActor.ttpList.map((ttp) => (
                    <div
                      key={ttp.technique}
                      className="p-4 rounded-xl bg-[#050505] border border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                            {ttp.technique}
                          </span>
                          <span className="text-white font-bold text-sm">{ttp.name}</span>
                        </div>
                        <div className="text-neutral-400 text-[11px]">
                          MITRE Tactic: <strong className="text-neutral-200 uppercase">{ttp.tactic}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-500 block">Validated Detection Rule</span>
                          <span className="text-white text-[11px] font-mono">{ttp.detectionRule}</span>
                        </div>
                        <a
                          href={`https://attack.mitre.org/techniques/${ttp.technique.replace(".", "/")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-[#0A0A0A] hover:bg-[#171717] border border-[#262626] text-neutral-300 hover:text-white transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: CAMPAIGNS TIMELINE */}
            {activeTab === "campaigns" && (
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Major Historical & Active Threat Campaigns ({selectedActor.name})
                  </h3>
                  <span className="text-[10px] text-neutral-400">Chronological CTI Dossier</span>
                </div>

                <div className="relative border-l border-[#262626] ml-4 pl-6 space-y-6">
                  {selectedActor.campaigns.map((camp, idx) => (
                    <div key={idx} className="relative space-y-2">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#000] border-2 border-amber-400" />
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          {camp.year}
                        </span>
                        <h4 className="text-sm font-bold text-white">{camp.name}</h4>
                      </div>
                      <p className="text-neutral-300 text-[11px] leading-relaxed">
                        {camp.impact}
                      </p>
                      {camp.cves && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-neutral-500">Related CVEs / TTPs:</span>
                          {camp.cves.map((cve) => (
                            <span key={cve} className="px-1.5 py-0.2 rounded bg-neutral-900 text-red-400 border border-[#262626] text-[10px]">
                              {cve}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: STIX 2.1 & TAXII INSPECTOR */}
            {activeTab === "stix" && (
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    OASIS STIX 2.1 JSON Schema Bundle & TAXII Server Payload
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyStix}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0A0A0A] hover:bg-[#171717] border border-[#262626] text-white transition"
                    >
                      {copiedStix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedStix ? "Copied!" : "Copy JSON"}
                    </button>

                    <button
                      onClick={handlePushToSIEM}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-black font-bold transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {stixPushed ? "✓ Pushed to SIEM" : "Push to SIEM Feeds"}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#050505] border border-[#262626]">
                  <pre className="text-[11px] text-neutral-200 overflow-x-auto whitespace-pre-wrap max-h-[400px]">
                    {generateStixBundle()}
                  </pre>
                </div>
              </div>
            )}

            {/* Attributed IOC Feed */}
            <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500" />
                  Attributed Indicators of Compromise (IOC Feed & Zero-Pivot Enrichment)
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {selectedActor.iocs.length} High-Confidence IOCs Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedActor.iocs.map((ioc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-between gap-3 hover:border-neutral-500 transition"
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-400 uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30">
                          {ioc.type}
                        </span>
                        <span className="text-[10px] text-neutral-500">First Seen: {ioc.firstSeen}</span>
                      </div>
                      <div className="text-white font-mono truncate text-[11px]">
                        <IocHoverCard value={ioc.value} className="text-neutral-100 font-bold hover:underline" />
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-emerald-400 text-xs font-bold block">
                        {ioc.confidence}%
                      </span>
                      <span className="text-[9px] text-neutral-500 uppercase">Confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
