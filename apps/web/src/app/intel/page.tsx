"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
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
  AlertTriangle
} from "lucide-react";

interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  targetSectors: string[];
  threatLevel: "CRITICAL" | "HIGH" | "MEDIUM";
  activeSince: string;
  description: string;
  ttpList: { technique: string; tactic: string; name: string }[];
  diamondModel: {
    adversary: string;
    capability: string;
    infrastructure: string;
    victim: string;
  };
  iocs: { type: string; value: string; confidence: number }[];
}

const THREAT_ACTORS: ThreatActor[] = [
  {
    id: "apt29",
    name: "APT29 (Cozy Bear / Midnight Blizzard)",
    aliases: ["Nobelium", "Midnight Blizzard", "The Dukes"],
    origin: "State-Sponsored",
    targetSectors: ["Government", "Defense", "Think Tanks", "Cloud Providers"],
    threatLevel: "CRITICAL",
    activeSince: "2008",
    description: "Highly sophisticated threat actor focusing on strategic espionage, supply chain compromise, and cloud token replay attacks (OAuth consent abuse, token extraction).",
    ttpList: [
      { technique: "T1195.002", tactic: "Initial Access", name: "Compromise Software Supply Chain" },
      { technique: "T1003.001", tactic: "Credential Access", name: "LSASS Memory Dump" },
      { technique: "T1098.005", tactic: "Persistence", name: "Device Registration Modification" },
      { technique: "T1566.002", tactic: "Initial Access", name: "Spearphishing Link" }
    ],
    diamondModel: {
      adversary: "Foreign Intelligence Service (SVR-aligned operational group)",
      capability: "Custom implants (WellMess, GoldFinder), OAuth token exfiltration scripts, DLL sideloading",
      infrastructure: "Compromised residential proxy networks, bulletproof VPS nodes, legitimate cloud SaaS abuse",
      victim: "Global government ministries, cybersecurity vendors, military defense contractors"
    },
    iocs: [
      { type: "IP", value: "185.220.101.5", confidence: 98 },
      { type: "Domain", value: "cloud-sync-telemetry.org", confidence: 95 },
      { type: "SHA256", value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", confidence: 90 },
      { type: "Certificate", value: "SolarWinds.Orion.Core.BusinessLayer.dll", confidence: 99 }
    ]
  },
  {
    id: "volt-typhoon",
    name: "Volt Typhoon (Bronze Silhouette)",
    aliases: ["Vanguard Panda", "Insidious Taurus"],
    origin: "State-Sponsored",
    targetSectors: ["Critical Infrastructure", "Energy", "Telecommunications", "Maritime"],
    threatLevel: "CRITICAL",
    activeSince: "2021",
    description: "Living-off-the-land (LOTL) specialist focusing on pre-positioning within critical infrastructure using compromised SOHO routers and native Windows administrative tools.",
    ttpList: [
      { technique: "T1059.001", tactic: "Execution", name: "PowerShell & WMI LOTL" },
      { technique: "T1047", tactic: "Execution", name: "Windows Management Instrumentation" },
      { technique: "T1136.001", tactic: "Persistence", name: "Local Account Creation" },
      { technique: "T1078.002", tactic: "Defense Evasion", name: "Domain Accounts Abuse" }
    ],
    diamondModel: {
      adversary: "People's Liberation Army / MSS Strategic Support unit",
      capability: "KV-Botnet SOHO proxies, Fast Reverse Proxy (FRP), ntdsutil credential extractions",
      infrastructure: "Infected Cisco, Fortinet, and Netgear edge routers as relay jump-hosts",
      victim: "US and allied power grids, municipal water facilities, telecommunications carriers"
    },
    iocs: [
      { type: "IP", value: "45.154.255.89", confidence: 94 },
      { type: "Domain", value: "router-firmware-update.net", confidence: 92 },
      { type: "UserAgent", value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) FRP/0.48", confidence: 88 }
    ]
  },
  {
    id: "lockbit",
    name: "LockBit 3.0 (LockBit Black)",
    aliases: ["Bitwise Spider"],
    origin: "eCrime / RaaS",
    targetSectors: ["Healthcare", "Manufacturing", "Financial", "Retail"],
    threatLevel: "HIGH",
    activeSince: "2019",
    description: "Prolific Ransomware-as-a-Service group utilizing double extortion, custom anti-analysis packers, and automated volume shadow copy destruction.",
    ttpList: [
      { technique: "T1486", tactic: "Impact", name: "Data Encrypted for Impact" },
      { technique: "T1490", tactic: "Impact", name: "Inhibit System Recovery (vssadmin delete shadows)" },
      { technique: "T1562.001", tactic: "Defense Evasion", name: "Disable Defender / EDR Services" }
    ],
    diamondModel: {
      adversary: "LockBit Cartel & Core Developers",
      capability: "StealBit data exfiltration tool, LB3 encryptor with AES-256-GCM + RSA-4096",
      infrastructure: "Tor hidden services (.onion negotiation portals), MEGA/DropBox exfiltration endpoints",
      victim: "Mid-to-large enterprise corporations across North America and Europe"
    },
    iocs: [
      { type: "SHA256", value: "d58b73a90823485a73e4b7890123efab998124890123bcde4590123847581290", confidence: 99 },
      { type: "File", value: "Restore-My-Files.txt", confidence: 95 },
      { type: "Onion", value: "lockbitapt2...onion", confidence: 99 }
    ]
  }
];

export default function ThreatIntelPage() {
  const [selectedActor, setSelectedActor] = useState<ThreatActor>(THREAT_ACTORS[0]);
  const [searchFilter, setSearchFilter] = useState("");
  const [copiedStix, setCopiedStix] = useState(false);

  const filteredActors = THREAT_ACTORS.filter(a =>
    a.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    a.aliases.some(alias => alias.toLowerCase().includes(searchFilter.toLowerCase()))
  );

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
          sophistication: "advanced"
        },
        ...selectedActor.iocs.map(ioc => ({
          type: "indicator",
          id: `indicator--${Math.random().toString(36).substring(7)}`,
          pattern: `[${ioc.type.toLowerCase()}:value = '${ioc.value}']`,
          pattern_type: "stix",
          valid_from: new Date().toISOString(),
          confidence: ioc.confidence
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

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B1020] text-[#F8FAFC]">
        {/* Header */}
        <header className="h-16 border-b border-[#263248] bg-[#0E1626] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                Threat Actor & Campaign Intelligence Hub
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-mono font-normal">
                  STIX 2.1 / TAXII Ready
                </span>
              </h1>
              <p className="text-[11px] text-[#64748B] font-mono">
                Adversary tradecraft profiling, Diamond Model correlation & automated indicator extraction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={handleDownloadStix}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export STIX 2.1 Bundle
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Threat Actor Catalog */}
          <div className="w-80 border-r border-[#263248] bg-[#0E1626]/50 flex flex-col overflow-y-auto p-3 space-y-2 flex-shrink-0">
            <div className="relative mb-1">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search threat actors or aliases..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#070C18] border border-[#263248] rounded-lg text-xs font-mono text-white placeholder-[#64748B] focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2" />
            </div>

            {filteredActors.map((actor) => {
              const isSelected = selectedActor.id === actor.id;
              return (
                <div
                  key={actor.id}
                  onClick={() => setSelectedActor(actor)}
                  className={`p-3 rounded-xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? "border-red-500 bg-[#172033] shadow-md shadow-red-500/10"
                      : "border-[#263248] bg-[#0E1626] hover:border-red-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      {actor.threatLevel}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      Active: {actor.activeSince}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white line-clamp-1">{actor.name}</h3>
                  <div className="text-[10px] font-mono text-[#94A3B8] truncate">
                    Aliases: {actor.aliases.join(", ")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Adversary Profile & Diamond Model */}
          <div className="flex-1 flex flex-col bg-[#0B1020] overflow-y-auto p-6 space-y-6">
            {/* Header Banner */}
            <div className="p-6 rounded-2xl bg-[#0E1626] border border-[#263248] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      {selectedActor.threatLevel} THREAT
                    </span>
                    <span className="text-xs font-mono text-[#94A3B8]">Origin: {selectedActor.origin}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedActor.name}</h2>
                  <p className="text-xs text-[#94A3B8] mt-1 max-w-3xl leading-relaxed">
                    {selectedActor.description}
                  </p>
                </div>

                <div className="text-right font-mono text-xs text-[#64748B]">
                  <div>Target Industries</div>
                  <div className="font-bold text-white">{selectedActor.targetSectors.join(", ")}</div>
                </div>
              </div>
            </div>

            {/* Adversary Diamond Model Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold">
                Adversary Diamond Model Correlation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#0E1626] border border-amber-500/30 space-y-1">
                  <span className="text-amber-400 font-bold uppercase block">1. ADVERSARY (MOTIVATION & IDENTITY)</span>
                  <p className="text-white text-[11px]">{selectedActor.diamondModel.adversary}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#0E1626] border border-blue-500/30 space-y-1">
                  <span className="text-blue-400 font-bold uppercase block">2. CAPABILITY (WEAPONRY & TTPS)</span>
                  <p className="text-white text-[11px]">{selectedActor.diamondModel.capability}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#0E1626] border border-purple-500/30 space-y-1">
                  <span className="text-purple-400 font-bold uppercase block">3. INFRASTRUCTURE (C2 & NETWORKS)</span>
                  <p className="text-white text-[11px]">{selectedActor.diamondModel.infrastructure}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#0E1626] border border-emerald-500/30 space-y-1">
                  <span className="text-emerald-400 font-bold uppercase block">4. VICTIM (IMPACTED TARGETS)</span>
                  <p className="text-white text-[11px]">{selectedActor.diamondModel.victim}</p>
                </div>
              </div>
            </div>

            {/* Observed MITRE TTPs & IOC Observables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* MITRE TTPs */}
              <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-3 font-mono text-xs">
                <h3 className="font-bold text-white uppercase tracking-wider">
                  Observed MITRE ATT&CK Techniques
                </h3>
                <div className="space-y-2">
                  {selectedActor.ttpList.map((ttp) => (
                    <div key={ttp.technique} className="p-2.5 rounded-lg bg-[#0B1020] border border-[#263248] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[#38BDF8] font-bold">{ttp.technique}</span>
                        <span className="text-white">{ttp.name}</span>
                      </div>
                      <span className="text-[10px] text-[#64748B] uppercase">{ttp.tactic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified IOC Indicators */}
              <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-3 font-mono text-xs">
                <h3 className="font-bold text-white uppercase tracking-wider">
                  Attributed IOC Feed ({selectedActor.iocs.length} Active Indicators)
                </h3>
                <div className="space-y-2">
                  {selectedActor.iocs.map((ioc, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#0B1020] border border-[#263248] flex items-center justify-between">
                      <div className="space-y-0.5 truncate max-w-[240px]">
                        <span className="text-[10px] text-amber-400 uppercase font-bold block">{ioc.type}</span>
                        <span className="text-white font-mono truncate block text-[11px]">{ioc.value}</span>
                      </div>
                      <span className="text-emerald-400 text-[10px] font-bold">
                        {ioc.confidence}% Confidence
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
